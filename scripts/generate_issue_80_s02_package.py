#!/usr/bin/env python3
import csv, json, shutil
from pathlib import Path
R=Path(__file__).parent; S=R/"sources"; O=R/"docs/07-operations/issue-80/s02"; O.mkdir(parents=True,exist_ok=True)
BASE="cd23852fda61d9ee42dc7bae453e164c8f4d130c"
def rd(n):
  with open(S/n,encoding="utf-8-sig",newline="") as f:return list(csv.DictReader(f))
def wr(n,rows,fields=None):
  fields=fields or list(rows[0])
  with open(O/n,"w",encoding="utf-8",newline="") as f:
    w=csv.DictWriter(f,fieldnames=fields,extrasaction="ignore");w.writeheader();w.writerows(rows)
def md(n,t):(O/n).write_text(t.strip()+"\n",encoding="utf-8")
codes=["VKM-%03d"%i for i in range(1,32)]
b=rd("FINMODEL_CALCULATION_BRIDGE_31.csv"); bb={x["position_code"]:x for x in b}
ch=rd("FINMODEL_CHANNEL_ECONOMICS_BRIDGE_104.csv"); cov=rd("MENU_EVIDENCE_COVERAGE_31.csv"); cv={x["dish_code"]:x for x in cov}
p=rd("DISH_PASSPORTS.csv"); pp={x["dish_code"]:x for x in p}
bf={"VKM-026":("Яичница, круассан и сыр двух видов","225 г + напиток 200 мл"),"VKM-027":("Омлет, круассан и сыр двух видов","265 г + напиток 200 мл"),"VKM-028":("Овсяная каша, круассан и сыр двух видов","355 г + напиток 200 мл")}
menu=[]
for c in codes:
  n=int(c[-3:])
  if c in pp:
    x=pp[c]; menu.append({"menu_record_id":"MNU-%03d"%n,"dish_code":c,"menu_section":x["menu_section"],"dish_name":x["dish_name"],"sales_channels":x["channels"],"production_sales_unit":x["production_sales_unit"],"draft_target_output":x["draft_target_output"]+" "+x["output_unit"],"cost_card_code":x["cost_card_code"],"tech_card_code":x["tech_card_code"],"recipe_version":x["recipe_version"],"recipe_status":"DRAFT_NOT_APPROVED","calculation_layer_status":"POPULATED_PROXY_SCENARIO","chef_status":"NOT_APPROVED","safety_status":"BLOCK","source":"main"})
  else:
    menu.append({"menu_record_id":"MNU-%03d"%n,"dish_code":c,"menu_section":"Гостиничные завтраки","dish_name":bf[c][0],"sales_channels":"Гостиница — завтраки","production_sales_unit":"1 закрытый комплекс","draft_target_output":bf[c][1],"cost_card_code":"VKC-%03d"%n,"tech_card_code":"VKT-%03d"%n,"recipe_version":bb[c]["recipe_or_model_version"],"recipe_status":"S04_MODEL_RECIPE_PRELIMINARY","calculation_layer_status":"POPULATED_S04_MODEL","chef_status":"NOT_APPROVED","safety_status":"NOT_PRODUCTION_RELEASED","source":"PR81 historical checkpoint"})
wr("MENU_REGISTER_31.csv",menu)
r=rd("RECIPES.csv"); rf=list(r[0])
main={"VKM-026":[("P-EGG-C0","Яйцо C0","шт.",2,126,114),("P-BUTTER","Масло сливочное","г",5,5,5),("P-SALT","Соль","г",1,1,1)],"VKM-027":[("P-MELANGE-GROVO","Меланж","г",126,126,111),("P-MILK-DS","Молоко","мл",50,50,44),("P-BUTTER","Масло сливочное","г",5,5,4),("P-SALT","Соль","г",1,1,1)],"VKM-028":[("P-OATS","Овсяные хлопья","г",45,45,45),("P-MILK-DS","Молоко","мл",125,125,108),("WATER","Вода","г",100,100,86),("P-SUGAR","Сахар","г",5,5,5),("P-BUTTER","Масло сливочное","г",5,5,5),("P-SALT","Соль","г",1,1,1)]}
common=[("P-CROISSANT-80","Круассан 80 г","шт.",1,80,65),("P-CHEDDAR","Чеддер","г",20,20,20),("P-FONTINA","Fontina DOP / Fontal","г",21,20,20),("P-DRINK","Напиток бариста 200 мл","шт.",1,1,None)]
for c in bf:
  n=int(c[-3:])
  for j,x in enumerate(main[c]+common,1):
    iid,name,pu,pq,net,out=x; row={k:"" for k in rf}
    row.update({"recipe_line_id":"RCP-BF-%03d-%02d"%(n,j),"dish_code":c,"cost_card_code":"VKC-%03d"%n,"tech_card_code":"VKT-%03d"%n,"recipe_version":"PR81-DRAFT","ingredient_id":iid,"ingredient_name":name,"component_type":"RAW_OR_PURCHASED_COMPONENT","production_stage":"Breakfast complex","gross_qty":pq,"gross_unit":pu,"net_qty":net,"net_unit":"г" if pu=="шт." else pu,"projected_output_contribution":"" if out is None else out,"output_unit":"г","parameter_status":"ASSUMPTION" if iid=="P-FONTINA" else "DRAFT","calculation_method":"PR81 historical checkpoint; count and mass fields remain dimensionally distinct","source_date":"2026-07-27","confirmation_owner":"Chef","blocker_ids":"CHEF_DECISION;CONTROL_COOK;SUPPLIER_DOCS","validation_note":"Not approved"})
    r.append(row)
wr("RECIPES_31.csv",r,rf)
t=rd("TECH_CARDS.csv"); tf=list(t[0])
for c in bf:
  n=int(c[-3:]); row={k:"" for k in tf}
  row.update({"record_id":"TCH-BF-%03d"%n,"tech_card_code":"VKT-%03d"%n,"dish_code":c,"recipe_version":"PR81-DRAFT","dish_name":bf[c][0],"application_scope":"Закрытый гостиничный завтрак","application_scope_status":"DRAFT","raw_material_requirements":"Точные SKU, lot/label chain и документы поставщиков отсутствуют","raw_material_requirements_status":"BLOCKED","raw_material_preparation":"Проверка партии; взвешивание; подготовка","raw_material_preparation_status":"DRAFT","operation_sequence":"Приготовить основное блюдо; выпечь круассан; нарезать сыр; комплектовать","allowable_deviations":"Требует контрольной проработки","allowable_deviations_status":"BLOCKED","organoleptic_indicators":"Требует решения Chef и контрольной проработки","organoleptic_indicators_status":"DRAFT","storage_and_realization":"Не установлено; требуется evidence","storage_and_realization_status":"BLOCKED","draft_active_time":"","draft_total_time":"","safety_critical_parameters":"SKU/lot/label traceability; shelf life; temperature validation; cross-contact","safety_status":"BLOCK","safety_evidence_ids":"","safety_owner":"FoodSafetyAgent / Procurement / Chef","safety_blocker_ids":"SBL-%s-01;SBL-%s-02;SBL-%s-03;SBL-%s-04"%(c,c,c,c),"validation_note":"No safety approval; linked blockers remain OPEN","parameter_status":"DRAFT_WITH_ASSUMPTIONS","approval_status":"NOT_APPROVED"})
  t.append(row)
wr("TECH_CARDS_31.csv",t,tf)
semi=rd("SEMI_FINISHED_PRODUCTS.csv"); sf=list(semi[0])+["record_type","make_or_buy_status","graph_link_status"]
for row in semi:
 row["record_type"]="REAL_VSF_CANDIDATE";row["make_or_buy_status"]="UNRESOLVED";row["graph_link_status"]="SOURCE_DAG_CONTROLLED"
for c in bf:
  row={k:"" for k in sf};row.update({"vsf_code":"VSF-NONE-"+c,"semi_finished_name":"Boundary assertion: make-полуфабрикат не выделен в PR81","recipe_version":"PR81-DRAFT","canonical_batch_variant_id":"NONE@"+c,"batch_variant_count":"0","linked_dish_codes":c,"card_status":"PENDING_CHEF_CONFIRMATION","parameter_status":"DRAFT","confirmation_owner":"Chef","next_action":"Подтвердить отсутствие make-полуфабрикатов и границы make-or-buy","double_counting_rule":"Each purchased component once","record_type":"BOUNDARY_ASSERTION_NOT_REAL_VSF","make_or_buy_status":"NO_MAKE_VSF_IDENTIFIED_PENDING_CHEF","graph_link_status":"EXPLICIT_DISH_BOUNDARY_EDGE"});semi.append(row)
dag=rd("SEMI_FINISHED_DAG.csv"); df=list(dag[0])
for row in dag:
 if row["dag_edge_id"]=="SFD-022": row["source_recipe_line_ids"]="";row["status"]="DRAFT_PARENT_EDGE_NO_DIRECT_RAW_LINES"
for c in bf:
 n=int(c[-3:]);dag.append({"dag_edge_id":"SFD-BF-%03d"%n,"parent_type":"DISH","parent_code":c,"child_vsf_code":"VSF-NONE-"+c,"batch_variant_id":"NONE@"+c,"required_output_qty":"0","unit":"N/A","edge_role":"BOUNDARY_ASSERTION_NOT_COMPONENT","mapping_id":"SFM-BF-%03d"%n,"source_recipe_line_ids":"","status":"PENDING_CHEF_CONFIRMATION","evidence_ids":"","blocker_ids":"CHEF_DECISION","cycle_control":"Sentinel boundary edge; excluded from costing"})
for edge in dag:
 if edge["dag_edge_id"]=="SFD-022":continue
 for rid in filter(None,edge.get("source_recipe_line_ids","").split(";")):
  for rr in r:
   if rr["recipe_line_id"]==rid and not rr.get("semi_finished_candidate_code"):rr["semi_finished_candidate_code"]=edge["child_vsf_code"]
wr("RECIPES_31.csv",r,rf);wr("SEMI_FINISHED_PRODUCTS_31.csv",semi,sf);wr("SEMI_FINISHED_DAG_31.csv",dag,df)
div={"VKM-029":12,"VKM-030":10,"VKM-031":10}
bflds=list(b[0])+["normalization_divisor","sale_unit_model_kitchen_cogs_rub","sale_unit_model_complete_direct_cogs_rub","normalization_status"]
for row in b:
 d=div.get(row["position_code"],1);row["normalization_divisor"]=d
 row["sale_unit_model_kitchen_cogs_rub"]=float(row["model_kitchen_cogs_rub"])/d if row["model_kitchen_cogs_rub"] else ""
 row["sale_unit_model_complete_direct_cogs_rub"]=float(row["model_complete_direct_cogs_rub"])/d if row["model_complete_direct_cogs_rub"] else ""
 row["normalization_status"]="CALCULATED_FROM_BATCH_DIVISOR_REQUIRES_CHEF_YIELD_CONFIRMATION" if d>1 else "SOURCE_ALREADY_ONE_SALE_UNIT"
cflds=list(ch[0])+["source_model_food_cost_ratio","normalization_divisor","sale_unit_model_complete_direct_cogs_rub","sale_unit_model_price_rub","sale_unit_model_gross_margin_rub","normalization_status","packaging_zero_interpretation","channel_formula_method","formula_version"]
for row in ch:
 d=div.get(row["position_code"],1);row["normalization_divisor"]=d
 row["source_model_food_cost_ratio"]=row.get("model_food_cost_ratio","")
 if row.get("model_kitchen_cogs_rub") and row.get("model_price_rub"):row["model_food_cost_ratio"]=float(row["model_kitchen_cogs_rub"])/float(row["model_price_rub"])
 for src,dst in [("model_complete_direct_cogs_rub","sale_unit_model_complete_direct_cogs_rub"),("model_price_rub","sale_unit_model_price_rub"),("model_gross_margin_before_channel_costs_rub","sale_unit_model_gross_margin_rub")]:row[dst]=float(row[src])/d if row[src] else ""
 row["normalization_status"]="CALCULATED_FROM_BATCH_DIVISOR_REQUIRES_CHEF_YIELD_CONFIRMATION" if d>1 else "SOURCE_ALREADY_ONE_SALE_UNIT"
 row["packaging_zero_interpretation"]="MODEL_ASSUMPTION_ZERO_NOT_QUOTED_NOT_EVIDENCE" if str(row.get("model_packaging_rub","")) in ("0","0.0") else "SOURCE_VALUE"
 row["channel_formula_method"]="food_cost=kitchen_cogs/price; gross_margin_before_channel_costs=price-kitchen_cogs; contribution=price-complete_direct_cogs-tax-commission"
 row["formula_version"]="ISS80-S02-CHANNEL-V1"
sens=rd("PROVISIONAL_PROXY_SCENARIO_SENSITIVITY.csv"); snf=list(sens[0])+["exact_formula","applicability_status"]
for row in sens:
 row["exact_formula"]="scenario_value = baseline * exact scenario rule; yield -5% uses divisor 0.95, not rounded displayed factor"
 row["applicability_status"]="APPLICABLE_ISSUE82_PROXY_ONLY"
for c in bf:
 row={k:"" for k in snf};row.update({"dish_code":c,"scenario_id":"NOT_APPLICABLE_BREAKFAST","exact_formula":"No Issue82 proxy sensitivity; use S04 breakfast model scenarios","applicability_status":"NOT_APPLICABLE_SEPARATE_S04_MODEL"});sens.append(row)
wr("COSTING_CARDS_31.csv",b,bflds);wr("CHANNEL_ECONOMICS_104.csv",ch,cflds);wr("FINMODEL_IMPORT_31.csv",b,bflds);wr("SENSITIVITY_REPORT.csv",sens,snf)
a=rd("ALLERGEN_MATRIX.csv"); af=list(a[0])
for c in bf:
 row={k:"UNKNOWN_NOT_ABSENT" for k in af};row.update({"dish_code":c,"dish_name":bf[c][0],"version":"PR81-DRAFT","as_of_date":"2026-08-04","source_recipe_version":"PR81-DRAFT","source_recipe_blob_sha":"PR81_HEAD_1e0722ad","matrix_status":"DRAFT_BLOCKED_PENDING_SKU_DOCS","method":"Recipe/name screening only","required_confirmation":"Labels; specs; hazard analysis; control cook","cross_contact_status":"BLOCKED_UNKNOWN","owner":"FoodSafetyAgent / Chef"});a.append(row)
wr("ALLERGEN_SAFETY_MATRIX_31.csv",a,af)
s=rd("SAFETY_BLOCKER_REGISTER.csv"); ss=list(s[0])
for c in bf:
 for j,param in enumerate(["supplier_SKU_evidence","shelf_life_temperature","cross_contact_hazard_analysis","traceability_lot_label_chain"],1):
  row={k:"" for k in ss};row.update({"dish_code":c,"dish_name":bf[c][0],"as_of_date":"2026-08-04","source_recipe_version":"PR81-DRAFT","source_recipe_blob_sha":"PR81_HEAD_1e0722ad","status":"OPEN","dish_readiness_veto":"BLOCK","blocker_id":"SBL-%s-%02d"%(c,j),"severity":"S1_CRITICAL" if j<3 else "S2_MAJOR","parameter":param,"reason":"Primary evidence absent","missing_input":"Documents and/or physical validation","impact":"No safety approval may be inferred","owner":"FoodSafetyAgent / Procurement / Chef","next_action":"Collect and validate evidence","checkpoint":"Issue #38 / control cook"});s.append(row)
wr("SAFETY_BLOCKER_REGISTER_31.csv",s,ss)
q=rd("CHEF_QUESTIONS_REGISTER.csv"); qf=list(q[0])
for c in bf:
 for j,(typ,question,prio) in enumerate([("SAFETY","Подтвердить safety route only after evidence","P0"),("RECIPE","Подтвердить построчный состав и нормы","P1"),("OUTPUT","Подтвердить фактический выход контрольной серией","P1"),("SUPPLIER","Выбрать SKU и получить документы","P0")],1):
  q.append({"question_id":"CQ-BF-%s-%02d"%(c[-3:],j),"dish_code":c,"dish_name":bf[c][0],"question_type":typ,"question":question,"question_status":"OPEN","answer_owner":"Chef / Owner","impact":prio+"; recipe; costing; safety","blocker_ids":"CHEF_DECISION;CONTROL_COOK;SUPPLIER_DOCS","raised_date":"2026-08-04","checkpoint":"Owner/Chef Gate"})
wr("CHEF_QUESTIONS_31.csv",q,qf)
comp=[]
for c in codes:
 x=cv[c];comp.append({"dish_code":c,"menu":"PRESENT","recipe":"PRESENT_DRAFT","tech_card":"PRESENT_DRAFT","costing":"MODEL_LAYER_PRESENT","channel_economics":"PRESENT","semi_finished":"PRESENT_OR_EXPLICIT_PENDING_CONFIRMATION","allergen_safety":"PRESENT_BLOCKED","chef_questions":"PRESENT","control_cook_form":"PRESENT","chef_approval":"NOT_APPROVED","evidence_cogs":x["evidence_cogs_status"],"safety_status":x["safety_status"],"overall":"READY_FOR_CHEF_REVIEW_SUBJECT_EVIDENCE_OPEN"})
wr("COMPLETENESS_MATRIX_31.csv",comp)
nut=rd("DISH_NUTRITION.csv"); nf=list(nut[0])
for c in bf:
 row={k:"" for k in nf};row.update({"nutrition_record_id":"NUT-BF-"+c[-3:],"dish_code":c,"cost_card_code":"VKC-"+c[-3:],"tech_card_code":"VKT-"+c[-3:],"menu_section":"Гостиничные завтраки","dish_name":bf[c][0],"recipe_version":"PR81-DRAFT","production_sales_unit":"1 закрытый комплекс","draft_batch_or_item_output_mass":bf[c][1],"portion_mass_method_status":"BLOCKED_PENDING_RECIPE_AND_CONTROL_COOK","calculation_status":"NOT_CALCULATED_EVIDENCE_OPEN","approval_status":"NOT_APPROVED","validation_note":"No nutrition value inferred; calculate after recipe freeze and validate method"})
 nut.append(row)
wr("NUTRITION_31.csv",nut,nf)
shutil.copyfile(S/"RAW_MATERIAL_PRICE_REGISTER.csv",O/"RAW_MATERIAL_PRICE_REGISTER.csv")
shutil.copyfile(S/"CONSOLIDATED_DECISION_FORMS_31.md",O/"CHEF_DECISION_FORMS_31.md")
shutil.copyfile(S/"PPK_PHYSICAL_VALIDATION_PROGRAM_31.md",O/"CONTROL_COOK_FORMS_31.md")
res=rd("RESOURCE_CARDS.csv"); resf=list(res[0])
for c in bf:
 n=int(c[-3:]);row={k:"" for k in resf};row.update({"resource_card_id":"RSC-BF-%03d"%n,"dish_code":c,"dish_name":bf[c][0],"menu_section":"Гостиничные завтраки","recipe_version":"PR81-DRAFT","primary_area":"Breakfast production area pending layout confirmation","operation_count":"1","mapped_operation_count":"1","functional_codes":"UNASSIGNED","draft_active_time":"","draft_total_time":"","recipe_batch_basis":"One historical draft breakfast complex; not approved production batch","recipe_batch_output":bf[c][1],"preliminary_recipe_batches":"1","preliminary_batch_status":"DRAFT_NOT_PRODUCTION_PLAN","capacity_status":"BLOCKED_NO_APPROVED_DEMAND_OR_PASSPORT","one_recipe_scenario_qty":"1","one_recipe_scenario_unit":"комплекс","one_recipe_scenario_status":"ESTIMATE_NOT_PRODUCTION_PLAN","inventory_set_code":"INVSET-BF-%03d"%n,"tableware_set_code":"TWS-BF-%03d"%n,"availability_status":"NOT_CONFIRMED","connections_status":"NOT_CONFIRMED","bottleneck_status":"BLOCKED_PENDING_VALIDATION","parameter_status":"DRAFT","source_date":"2026-08-04","blocker_ids":"CHEF_DECISION;EQUIPMENT_PASSPORT;LOAD_TEST;SITE_FLOW","confirmation_owner":"Chef / Operations / Engineering / Procurement","next_action":"Confirm route, equipment, connection, capacity and service flow"});res.append(row)
wr("RESOURCE_CARDS_31.csv",res,resf)
eq=rd("EQUIPMENT_FUNCTION_MATRIX.csv"); ef=list(eq[0])
inv=rd("INVENTORY_REGISTER.csv"); inf=list(inv[0])
tbl=rd("TABLEWARE_REGISTER.csv"); tbf=list(tbl[0])
bf_eq={"VKM-026":"Теппан/сковорода; печь; холодильник; весы; термощуп; таймер","VKM-027":"Пароконвектомат; формы; печь; холодильник; весы; термощуп; таймер","VKM-028":"Кастрюля; индукция; печь; холодильник; весы; термощуп; таймер"}
for c in bf:
 n=int(c[-3:])
 er={k:"" for k in ef};er.update({"mapping_id":"EQM-BF-%03d"%n,"dish_code":c,"dish_name":bf[c][0],"menu_section":"Гостиничные завтраки","recipe_version":"PR81-DRAFT","operation_no":"1","operation_text":"Historical candidate equipment set; exact route requires Chef and load test","functional_equipment_names":bf_eq[c],"capex_requirement_statuses":"DRAFT","duration_status":"BLOCKED","capacity_status":"BLOCKED","equipment_availability_status":"NOT_CONFIRMED","connections_status":"NOT_CONFIRMED","suitability_status":"NOT_CONFIRMED","parameter_status":"DRAFT","source_date":"2026-08-04","blocker_ids":"CHEF_DECISION;EQUIPMENT_PASSPORT;LOAD_TEST","confirmation_owner":"Chef / Operations / Procurement","next_action":"Confirm equipment, model, availability and physical load"});eq.append(er)
 ir={k:"" for k in inf};ir.update({"inventory_set_code":"INVSET-BF-%03d"%n,"dish_code":c,"dish_name":bf[c][0],"menu_section":"Гостиничные завтраки","candidate_inventory":"Гастроёмкости/формы; весы; термощуп; таймер; маркировка","required_quantity":"","quantity_status":"BLOCKED","wash_dry_flow":"REQUIRES_SITE_FLOW_CONFIRMATION","cross_contact_note":"Dedicated/color-coded assignment requires hazard analysis","parameter_status":"DRAFT","blocker_ids":"CHEF_DECISION;SITE_FLOW;CROSS_CONTACT","source_date":"2026-08-04","confirmation_owner":"Chef / Operations / FoodSafetyAgent","next_action":"Confirm set and quantity by control cook"});inv.append(ir)
 tr={k:"" for k in tbf};tr.update({"tableware_set_code":"TWS-BF-%03d"%n,"dish_code":c,"dish_name":bf[c][0],"menu_section":"Гостиничные завтраки","candidate_service_set":"Тарелка/миска по решению Chef; приборы; чашка 200 мл","delivery_takeaway_packaging":"NOT_APPLICABLE_OR_UNCONFIRMED","service_status":"DRAFT","quantity_status":"BLOCKED","stock_verification_status":"BLOCKED","parameter_status":"DRAFT","blocker_ids":"CHEF_DECISION;STOCK_CHECK","source_date":"2026-08-04","confirmation_owner":"Chef / Operations","next_action":"Approve service set and verify stock"});tbl.append(tr)
wr("EQUIPMENT_FUNCTION_MATRIX_31.csv",eq,ef);wr("INVENTORY_REGISTER_31.csv",inv,inf);wr("TABLEWARE_REGISTER_31.csv",tbl,tbf)
srcs=[{"source_id":"SRC-MAIN","tier":"1","ref":BASE,"path":"docs/07-operations/issue-82/*","coverage":"28 dishes and accepted bridges","status":"CURRENT_MAIN","restriction":"No status elevation"},{"source_id":"SRC-HO","tier":"2","ref":"c07eda2ce38cb1b84d3d1db3aa675c6386368a89","path":"SESSION-20260804-03-HANDOFF.md","coverage":"transfer contract","status":"ACCEPTED_WITH_CONDITIONS","restriction":"Not subject approval"},{"source_id":"SRC-VA","tier":"2","ref":"7585632c64e53e22c6f8b1273ee6239b659d6836","path":"SESSION-20260804-03-VERIFICATION.md","coverage":"handoff quality","status":"PASS_WITH_REMARKS","restriction":"Not subject PASS"},{"source_id":"SRC-PR81","tier":"4","ref":"1e0722ad7eef9d9e8be591a6302e9d3f5dd73a23","path":"scripts/releases/build_issue_80_menu_cards.mjs","coverage":"VKM-026..028","status":"HISTORICAL_DRAFT","restriction":"Breakfast only"}]
wr("SOURCE_REGISTER_31.csv",srcs)
wr("CONFLICT_REGISTER.csv",[{"conflict_id":"CON-001","severity":"S1","finding":"Proxy values may be mistaken for evidence","resolution":"Preserve model/evidence fields and status","status":"OPEN_CONTROLLED"},{"conflict_id":"CON-002","severity":"S2","finding":"PR81 breakfast regimes lack approved evidence","resolution":"DRAFT/BLOCKED only","status":"OPEN_CONTROLLED"},{"conflict_id":"CON-003","severity":"S2","finding":"Dessert batch basis differs from sale-unit basis","resolution":"Preserve both; Chef/Costing reconciliation required","status":"OPEN"}])
wr("ISSUE82_OPEN_DEFECTS.csv",[{"defect_id":"IV-002","severity":"S1","owner_issue":"#82","status":"OPEN","disposition":"NOT_TRANSFERRED_NOT_CLOSED"},{"defect_id":"IV-003","severity":"S2","owner_issue":"#82","status":"OPEN","disposition":"NOT_TRANSFERRED_NOT_CLOSED"},{"defect_id":"IV-004","severity":"S2","owner_issue":"#82","status":"OPEN","disposition":"NOT_TRANSFERRED_NOT_CLOSED"},{"defect_id":"IV-006","severity":"S2","owner_issue":"#82","status":"OPEN","disposition":"NOT_TRANSFERRED_NOT_CLOSED"},{"defect_id":"IV-007","severity":"S2","owner_issue":"#82","status":"OPEN","disposition":"NOT_TRANSFERRED_NOT_CLOSED"}])
common_reports={
"README.md":"# VARSHAVKA Issue 80 S02\n\n31-position package for Chef review. Base "+BASE+". No production approval.",
"SESSION_MANIFEST.md":"# SESSION MANIFEST\n\nSession VAR-ISSUE-80-S02-FINAL-31-PACKAGE. Base "+BASE+". Scope VKM-001..031. Issue82 defects IV-002/S1, IV-003/S2, IV-004/S2, IV-006/S2, IV-007/S2 and safety BLOCK 28/28 remain OPEN, not transferred and not closed.",
"HANDOFF_PREFLIGHT_REPORT.md":"# HANDOFF PREFLIGHT\n\nPASS_WITH_CONDITIONS / GATE A READY. No new material drift. Accepted handoff and verification identities confirmed.",
"SOURCE_AUDIT_REPORT.md":"# SOURCE AUDIT\n\nPASS_WITH_CONTROLS. Main wins for 28 dishes; PR81 is breakfast-only historical input. Calculation and evidence layers remain separate.",
"MENU_INTEGRATION_REPORT.md":"# MENU INTEGRATION\n\nCONDITIONAL_PASS. Exact 31 codes and deterministic VKM/VKC/VKT links. Breakfast rows materialized as historical DRAFT. Dessert batch/sale basis remains open.",
"CHEF_TECHNOLOGY_REPORT.md":"# CHEF TECHNOLOGY\n\nCONDITIONAL PASS. 28 source recipes reconcile structurally; breakfast rows are DRAFT. Count-based purchase units remain distinct from mass. Unknown time, temperature and storage values are not zero-filled.",
"SEMI_FINISHED_QA_REPORT.md":"# SEMI FINISHED QA\n\nRetest PASS. 37 register records: 34 REAL_VSF_CANDIDATE and 3 BOUNDARY_ASSERTION_NOT_REAL_VSF. DAG 45 edges; recipes 278 lines/31 dishes. Duplicate IDs 0; missing child/parent/recipe refs 0; cycles 0; orphans 0; duplicate recipe-line attribution 0; DAG-child/candidate mismatch 0. Make-or-buy remains unresolved for 34 candidates and Chef confirmation is required for three breakfast boundary assertions.",
"COSTING_PRICING_REPORT.md":"# COSTING PRICING\n\n31/31 bridge and 104/104 channels preserved as model scenarios. Evidence fields remain blank where absent.",
"FOOD_SAFETY_REPORT.md":"# FOOD SAFETY\n\nBLOCK 28/28 retained. Breakfasts are also NOT_APPROVED/BLOCK pending SKU documents, hazard analysis, storage evidence and trials.",
"REGISTER_SYNC_REPORT.md":"# REGISTER SYNC\n\nDraft truth: 31/31 package prepared for Chef review; subject evidence open. Related Issues remain open; Issue82 defects are not transferred or closed."}
for n,tv in common_reports.items():md(n,tv)
screen=["# OWNER SCREEN SUMMARY — Issue #80 S02","","Base: "+BASE,"Scope: 31/31; channel keys: 104/104; recipes: DRAFT/ASSUMPTION; evidence COGS: OPEN; Chef approvals: 0/31; safety: BLOCK 28/28 and breakfasts NOT APPROVED.","","| Code | Position | Source model kitchen COGS, RUB | Comparable sale-unit model COGS, RUB | Data status | Safety |","|---|---|---:|---:|---|---|"]
for row in b:
 safety="NOT_PRODUCTION_RELEASED" if row["position_code"] in bf else cv[row["position_code"]]["safety_status"]
 comparable=row.get("sale_unit_model_complete_direct_cogs_rub","") or row.get("sale_unit_model_kitchen_cogs_rub","")
 screen.append("| {0} | {1} | {2} | {3} | {4} | {5} |".format(row["position_code"],row["position_name"],row.get("model_kitchen_cogs_rub",""),comparable,row.get("calculation_status",""),safety))
screen+=["","Excel sheets: 00_ПАСПОРТ; 01_МЕНЮ; 02_РЕЦЕПТУРЫ; 03_ПОЛУФАБРИКАТЫ; 04_КАЛЬКУЛЯЦИИ; 05_ТЕХКАРТЫ; 06_СЫРЬЁ_И_ЦЕНЫ; 07_ЦЕНООБРАЗОВАНИЕ; 08_ОБОРУДОВАНИЕ; 09_ИНВЕНТАРЬ_И_ПОСУДА; 10_АЛЛЕРГЕНЫ_БЕЗОПАСНОСТЬ; 11_ПИЩЕВАЯ_ЦЕННОСТЬ; 12_ВОПРОСЫ_ШЕФУ; 13_СОГЛАСОВАНИЕ; 14_КОНТРОЛЬНЫЕ_ПРОРАБОТКИ; 15_ПРОВЕРКИ; 16_ИСТОЧНИКИ.","","Required Owner/Chef actions: line-by-line recipe and output decision; confirm dessert divisors; choose SKUs and obtain supplier evidence; approve control-cook plan; perform physical trials; resolve safety/equipment evidence; do not merge or close without separate decision."]
md("SCREEN_SUMMARY.md","\n".join(screen))
wr("AGENT_EXECUTION_LOG.csv",[{"agent_id":"/root","role":"Orchestrator","wave":"0-5","status":"IN_PROGRESS"},{"agent_id":"/root/handoff_auditor","role":"HandoffAuditor","wave":"0","status":"ACCEPTED"},{"agent_id":"/root/source_auditor","role":"SourceAuditor","wave":"0","status":"ACCEPTED"},{"agent_id":"MenuIntegrationAgent-VAR80-S02-A04","role":"MenuIntegrationAgent","wave":"1","status":"ACCEPTED_CONDITIONAL"},{"agent_id":"CTA-VAR-80-S02-01","role":"ChefTechnologyAgent","wave":"1","status":"ACCEPTED_CONDITIONAL"}])
print(json.dumps({"menu":len(menu),"recipes":len(r),"tech":len(t),"channels":len(ch),"questions":len(q),"safety_blockers":len(s)},ensure_ascii=False))
