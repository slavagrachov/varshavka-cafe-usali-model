from __future__ import annotations

import os
import sys
import tempfile
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET


MAIN_NS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
DOC_REL_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
PKG_REL_NS = "http://schemas.openxmlformats.org/package/2006/relationships"
HYPERLINK_REL_TYPE = f"{DOC_REL_NS}/hyperlink"

ET.register_namespace("", MAIN_NS)
ET.register_namespace("r", DOC_REL_NS)


def next_relationship_id(root: ET.Element) -> str:
    used = {
        int(rel.attrib["Id"][3:])
        for rel in root
        if rel.attrib.get("Id", "").startswith("rId")
        and rel.attrib["Id"][3:].isdigit()
    }
    candidate = 1
    while candidate in used:
        candidate += 1
    return f"rId{candidate}"


def patch_sheet(
    archive: dict[str, bytes],
    sheet_path: str,
    cell_links: dict[str, str],
) -> None:
    sheet_root = ET.fromstring(archive[sheet_path])
    rel_path = (
        str(Path(sheet_path).parent / "_rels" / f"{Path(sheet_path).name}.rels")
        .replace("\\", "/")
    )
    if rel_path in archive:
        rel_root = ET.fromstring(archive[rel_path])
    else:
        rel_root = ET.Element(f"{{{PKG_REL_NS}}}Relationships")

    existing = sheet_root.find(f"{{{MAIN_NS}}}hyperlinks")
    if existing is not None:
        sheet_root.remove(existing)
    hyperlinks = ET.Element(f"{{{MAIN_NS}}}hyperlinks")

    for cell_ref, url in cell_links.items():
        relationship_id = next_relationship_id(rel_root)
        ET.SubElement(
            rel_root,
            f"{{{PKG_REL_NS}}}Relationship",
            {
                "Id": relationship_id,
                "Type": HYPERLINK_REL_TYPE,
                "Target": url,
                "TargetMode": "External",
            },
        )
        ET.SubElement(
            hyperlinks,
            f"{{{MAIN_NS}}}hyperlink",
            {
                "ref": cell_ref,
                f"{{{DOC_REL_NS}}}id": relationship_id,
            },
        )

    children = list(sheet_root)
    insert_after = {"mergeCells", "dataValidations", "conditionalFormatting"}
    insertion_index = 0
    for index, child in enumerate(children):
        local_name = child.tag.rsplit("}", 1)[-1]
        if local_name in insert_after:
            insertion_index = index + 1
    sheet_root.insert(insertion_index, hyperlinks)
    archive[sheet_path] = ET.tostring(
        sheet_root, encoding="utf-8", xml_declaration=True
    )
    archive[rel_path] = ET.tostring(
        rel_root, encoding="utf-8", xml_declaration=True
    )


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("Usage: add_xlsx_hyperlinks.py <workbook.xlsx>")
    workbook_path = Path(sys.argv[1]).resolve()

    source_hall = (
        "https://github.com/slavagrachov/varshavka-cafe-usali-model/blob/main/"
        "sources/tableware/2026-07-25_complexbar_hall_tableware.eml"
    )
    source_bar = (
        "https://github.com/slavagrachov/varshavka-cafe-usali-model/blob/main/"
        "sources/tableware/2026-07-25_complexbar_bar_glassware.eml"
    )
    source_register = (
        "https://github.com/slavagrachov/varshavka-cafe-usali-model/blob/main/"
        "sources/tableware/2026-07-25_complexbar_tableware_register.csv"
    )
    product_urls = [
        "https://complexbar.ru/product/tarelka-melkaya-bez-borta-kunstwerk-03011857/",
        "https://complexbar.ru/product/tarelka-melkaya-bez-borta-kunstwerk-03011456/",
        "https://complexbar.ru/product/tarelka-melkaya-bez-borta-kunstwerk-03010413/",
        "https://complexbar.ru/product/tarelka-glubokaya-kunstwerk-03010981/",
        "https://complexbar.ru/product/para-chaynaya-kunstwerk-03140689/",
        "https://complexbar.ru/product/chaynik-kunstwerk-03150420/",
        "https://complexbar.ru/product/sousnik-kunstwerk-03040142/",
        "https://complexbar.ru/product/nabor-d-speciy-3-predm-na-podstavke-kunstwerk-03173703/",
        "https://complexbar.ru/product/salfetnica-kunstwerk-03172334/",
        "https://complexbar.ru/product/para-kofeynaya-kunstwerk-03130448/",
        "https://complexbar.ru/product/para-kofeynaya-kunstwerk-03130278/",
        "https://complexbar.ru/product/saharnica-s-kryshkoy-kunstwerk-03171983/",
        "https://complexbar.ru/product/vilka-stolovaya-kunstwerk-03112213/",
        "https://complexbar.ru/product/lozhka-chaynaya-kunstwerk-03111782/",
        "https://complexbar.ru/product/nozh-stolovyy-kunstwerk-03114123/",
        "https://complexbar.ru/product/lozhka-stolovaya-eternum-03110167/",
        "https://complexbar.ru/product/bokal-dlya-vina-chef-and-sommelier-01011643/",
        "https://complexbar.ru/product/shampan-blyudce-chef-and-sommelier-01060610/",
        "https://complexbar.ru/product/ryumka-pasabahce-01071637/",
        "https://complexbar.ru/product/old-feshn-bormioli-rocco-01020542/",
        "https://complexbar.ru/product/haybol-pasabahce-01011610/",
    ]

    with zipfile.ZipFile(workbook_path, "r") as source_zip:
        archive = {name: source_zip.read(name) for name in source_zip.namelist()}

    tableware_links = {
        "F6": source_hall,
        "I6": source_bar,
        "M6": source_register,
        **{f"S{row}": url for row, url in enumerate(product_urls, start=9)},
    }
    investment_links = {
        "H5": source_hall,
        "H6": source_bar,
        "H7": source_register,
    }
    patch_sheet(archive, "xl/worksheets/sheet12.xml", tableware_links)
    patch_sheet(archive, "xl/worksheets/sheet13.xml", investment_links)

    file_descriptor, temp_name = tempfile.mkstemp(
        suffix=".xlsx", dir=workbook_path.parent
    )
    os.close(file_descriptor)
    temp_path = Path(temp_name)
    try:
        with zipfile.ZipFile(
            temp_path, "w", compression=zipfile.ZIP_DEFLATED
        ) as target_zip:
            for name, content in archive.items():
                target_zip.writestr(name, content)
        os.replace(temp_path, workbook_path)
    finally:
        if temp_path.exists():
            temp_path.unlink()


if __name__ == "__main__":
    main()
