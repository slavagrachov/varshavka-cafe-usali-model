#!/usr/bin/env python3
"""Validate public book structure and external links before publication.

Checks:
1. A Markdown heading must not repeat the normalized text of any ancestor heading.
2. Every external HTTP(S) URL rendered from book Markdown/YAML must be reachable.
3. Legacy display-math delimiters are forbidden in rendered Markdown because
   the current MyST configuration displays them as raw source text.

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
URL_RE = re.compile(r"""https?://[^\s<>"'\[\]{}|]+""", re.IGNORECASE)
MARKDOWN_LINK_RE = re.compile(r"\[([^\]]+)\]\(([^)]+)\)")
INLINE_CODE_RE = re.compile(r"`([^`]+)`")
LEADING_NUMBER_RE = re.compile(r"^\s*\d+(?:\.\d+)*[.)]?\s*")
TRAILING_URL_PUNCTUATION = ".,;:!?)]}"


@dataclass(frozen=True)
class Heading:
    level: int
    text: str
    normalized: str
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
        description="Validate Jupyter Book headings and external links."
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
    """Normalize a heading for semantic duplicate comparison."""
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
    """Yield lines that are rendered, excluding Markdown front matter and fences."""
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


def validate_headings(path: Path) -> list[str]:
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

    heading_errors: list[str] = []
    urls: set[str] = set()

    for path in sources:
        heading_errors.extend(validate_headings(path))
        urls.update(extract_urls(path))

    print(f"Checked {len(sources)} source files.")
    print(f"Found {len(urls)} unique external URLs.")

    if heading_errors:
        print("\nHeading validation failed:", file=sys.stderr)
        for error in heading_errors:
            print(f"- {error}", file=sys.stderr)
    else:
        print("Heading validation passed.")

    failed_links: list[LinkResult] = []
    if not args.skip_links:
        print("\nChecking external links...")
        with concurrent.futures.ThreadPoolExecutor(
            max_workers=max(1, args.workers)
        ) as executor:
            future_map = {
                executor.submit(check_url, url, args.timeout, max(1, args.retries)): url
                for url in sorted(urls)
            }
            results = [
                future.result()
                for future in concurrent.futures.as_completed(future_map)
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
                print(
                    f"[FAIL] {result.url}: {result.error}",
                    file=sys.stderr,
                )

    if heading_errors or failed_links:
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
