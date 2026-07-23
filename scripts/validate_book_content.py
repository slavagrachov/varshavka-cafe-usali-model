#!/usr/bin/env python3
"""Validate public book structure and external links before publication.

Checks:
1. A Markdown heading must not repeat the normalized text of an ancestor heading.
2. A MyST TOC child label must not repeat its immediate parent label.
3. Every external HTTP(S) URL rendered from book Markdown/YAML must be reachable.
4. Legacy display-math delimiters are forbidden because the current MyST
   configuration displays them as raw source text.

The script uses only the Python standard library so it can run before project
dependencies are installed in GitHub Actions.
"""

from __future__ import annotations

import argparse
import concurrent.futures
import html
import re
import sys
import time
import unicodedata
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable
from urllib.error import HTTPError, URLError
from urllib.parse import urldefrag
from urllib.request import Request, urlopen


HEADING_RE = re.compile(r"^(#{1,6})\s+(.+?)\s*$")
FENCE_RE = re.compile(r"^\s*(`{3,}|~{3,})")
URL_RE = re.compile(r'''https?://[^\s<>"'\[\]{}|]+''', re.IGNORECASE)
MARKDOWN_LINK_RE = re.compile(r"\[([^\]]+)\]\(([^)]+)\)")
INLINE_CODE_RE = re.compile(r"`([^`]+)`")
LEADING_NUMBER_RE = re.compile(r"^\s*\d+(?:\.\d+)*[.)]?\s*")
TOC_START_RE = re.compile(r"^(\s*)toc:\s*$")
TOC_ENTRY_RE = re.compile(r"^(\s*)-\s+(title|file):\s*(.+?)\s*$")
FRONT_TITLE_RE = re.compile(r"^\s*title:\s*(.+?)\s*$")
TRAILING_URL_PUNCTUATION = ".,;:!?)]}"


@dataclass(frozen=True)
class Heading:
    level: int
    text: str
    normalized: str
    line: int


@dataclass(frozen=True)
class TocParent:
    indent: int
    label: str
    line: int


@dataclass(frozen=True)
class LinkResult:
    url: str
    ok: bool
    status: int | None
    final_url: str | None
    error: str | None


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Validate Jupyter Book headings, navigation, and external links."
    )
    parser.add_argument(
        "--book-dir",
        type=Path,
        default=Path("book"),
        help="Book source directory (default: book).",
    )
    parser.add_argument(
        "--timeout",
        type=float,
        default=20.0,
        help="Timeout for each HTTP request in seconds (default: 20).",
    )
    parser.add_argument(
        "--retries",
        type=int,
        default=3,
        help="Maximum HTTP attempts per URL (default: 3).",
    )
    parser.add_argument(
        "--workers",
        type=int,
        default=6,
        help="Concurrent link checks (default: 6).",
    )
    parser.add_argument(
        "--skip-links",
        action="store_true",
        help="Run only structural checks.",
    )
    return parser.parse_args()


def normalize_heading(text: str) -> str:
    """Normalize visible text for duplicate comparison."""
    text = MARKDOWN_LINK_RE.sub(r"\1", text)
    text = INLINE_CODE_RE.sub(r"\1", text)
    text = html.unescape(text)
    text = unicodedata.normalize("NFKC", text)
    text = LEADING_NUMBER_RE.sub("", text)
    text = re.sub(r"[*_~#]+", "", text)
    text = text.casefold()
    text = re.sub(r"[^\wа-яё]+", " ", text, flags=re.IGNORECASE)
    return " ".join(text.split())


def visible_lines(path: Path) -> Iterable[tuple[int, str]]:
    """Yield rendered lines, excluding Markdown front matter and code fences."""
    text = path.read_text(encoding="utf-8")
    lines = text.splitlines()

    in_front_matter = bool(
        path.suffix.lower() == ".md" and lines and lines[0].strip() == "---"
    )
    in_fence = False
    fence_char = ""
    fence_length = 0

    for line_number, line in enumerate(lines, start=1):
        if in_front_matter:
            if line_number > 1 and line.strip() == "---":
                in_front_matter = False
            continue

        if path.suffix.lower() == ".md":
            fence_match = FENCE_RE.match(line)
            if fence_match:
                marker = fence_match.group(1)
                marker_char = marker[0]
                if not in_fence:
                    in_fence = True
                    fence_char = marker_char
                    fence_length = len(marker)
                elif marker_char == fence_char and len(marker) >= fence_length:
                    in_fence = False
                    fence_char = ""
                    fence_length = 0
                continue

            if in_fence:
                continue

        yield line_number, line


def validate_markdown(path: Path) -> list[str]:
    """Reject duplicate headings and unsupported display-math delimiters."""
    if path.suffix.lower() != ".md":
        return []

    errors: list[str] = []
    ancestors: dict[int, Heading] = {}

    for line_number, line in visible_lines(path):
        if line.strip() in {r"\[", r"\]"}:
            errors.append(
                f"{path}:{line_number}: unsupported legacy display-math "
                f"delimiter {line.strip()!r}; use plain Markdown text or "
                "a supported MyST math directive"
            )
            continue

        match = HEADING_RE.match(line)
        if not match:
            continue

        level = len(match.group(1))
        text = match.group(2).strip()
        normalized = normalize_heading(text)

        for ancestor_level in list(ancestors):
            if ancestor_level >= level:
                del ancestors[ancestor_level]

        if not normalized:
            errors.append(f"{path}:{line_number}: empty or non-semantic heading: {text!r}")
            continue

        for ancestor in ancestors.values():
            if normalized == ancestor.normalized:
                errors.append(
                    f"{path}:{line_number}: heading {text!r} duplicates ancestor "
                    f"{ancestor.text!r} from line {ancestor.line}"
                )

        ancestors[level] = Heading(
            level=level,
            text=text,
            normalized=normalized,
            line=line_number,
        )

    return errors


def yaml_scalar(value: str) -> str:
    """Return a simple YAML scalar without matching outer quotes."""
    value = value.strip()
    if len(value) >= 2 and value[0] == value[-1] and value[0] in {"'", '"'}:
        return value[1:-1]
    return value


def resolve_page_title(path: Path) -> str | None:
    """Resolve the navigation label from front matter, then from the first H1."""
    if not path.is_file() or path.suffix.lower() != ".md":
        return None

    lines = path.read_text(encoding="utf-8").splitlines()
    if lines and lines[0].strip() == "---":
        for line in lines[1:]:
            if line.strip() == "---":
                break
            match = FRONT_TITLE_RE.match(line)
            if match:
                title = yaml_scalar(match.group(1))
                if title:
                    return title

    for _, line in visible_lines(path):
        match = HEADING_RE.match(line)
        if match and len(match.group(1)) == 1:
            return match.group(2).strip()

    return None


def validate_toc_navigation(book_dir: Path) -> list[str]:
    """Reject a TOC child whose visible label repeats its immediate parent."""
    config_path = book_dir / "myst.yml"
    if not config_path.is_file():
        return [f"{config_path}: missing MyST configuration"]

    lines = config_path.read_text(encoding="utf-8").splitlines()
    toc_start: int | None = None
    toc_indent = 0

    for line_number, line in enumerate(lines, start=1):
        match = TOC_START_RE.match(line)
        if match:
            toc_start = line_number
            toc_indent = len(match.group(1))
            break

    if toc_start is None:
        return [f"{config_path}: project TOC was not found"]

    errors: list[str] = []
    parents: list[TocParent] = []

    for line_number in range(toc_start + 1, len(lines) + 1):
        line = lines[line_number - 1]
        if not line.strip() or line.lstrip().startswith("#"):
            continue

        indent = len(line) - len(line.lstrip(" "))
        if indent <= toc_indent:
            break

        match = TOC_ENTRY_RE.match(line)
        if not match:
            continue

        entry_indent = len(match.group(1))
        kind = match.group(2)
        value = yaml_scalar(match.group(3))

        while parents and parents[-1].indent >= entry_indent:
            parents.pop()
        parent = parents[-1] if parents else None

        if kind == "title":
            label = value
            if parent and normalize_heading(label) == normalize_heading(parent.label):
                errors.append(
                    f"{config_path}:{line_number}: navigation label {label!r} "
                    f"duplicates parent {parent.label!r} from line {parent.line}"
                )
            parents.append(TocParent(entry_indent, label, line_number))
            continue

        page_path = book_dir / value
        label = resolve_page_title(page_path)
        if label is None:
            errors.append(
                f"{config_path}:{line_number}: cannot resolve title for TOC file {value!r}"
            )
            continue

        if parent and normalize_heading(label) == normalize_heading(parent.label):
            errors.append(
                f"{config_path}:{line_number}: page {value!r} has label {label!r}, "
                f"which duplicates parent {parent.label!r} from line {parent.line}"
            )

    return errors


def extract_urls(path: Path) -> set[str]:
    """Extract public HTTP(S) URLs from rendered source lines."""
    urls: set[str] = set()
    for _, line in visible_lines(path):
        for match in URL_RE.finditer(line):
            url = match.group(0).rstrip(TRAILING_URL_PUNCTUATION)
            url, _ = urldefrag(url)
            if url:
                urls.add(url)
    return urls


def request_once(url: str, method: str, timeout: float) -> tuple[int, str]:
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (X11; Linux x86_64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/126.0 Safari/537.36"
        ),
        "Accept": "text/html,application/xhtml+xml,application/pdf,"
        "video/*;q=0.8,*/*;q=0.5",
        "Accept-Language": "ru-RU,ru;q=0.9,en;q=0.7",
        "Connection": "close",
    }
    if method == "GET":
        headers["Range"] = "bytes=0-1023"

    request = Request(url, headers=headers, method=method)
    with urlopen(request, timeout=timeout) as response:
        status = getattr(response, "status", response.getcode())
        final_url = response.geturl()
        if method == "GET":
            response.read(1)
        return int(status), final_url


def check_url(url: str, timeout: float, retries: int) -> LinkResult:
    """Check a URL with HEAD and a ranged GET fallback."""
    last_error: str | None = None
    last_status: int | None = None
    last_final_url: str | None = None

    for attempt in range(1, retries + 1):
        for method in ("HEAD", "GET"):
            try:
                status, final_url = request_once(url, method, timeout)
                last_status = status
                last_final_url = final_url
                if 200 <= status < 400:
                    return LinkResult(url, True, status, final_url, None)
                last_error = f"HTTP {status}"
            except HTTPError as exc:
                last_status = exc.code
                last_final_url = exc.geturl()
                last_error = f"HTTP {exc.code}: {exc.reason}"
            except (URLError, TimeoutError, OSError) as exc:
                last_error = f"{type(exc).__name__}: {exc}"

        if attempt < retries:
            time.sleep(min(2 ** (attempt - 1), 4))

    return LinkResult(
        url=url,
        ok=False,
        status=last_status,
        final_url=last_final_url,
        error=last_error or "unknown error",
    )


def discover_sources(book_dir: Path) -> list[Path]:
    patterns = ("*.md", "*.yml", "*.yaml")
    sources: set[Path] = set()
    for pattern in patterns:
        sources.update(
            path
            for path in book_dir.rglob(pattern)
            if "_build" not in path.parts and path.is_file()
        )
    return sorted(sources)


def main() -> int:
    args = parse_args()
    book_dir: Path = args.book_dir

    if not book_dir.is_dir():
        print(f"ERROR: book directory does not exist: {book_dir}", file=sys.stderr)
        return 2

    sources = discover_sources(book_dir)
    if not sources:
        print(f"ERROR: no book source files found in {book_dir}", file=sys.stderr)
        return 2

    structure_errors: list[str] = validate_toc_navigation(book_dir)
    urls: set[str] = set()

    for path in sources:
        structure_errors.extend(validate_markdown(path))
        urls.update(extract_urls(path))

    print(f"Checked {len(sources)} source files.")
    print(f"Found {len(urls)} unique external URLs.")

    if structure_errors:
        print("\nHeading and navigation validation failed:", file=sys.stderr)
        for error in structure_errors:
            print(f"- {error}", file=sys.stderr)
    else:
        print("Heading and navigation validation passed.")

    failed_links: list[LinkResult] = []
    if not args.skip_links:
        print("\nChecking external links...")
        with concurrent.futures.ThreadPoolExecutor(
            max_workers=max(1, args.workers)
        ) as executor:
            futures = [
                executor.submit(check_url, url, args.timeout, max(1, args.retries))
                for url in sorted(urls)
            ]
            results = [
                future.result()
                for future in concurrent.futures.as_completed(futures)
            ]

        for result in sorted(results, key=lambda item: item.url):
            if result.ok:
                redirect_note = (
                    f" -> {result.final_url}"
                    if result.final_url and result.final_url != result.url
                    else ""
                )
                print(f"[OK {result.status}] {result.url}{redirect_note}")
            else:
                failed_links.append(result)
                print(f"[FAIL] {result.url}: {result.error}", file=sys.stderr)

    if structure_errors or failed_links:
        if failed_links:
            print(
                f"\nExternal link validation failed for {len(failed_links)} URL(s).",
                file=sys.stderr,
            )
        return 1

    if args.skip_links:
        print("External link validation skipped by request.")
    else:
        print(f"External link validation passed for {len(urls)} URL(s).")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
