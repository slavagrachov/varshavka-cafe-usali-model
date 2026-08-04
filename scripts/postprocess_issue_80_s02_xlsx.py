#!/usr/bin/env python3
import re, sys, zipfile, tempfile, os
from pathlib import Path
from xml.etree import ElementTree as ET
NS="http://schemas.openxmlformats.org/spreadsheetml/2006/main"; REL="http://schemas.openxmlformats.org/officeDocument/2006/relationships"; PKG="http://schemas.openxmlformats.org/package/2006/relationships"
ET.register_namespace("",NS);ET.register_namespace("r",REL)
q=lambda x:"{%s}%s"%(NS,x)
src=Path(sys.argv[1]); tmp=src.with_suffix(".patched.xlsx")
with zipfile.ZipFile(src) as z: data={n:z.read(n) for n in z.namelist()}
wb=ET.fromstring(data["xl/workbook.xml"]); rels=ET.fromstring(data["xl/_rels/workbook.xml.rels"])
targets={r.attrib["Id"]:(r.attrib["Target"].lstrip("/") if r.attrib["Target"].lstrip("/").startswith("xl/") else "xl/"+r.attrib["Target"].lstrip("/")) for r in rels}
shared=[]
if "xl/sharedStrings.xml" in data:
 root=ET.fromstring(data["xl/sharedStrings.xml"])
 for si in root.findall(q("si")):shared.append("".join(t.text or "" for t in si.iter(q("t"))))
def celltext(c):
 v=c.find(q("v"))
 if v is None:return ""
 if c.attrib.get("t")=="s":
  try:return shared[int(v.text)]
  except:return ""
 return v.text or ""
defined=wb.find(q("definedNames"))
if defined is None:defined=ET.SubElement(wb,q("definedNames"))
for old in list(defined):
 if old.attrib.get("name")=="_xlnm.Print_Area":defined.remove(old)
for idx,s in enumerate(wb.find(q("sheets"))):
 name=s.attrib["name"];rid=s.attrib["{%s}id"%REL];target=targets[rid];root=ET.fromstring(data[target])
 dim=root.find(q("dimension"))
 maxrow=maxcol=1
 for c in root.findall(".//"+q("c")):
  m=re.match(r"([A-Z]+)([0-9]+)",c.attrib.get("r","A1"))
  if not m:continue
  ci=0
  for ch in m.group(1):ci=ci*26+ord(ch)-64
  maxcol=max(maxcol,ci);maxrow=max(maxrow,int(m.group(2)))
 def colname(n):
  s=""
  while n:n,r=divmod(n-1,26);s=chr(65+r)+s
  return s
 ref="A1:"+colname(maxcol)+str(maxrow)
 if dim is not None:dim.attrib["ref"]=ref
 views=root.find(q("sheetViews"))
 if views is None:views=ET.Element(q("sheetViews"));root.insert(0,views)
 view=views.find(q("sheetView"))
 if view is None:view=ET.SubElement(views,q("sheetView"),{"workbookViewId":"0"})
 for p in list(view.findall(q("pane"))):view.remove(p)
 view.insert(0,ET.Element(q("pane"),{"ySplit":"4","topLeftCell":"A5","activePane":"bottomLeft","state":"frozen"}))
 af=root.find(q("autoFilter"))
 if af is None:
  sd=root.find(q("sheetData"));pos=list(root).index(sd)+1 if sd is not None else len(root);root.insert(pos,ET.Element(q("autoFilter"),{"ref":ref}))
 status_cols=[];sheetdata=root.find(q("sheetData"))
 if sheetdata is not None:
  best=[]
  for row in sheetdata.findall(q("row")):
   rn=int(row.attrib.get("r","0"))
   if rn>4:continue
   vals=[(re.match(r"([A-Z]+)",c.attrib["r"]).group(1),celltext(c).lower()) for c in row.findall(q("c"))]
   if len(vals)>len(best):best=vals
  status_cols=[c for c,h in best if "status" in h or "статус" in h]
 if status_cols:
  dvs=root.find(q("dataValidations"))
  if dvs is None:dvs=ET.SubElement(root,q("dataValidations"))
  for c in status_cols:
   dv=ET.SubElement(dvs,q("dataValidation"),{"type":"list","allowBlank":"1","showErrorMessage":"1","sqref":c+"5:"+c+"500"})
   ET.SubElement(dv,q("formula1")).text='"DRAFT,BLOCKED,OPEN,PASS,CALCULATED,ASSUMPTION,PRELIMINARY"'
  dvs.attrib["count"]=str(len(dvs))
 pm=root.find(q("pageMargins"))
 if pm is None:pm=ET.SubElement(root,q("pageMargins"),{"left":"0.25","right":"0.25","top":"0.5","bottom":"0.5","header":"0.2","footer":"0.2"})
 ps=root.find(q("pageSetup"))
 if ps is None:ps=ET.SubElement(root,q("pageSetup"))
 ps.attrib.update({"orientation":"landscape","fitToWidth":"1","fitToHeight":"0"})
 dn=ET.SubElement(defined,q("definedName"),{"name":"_xlnm.Print_Area","localSheetId":str(idx)})
 parts=ref.split(":")
 def absolute(a):
  m=re.match(r"([A-Z]+)([0-9]+)",a)
  return "$"+m.group(1)+"$"+m.group(2) if m else "$A$1"
 dn.text="'"+name.replace("'","''")+"'!"+":".join(absolute(x) for x in parts)
 data[target]=ET.tostring(root,encoding="utf-8",xml_declaration=True)
data["xl/workbook.xml"]=ET.tostring(wb,encoding="utf-8",xml_declaration=True)
with zipfile.ZipFile(tmp,"w",zipfile.ZIP_DEFLATED) as z:
 for n,b in data.items():z.writestr(n,b)
os.replace(tmp,src)
print(src)
