#!/usr/bin/env python3
"""Verify the MAC_EXCEL_LTSC_2021_SAFE OOXML profile without dependencies."""
import re
import sys
import zipfile
from xml.etree import ElementTree as ET

MAIN="http://schemas.openxmlformats.org/spreadsheetml/2006/main"
q=lambda name:f"{{{MAIN}}}{name}"

if len(sys.argv)!=2:
 raise SystemExit("usage: verify_issue_80_excel_compatibility.py WORKBOOK.xlsx")

path=sys.argv[1]
with zipfile.ZipFile(path) as package:
 names=package.namelist()
 bad=package.testzip()
 assert bad is None,f"damaged ZIP member: {bad}"
 sheets=[n for n in names if re.fullmatch(r"xl/worksheets/sheet\d+\.xml",n)]
 tables=[n for n in names if n.startswith("xl/tables/")]
 drawings=[n for n in names if n.startswith("xl/drawings/")]
 filters=0;formulas=0;errors=[]
 for name in sheets:
  root=ET.fromstring(package.read(name))
  filters+=root.find(q("autoFilter")) is not None
  formulas+=len(root.findall(".//"+q("f")))
  text=package.read(name).decode("utf-8","ignore")
  errors.extend(token for token in ("#REF!","#DIV/0!","#VALUE!") if token in text)

 result={"sheets":len(sheets),"tables":len(tables),"drawings":len(drawings),
         "filters":filters,"formulas":formulas,"error_literals":len(errors)}
 print(result)
 assert result=={"sheets":17,"tables":0,"drawings":0,"filters":17,
                 "formulas":270,"error_literals":0},result
print("PASS MAC_EXCEL_LTSC_2021_SAFE")
