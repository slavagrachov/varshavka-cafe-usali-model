import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const out = path.resolve('docs/07-operations/issue-82');
const date = '2026-08-03';
const recipeVersion = '0.1.0-DRAFT';
const recipeBlobSha = execFileSync('git', ['hash-object', path.join(out, 'RECIPES.csv')], {encoding:'utf8'}).trim();
const vsfBlobSha = execFileSync('git', ['hash-object', path.join(out, 'SEMI_FINISHED_PRODUCTS.csv')], {encoding:'utf8'}).trim();
const dishes = [
  ['VKM-001','Маргарита','Пицца','hot',['GLUTEN','MILK']],
  ['VKM-002','Четыре сыра','Пицца','hot',['GLUTEN','MILK']],
  ['VKM-003','Грибная с ветчиной','Пицца','hot',['GLUTEN','MILK']],
  ['VKM-004','Пепперони','Пицца','hot',['GLUTEN','MILK']],
  ['VKM-005','Белая чиабатта','Хлеб','baked',['GLUTEN']],
  ['VKM-006','Томатная чиабатта','Хлеб','baked',['GLUTEN']],
  ['VKM-007','Бородинский хлеб','Хлеб','baked',['GLUTEN']],
  ['VKM-008','Бриошь','Хлеб','baked',['GLUTEN','MILK','EGG']],
  ['VKM-009','Буррата с томатами','Салаты','cold',['MILK']],
  ['VKM-010','Микс-салат с креветками и яблоком','Салаты','cold',['CRUSTACEAN','MUSTARD']],
  ['VKM-011','Греческий','Салаты','cold',['MILK']],
  ['VKM-012','Винегрет','Салаты','cold',[]],
  ['VKM-013','Слабосолёный лосось','Холодные закуски','cold_fish',['FISH']],
  ['VKM-014','Сельдь с запечённым картофелем','Холодные закуски','mixed_fish',['FISH']],
  ['VKM-015','Оливки и маслины','Холодные закуски','cold',[]],
  ['VKM-016','Ассорти фирменных солений','Холодные закуски','pickled',[]],
  ['VKM-017','Ростбиф с луком и гренкой','Холодные закуски','cold_meat',['GLUTEN','MUSTARD','EGG']],
  ['VKM-018','Традиционный красный борщ','Супы','hot',['MILK']],
  ['VKM-019','Мурманская треска со сливочно-горчичным соусом','Горячие блюда','hot_fish',['FISH','MILK','MUSTARD']],
  ['VKM-020','Креветки по-тайски','Горячие блюда','hot_seafood',['CRUSTACEAN']],
  ['VKM-021','Бургер VARSHAVKA','Горячие блюда','hot_meat',['GLUTEN','MILK','EGG']],
  ['VKM-022','Миньоны из говяжьей вырезки','Горячие блюда','hot_meat',[]],
  ['VKM-023','Запечённый картофель','Гарниры','hot',[]],
  ['VKM-024','Рис жасмин','Гарниры','hot',['MILK']],
  ['VKM-025','Горячие овощи','Гарниры','hot',[]],
  ['VKM-029','Черничный торт VARSHAVKA','Десерты','dessert',['GLUTEN','MILK','EGG']],
  ['VKM-030','Кростата с солёной карамелью','Десерты','dessert',['GLUTEN','MILK','EGG']],
  ['VKM-031','Мадлен','Десерты','dessert',['GLUTEN','MILK','EGG']],
];

const allergens = ['PEANUT','ASPARTAME','MUSTARD','SULPHITES','GLUTEN','SESAME','LUPIN','MOLLUSC','MILK','NUTS','CRUSTACEAN','FISH','CELERY','SOY','EGG'];
// The Issue #82 data contract requires an explicit null token for unknown facts;
// an empty field or numeric zero must not silently masquerade as a value.
const q = v => `"${String(v === null || v === undefined ? 'null' : v).replaceAll('"','""')}"`;
const csv = (headers, rows) => [headers.map(q).join(','), ...rows.map(r => headers.map(h => q(r[h])).join(','))].join('\n') + '\n';
const write = (name, headers, rows) => fs.writeFileSync(path.join(out,name), csv(headers, rows));

const danger = type => {
  if (type.includes('fish') || type.includes('seafood')) return 'temperature abuse; microbiological hazards; raw-material species/lot/document mismatch; applicable fish/seafood hazards require supplier evidence';
  if (type.includes('meat')) return 'temperature abuse; microbiological hazards; raw/ready-to-eat cross-contamination; veterinary/lot documentation gap';
  if (type === 'cold') return 'growth or transfer of microorganisms during receipt/preparation/service; contamination from raw produce or ready-to-eat components';
  if (type === 'pickled') return 'unvalidated acidification/preservation process; microbiological growth if recipe, pH and time are not validated';
  if (type === 'dessert') return 'microbiological growth in moisture-sensitive or cream/egg components; post-bake contamination; recipe-dependent';
  if (type === 'baked') return 'raw flour/egg/dairy hazards where applicable; survival if baking process is not validated; post-bake contamination';
  return 'raw-material and process-dependent microbiological hazards; survival/growth if the validated process is absent';
};

const processControl = type => {
  if (type === 'cold' || type === 'cold_fish' || type === 'cold_meat') return 'cold-chain and time-out-of-control limit';
  if (type === 'pickled') return 'validated acidification/pH/time and cold-chain limit';
  if (type === 'mixed_fish') return 'separate controls for ready-to-eat fish and cooked potato; assembly time/cold-chain';
  if (type === 'dessert') return 'validated bake/chill/storage controls by final recipe';
  if (type === 'baked') return 'validated baking endpoint and post-bake handling/storage';
  return 'validated heat-treatment, holding and/or immediate-service limits by final process';
};

const flowAssessment = type => {
  if (['cold','cold_fish','cold_meat','mixed_fish','pickled'].includes(type)) return {
    service:'Cold/RTE or mixed assembly; no lethality step may be assumed at final assembly',
    cooling:'APPLICABILITY_PENDING: cooked components must have a validated cooling route if prepared in advance; otherwise use immediate assembly/service route documented by PPK',
    reheating:'NOT_PLANNED_IN_DRAFT: any reheating is a process change requiring hazard review and validation'
  };
  if (type === 'baked') return {
    service:'Baked product followed by post-bake cooling/handling',
    cooling:'APPLICABLE: post-bake cooling and contamination protection require a validated site procedure; no numeric limit is evidenced',
    reheating:'CONDITIONAL: only if a reheat/service route is approved; no route or limit is evidenced'
  };
  if (type === 'dessert') return {
    service:'Multi-component dessert; baked and/or cream components require separate hazard review',
    cooling:'APPLICABLE_OR_COMPONENT_DEPENDENT: cooling/chilling route and limits require control-cook/site validation',
    reheating:'NOT_PLANNED_IN_DRAFT: any reheating is a process change requiring review'
  };
  return {
    service:'Hot production; immediate service versus make-ahead/holding route is not yet approved',
    cooling:'CONDITIONAL: applies if any component is prepared in advance; cooling route and limit require validation',
    reheating:'CONDITIONAL: applies only to an approved make-ahead route; reheating route and limit require validation'
  };
};

const productEvidence = (type, present, name) => {
  const ids = [];
  if (present.includes('MILK')) ids.push('EVD-FS-007');
  if (present.includes('FISH') || present.includes('CRUSTACEAN') || type.includes('fish') || type.includes('seafood')) ids.push('EVD-FS-006');
  if (type.includes('meat') || /ветчин|пепперони|ростбиф|говяж/.test(name)) ids.push('EVD-FS-008');
  return ids;
};

const cards = dishes.map(([code,name,section,type,present],i) => ({
  safety_card_id:`FSC-${String(i+1).padStart(3,'0')}`, dish_code:code, dish_name:name, section, version:'0.2.0-REMEDIATION', as_of_date:date,
  source_recipe_version:recipeVersion, source_recipe_blob_sha:recipeBlobSha, source_vsf_blob_sha:vsfBlobSha,
  assessment_scope:'Version-locked review of the current DRAFT recipe/VSF structure; not Chef approval and not operational release',
  raw_material_requirements:'Approved recipe and SKU specification; supplier/manufacturer label; conformity/veterinary documents where applicable; lot, production/expiry dates, storage and transport conditions; intact packaging and acceptance record',
  biological_hazards:danger(type),
  chemical_hazards:'allergens and additives from final SKU composition; residues/contaminants within applicable technical-regulation limits; cleaning-chemical carryover controlled by PRP',
  physical_hazards:'foreign bodies from raw materials, packaging, equipment or service ware; control method to be fixed in site HACCP/PPK',
  allergens_draft:present.length ? `${present.join(';')} — DRAFT_NAME_BASED; not final until recipe and SKU labels` : 'UNKNOWN_RECIPE_SKU; no allergen may be declared absent',
  cross_contact_controls:'Dedicated/validated cleaning and separation by workflow; identify shared flour, dairy, egg, fish, crustacean, mustard and other allergen contact after final recipe/equipment map; record changeover and staff instruction',
  temperature_critical_limit:null, cooling_critical_limit:null, reheating_critical_limit:null, storage_shelf_life:null,
  service_flow_assessment:flowAssessment(type).service,
  cooling_applicability:flowAssessment(type).cooling,
  reheating_applicability:flowAssessment(type).reheating,
  process_control_required:processControl(type),
  labeling_traceability:'Link finished batch/portion to recipe version, ingredient SKU/lot, supplier document, production date/time, responsible employee, applicable storage/use-by data, disposition and corrective action; consumer allergen information only after final composition review',
  required_confirmation:'chef-frozen recipe; all SKU labels/specifications; site HACCP/PPK hazard analysis and validated critical limits; supplier/manufacturer storage and shelf-life documents; control-cook measurements; approved labeling/traceability form',
  evidence_ids:'EVD-0003;EVD-0012;EVD-0013;EVD-0014;EVD-0015;EVD-FS-001;EVD-FS-002;EVD-FS-003',
  parameter_status:'BLOCKED_PENDING_VALIDATION', readiness_veto:'BLOCK',
  veto_reason:'Current DRAFT recipe is version-locked for review, but Chef acceptance, SKU allergen dossier, validated dish-specific limits, shelf life and site HACCP/PPK release record are absent',
  next_action:'Chef accepts or revises the locked draft; Procurement submits SKU dossier; PPK owner validates hazards/limits, actual flow and traceability before release review',
  unblock_condition:'Exact accepted recipe/VSF version + complete SKU/lot dossier + approved site flow/HACCP/PPK record + measured validation of every applicable process/cooling/reheating/storage limit + approved traceability/allergen communication; FoodSafetyAgent re-review required',
  confirmation_owner:'Chef; Procurement; Food Safety/PPK owner; Operations'
}));
write('SAFETY_CARDS.csv', Object.keys(cards[0]), cards);

const allergenRows = dishes.map(([code,name,section,type,present]) => {
  const row = {dish_code:code,dish_name:name,version:'0.2.0-REMEDIATION',as_of_date:date,source_recipe_version:recipeVersion,source_recipe_blob_sha:recipeBlobSha};
  for (const a of allergens) row[a] = present.includes(a) ? 'PRESENT_IN_LOCKED_DRAFT_RECIPE_NOT_SKU_VERIFIED' : 'UNKNOWN_NOT_ABSENT';
  if (code === 'VKM-010') { row.NUTS = 'POSSIBLE_DRAFT_VARIANT_UNRESOLVED'; row.SESAME = 'POSSIBLE_DRAFT_VARIANT_UNRESOLVED'; }
  if (code === 'VKM-020') { row.FISH = 'POSSIBLE_DRAFT_VARIANT_FISH_SAUCE'; row.SOY = 'POSSIBLE_DRAFT_VARIANT_SOY_SAUCE'; }
  Object.assign(row,{
    matrix_status:'DRAFT_BLOCKED_PENDING_VALIDATION', evidence_ids:'EVD-0012;EVD-FS-002',
    method:'Direct allergen classes derived from the exact locked DRAFT recipe names; compound ingredients/variants remain unknown; no UNKNOWN value means absence',
    required_confirmation:'Final recipe including compound ingredients; manufacturer labels/specifications for each SKU; cross-contact statements; production-flow review',
    cross_contact_status:'UNKNOWN_PENDING_SITE_FLOW_AND_EQUIPMENT_MAP', owner:'Procurement; Food Safety/PPK owner'
  });
  return row;
});
write('ALLERGEN_MATRIX.csv', Object.keys(allergenRows[0]), allergenRows);

const controls = [];
for (const [code,name,section,type,present] of dishes) {
  const common = {dish_code:code,dish_name:name,version:'0.2.0-REMEDIATION',as_of_date:date,source_recipe_version:recipeVersion,source_recipe_blob_sha:recipeBlobSha};
  const specific = productEvidence(type,present,name);
  const receiptEvidence = ['EVD-FS-001','EVD-FS-003',...specific].join(';');
  const storageEvidence = ['EVD-0014','EVD-FS-001','EVD-FS-003',...specific].join(';');
  controls.push(
    {...common,control_id:`CCP-${code}-01`,stage:'RECEIVING',control_class:'OPRP_CANDIDATE',hazard:'unacceptable/undocumented raw material; temperature abuse; lot mismatch',control_parameter:'documents, lot, integrity, manufacturer storage/transport conditions and receipt measurement where applicable',critical_limit:null,monitoring:'receiving record and document match; calibrated measurement method to be approved',corrective_action:'quarantine/reject; document deviation; prevent use until disposition',evidence_ids:receiptEvidence,status:'BLOCKED_PENDING_VALIDATION',blocker:`SBL-${code}-01`,owner:'Procurement; Food Safety/PPK owner'},
    {...common,control_id:`CCP-${code}-02`,stage:'PREPARATION_AND_CROSS_CONTACT',control_class:'PRP_OR_OPRP_TO_BE_DETERMINED',hazard:'microbiological/allergen/physical cross-contamination',control_parameter:'zoning, separation, cleaning verification, utensil/equipment changeover, hand hygiene',critical_limit:null,monitoring:'site HACCP/PPK checklist; recipe/allergen changeover record',corrective_action:'stop; isolate affected food; re-clean; assess disposition; record and retrain',evidence_ids:'EVD-FS-001;EVD-FS-002',status:'BLOCKED_PENDING_VALIDATION',blocker:`SBL-${code}-02`,owner:'Food Safety/PPK owner; Operations'},
    {...common,control_id:`CCP-${code}-03`,stage:'PROCESS',control_class:'CCP_CANDIDATE_NOT_CONFIRMED',hazard:danger(type),control_parameter:processControl(type),critical_limit:null,monitoring:'method/frequency/equipment cannot be fixed before recipe and validation',corrective_action:'do not release batch when validated limit is absent or deviation occurs; isolate and document disposition',evidence_ids:'EVD-0013;EVD-0014;EVD-FS-001',status:'BLOCKED_PENDING_VALIDATION',blocker:`SBL-${code}-03`,owner:'Food Safety/PPK owner; Chef; Operations'},
    {...common,control_id:`CCP-${code}-04`,stage:'COOLING_REHEATING_STORAGE_HOLDING_SERVICE',control_class:'OPRP_OR_CCP_CANDIDATE_NOT_CONFIRMED',hazard:'microbial growth/toxin formation or safety loss during cooling, reheating, storage, holding, delivery or service',control_parameter:`${flowAssessment(type).cooling}; ${flowAssessment(type).reheating}; manufacturer/validated storage, holding, delivery and shelf-life conditions by channel`,critical_limit:null,monitoring:'batch label and time/temperature/process record; exact method/frequency/instrument pending approved route and validation',corrective_action:'block release; isolate unvalidated, expired, untraceable or deviating product; documented disposal or justified disposition',evidence_ids:storageEvidence,status:'BLOCKED_PENDING_VALIDATION',blocker:`SBL-${code}-04`,owner:'Food Safety/PPK owner; Operations; Chef'},
    {...common,control_id:`CCP-${code}-05`,stage:'TRACEABILITY_AND_CONSUMER_INFORMATION',control_class:'PRP',hazard:'untraceable ingredient/finished batch or incomplete allergen information',control_parameter:'recipe version, SKU and lot links, production time, responsible person, channel label/allergen statement, recall/disposition record',critical_limit:'100% required traceability fields completed; allergen absence claims prohibited until evidence complete',monitoring:'record review before release and periodic traceability exercise',corrective_action:'block release; restore traceability if evidence permits; otherwise dispose/recall per approved procedure',evidence_ids:'EVD-0012;EVD-0015;EVD-FS-001;EVD-FS-002',status:'DRAFT',blocker:`SBL-${code}-05`,owner:'Food Safety/PPK owner; Operations'}
  );
}
write('CCP_CONTROL_REGISTER.csv', Object.keys(controls[0]), controls);

const blockers = [];
for (const [code,name,section,type,present] of dishes) {
  const base = {dish_code:code,dish_name:name,as_of_date:date,source_recipe_version:recipeVersion,source_recipe_blob_sha:recipeBlobSha,status:'OPEN',dish_readiness_veto:'BLOCK'};
  const specific = productEvidence(type,present,name);
  const receiptEvidence = ['EVD-0012','EVD-0016','EVD-FS-001','EVD-FS-003',...specific].join(';');
  const storageEvidence = ['EVD-0014','EVD-FS-001','EVD-FS-003',...specific].join(';');
  blockers.push(
    {...base,blocker_id:`SBL-${code}-01`,severity:'S1_CRITICAL',parameter:'raw_material_acceptance_and_SKU_evidence',reason:'Selected ingredient SKUs and primary manufacturer/supplier documents are absent',missing_input:'SKU list; labels/specifications; conformity and veterinary documents where applicable; lot/storage/transport data',impact:'raw-material safety, allergens, shelf life and traceability cannot be confirmed',owner:'Procurement',next_action:'collect and register dossier for every recipe ingredient',checkpoint:'Gate B / before procurement and service',evidence_ids:receiptEvidence},
    {...base,blocker_id:`SBL-${code}-02`,severity:'S1_CRITICAL',parameter:'allergens_and_cross_contact',reason:'Direct draft-recipe allergens are identified, but Chef acceptance, compound-ingredient/SKU composition and site cross-contact validation are absent',missing_input:'Chef-accepted exact recipe/VSF version; SKU allergen declarations; shared equipment/flow map; cleaning validation',impact:'cannot issue final allergen information or declare any allergen absence',owner:'Chef; Procurement; Food Safety/PPK owner',next_action:'accept/revise locked recipe, complete recipe-to-SKU allergen review and validate cross-contact controls',checkpoint:'Gate B / before consumer offering',evidence_ids:'EVD-0012;EVD-FS-002'},
    {...base,blocker_id:`SBL-${code}-03`,severity:'S1_CRITICAL',parameter:'critical_process_limits',reason:'Dish-specific thermal/cold/acidification/assembly process and validated limits are absent',missing_input:'final process; hazard analysis; applicable official/manufacturer limit; calibrated control-cook measurements',impact:'CCP/OPRP classification and safe release criteria cannot be approved',owner:'Food Safety/PPK owner; Chef; Operations',next_action:'perform hazard analysis and validation; document limits, monitoring and corrective actions',checkpoint:'Gate B / Issue #38',evidence_ids:'EVD-0013;EVD-FS-001'},
    {...base,blocker_id:`SBL-${code}-04`,severity:'S1_CRITICAL',parameter:'storage_cooling_reheating_shelf_life',reason:`No supported dish-specific route or limit. Cooling: ${flowAssessment(type).cooling} Reheating: ${flowAssessment(type).reheating}`,missing_input:'Owner/Chef choice of immediate-service vs make-ahead/channel flow; manufacturer conditions; official applicability review; calibrated validation/testing for each applicable stage',impact:'production planning, labels, delivery and service release are blocked',owner:'Owner; Chef; Food Safety/PPK owner; Operations',next_action:'approve the exact route, then establish and validate only applicable regimes without extrapolating unsupported values',checkpoint:'Gate B / Owner-Chef-PPK Decision Gate',evidence_ids:storageEvidence},
    {...base,blocker_id:`SBL-${code}-05`,severity:'S2_MAJOR',parameter:'labeling_and_traceability',reason:'Approved lot-to-portion traceability and consumer-information workflow is absent',missing_input:'approved form/workflow; responsibility matrix; mock trace test; channel packaging decision',impact:'batch cannot be reliably traced or released to delivery/takeaway channel',owner:'Food Safety/PPK owner; Operations; Owner',next_action:'approve form and conduct traceability exercise for the dish/channel',checkpoint:'Gate B / Gate C',evidence_ids:'EVD-0015;EVD-FS-001;EVD-FS-002'}
  );
}
write('SAFETY_BLOCKER_REGISTER.csv', Object.keys(blockers[0]), blockers);

const sources = [
  {evidence_id:'EVD-FS-001',title:'ТР ТС 021/2011 О безопасности пищевой продукции',issuer:'ЕЭК / Комиссия Таможенного союза',adoption:'Решение № 880 от 09.12.2011',version_status:'Официальная страница ЕЭК; изменения перечислены по 22.04.2024 №35, вступили 10.11.2024; проверено 2026-08-03',effective:'действует',url:'https://eec.eaeunion.org/comission/department/deptexreg/tr/PischevayaProd.php',applicability:'Articles 7, 10, 11: safety, manufacturer-set shelf life/storage, hazard analysis, CCP/monitoring/corrective actions, documentation and traceability',status:'FACT'},
  {evidence_id:'EVD-FS-002',title:'ТР ТС 022/2011 Пищевая продукция в части ее маркировки',issuer:'ЕЭК / Комиссия Таможенного союза',adoption:'Решение № 881 от 09.12.2011',version_status:'Официальная страница ЕЭК; изменения №35 от 22.04.2024 вступили 10.11.2024; проверено 2026-08-03',effective:'действует',url:'https://eec.eaeunion.org/comission/department/deptexreg/tr/PischevkaMarkirovka.php',applicability:'Article 4.4(13-17): mandatory declaration of listed allergenic components and possible presence where exclusion is impossible; final applicability depends on packaging/channel',status:'FACT'},
  {evidence_id:'EVD-FS-003',title:'СанПиН 2.3/2.4.3590-20',issuer:'Главный государственный санитарный врач РФ',adoption:'Постановление №32 от 27.10.2020; ред. постановления №9 от 22.08.2024',version_status:'Текущая редакция действует на дату среза; изменение действует с 01.03.2025; проверено 2026-08-03',effective:'до 31.08.2026 включительно; заменяется с 01.09.2026',url:'https://publication.pravo.gov.ru/document/view/0001202011120001',applicability:'Current РФ sanitary requirements for public catering; exact site/dish procedures require PPK/HACCP applicability review',status:'FACT'},
  {evidence_id:'EVD-FS-004',title:'Изменения в СанПиН 2.3/2.4.3590-20',issuer:'Главный государственный санитарный врач РФ',adoption:'Постановление №9 от 22.08.2024; рег. №80757',version_status:'Официально опубликовано 26.12.2024; вступило 01.03.2025; проверено 2026-08-03',effective:'до замены СанПиН 3590-20',url:'https://publication.pravo.gov.ru/document/0001202412260029',applicability:'Forms part of current edition on cut-off date',status:'FACT'},
  {evidence_id:'EVD-FS-005',title:'СанПиН 2.3/2.4.4282-26',issuer:'Главный государственный санитарный врач РФ',adoption:'Постановление №18 от 02.06.2026; рег. №86854',version_status:'Официально опубликовано; проверено 2026-08-03',effective:'вступает 01.09.2026; действует до 01.09.2032; НЕ действует на дату среза',url:'https://publication.pravo.gov.ru/document/0001202606020084',applicability:'Mandatory transition review before any operation/release on or after 01.09.2026; does not replace current law as of 03.08.2026',status:'MONITOR'},
  {evidence_id:'EVD-FS-006',title:'ТР ЕАЭС 040/2016 О безопасности рыбы и рыбной продукции',issuer:'ЕЭК',adoption:'Решение Совета ЕЭК №162 от 18.10.2016',version_status:'Официальная страница ЕЭК; проверено 2026-08-03',effective:'действует с 01.09.2017',url:'https://eec.eaeunion.org/comission/department/deptexreg/tr/TR_EEU_040_2016.php',applicability:'VKM-010,013,014,019,020 and fish/seafood compound ingredients; source documents and exact process requirements remain SKU-specific',status:'FACT'},
  {evidence_id:'EVD-FS-007',title:'ТР ТС 033/2013 О безопасности молока и молочной продукции',issuer:'ЕЭК',adoption:'Решение Совета ЕЭК №67 от 09.10.2013',version_status:'Официальная страница ЕЭК; проверено 2026-08-03',effective:'действует с 01.05.2014',url:'https://eec.eaeunion.org/comission/department/deptexreg/tr/tr-ts-033.php',applicability:'Dairy ingredients/SKUs identified by final recipes',status:'FACT'},
  {evidence_id:'EVD-FS-008',title:'ТР ТС 034/2013 О безопасности мяса и мясной продукции',issuer:'ЕЭК',adoption:'Решение Совета ЕЭК №68 от 09.10.2013',version_status:'Официальная страница ЕЭК; changes listed through 2023/2024; проверено 2026-08-03',effective:'действует с 01.05.2014',url:'https://eec.eaeunion.org/comission/department/deptexreg/tr/tr-ts-034.php',applicability:'Ham, pepperoni, roast beef, burger/minions and other meat SKUs identified by final recipes',status:'FACT'},
  {evidence_id:'EVD-FS-009',title:'ТР ТС 029/2012 Требования безопасности пищевых добавок, ароматизаторов и технологических вспомогательных средств',issuer:'ЕЭК',adoption:'Решение Совета ЕЭК №58 от 20.07.2012',version_status:'Официальная страница ЕЭК; изменения №84 от 29.08.2023 вступили 27.02.2024; проверено 2026-08-03',effective:'действует',url:'https://eec.eaeunion.org/comission/department/deptexreg/tr/bezopPischDobavok.php',applicability:'Compound ingredients, marinades, sauces, bakery improvers/additives after SKU selection',status:'FACT'},
  {evidence_id:'EVD-FS-010',title:'Правила оказания услуг общественного питания',issuer:'Правительство РФ',adoption:'Постановление №1515 от 21.09.2020',version_status:'Официальное опубликование; applicability/current-term legal review required before launch; checked 2026-08-03',effective:'requires final legal applicability check',url:'https://publication.pravo.gov.ru/Document/View/0001202009280045',applicability:'Consumer information and service context; does not substitute food labeling and technical-regulation requirements',status:'MONITOR'}
];
write('SAFETY_SOURCE_REGISTER.csv', Object.keys(sources[0]), sources);

const expected = new Set(dishes.map(d => d[0]));
const exactScope = rows => rows.length > 0 && rows.every(r => expected.has(r.dish_code)) && new Set(rows.map(r => r.dish_code)).size === 28;
if (!exactScope(cards) || cards.length !== 28 || !exactScope(allergenRows) || allergenRows.length !== 28) throw new Error('28-dish scope invariant failed');
if (controls.length !== 140 || blockers.length !== 140) throw new Error('28 x 5 control/blocker invariant failed');
if (![...cards,...allergenRows,...controls,...blockers].every(r => r.source_recipe_version === recipeVersion && r.source_recipe_blob_sha === recipeBlobSha)) throw new Error('recipe version/blob lock invariant failed');
if (!cards.every(r => r.source_vsf_blob_sha === vsfBlobSha && r.readiness_veto === 'BLOCK')) throw new Error('VSF lock/veto invariant failed');
if (cards.flatMap(r => [r.temperature_critical_limit,r.cooling_critical_limit,r.reheating_critical_limit,r.storage_shelf_life]).filter(v => v === null).length !== 112) throw new Error('112 critical null invariant failed');
if (!blockers.every(r => r.status === 'OPEN' && r.dish_readiness_veto === 'BLOCK' && r.owner && r.next_action && r.evidence_ids)) throw new Error('open safety blocker invariant failed');
if (!allergenRows.every(r => allergens.every(a => r[a] && !r[a].startsWith('ABSENT')))) throw new Error('allergen unknown/absence invariant failed');
if (sources.length !== 10 || !sources.every(r => r.url.startsWith('https://publication.pravo.gov.ru') || r.url.startsWith('https://eec.eaeunion.org'))) throw new Error('official source invariant failed');

console.log(JSON.stringify({recipe_version:recipeVersion,recipe_blob_sha:recipeBlobSha,vsf_blob_sha:vsfBlobSha,cards:cards.length,allergen_rows:allergenRows.length,controls:controls.length,blockers:blockers.length,critical_nulls:112,vetoes:28,sources:sources.length,result:'PASS'},null,2));
