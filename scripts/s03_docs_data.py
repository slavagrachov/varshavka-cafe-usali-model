from pathlib import Path
import csv
import json

BRANCH='scenario/9-revised-dinner-pricing-and-opex'
TARGET=Path('models/scenarios/S03/FINMODEL_VARSHAVKA_USALI_SCENARIO_S03_v0.1.4.xlsx')

def write(path,text):
    p=Path(path); p.parent.mkdir(parents=True,exist_ok=True); p.write_text(text.strip()+'\n',encoding='utf-8')

def csv_write(path,rows):
    p=Path(path); p.parent.mkdir(parents=True,exist_ok=True)
    with p.open('w',encoding='utf-8-sig',newline='') as f: csv.writer(f).writerows(rows)

def write_data_docs(sha,size,core,total):
    manifest={'schema_version':'1.3','repository':'slavagrachov/varshavka-cafe-usali-model',
      'baseline':{'version':'0.1.0','status':'approved','horizon_months':12,'area_m2':80.9},
      'scenarios':[{'code':'S02','version':'0.1.0','status':'approved','file':'models/scenarios/S02/FINMODEL_VARSHAVKA_USALI_SCENARIO_S02_v0.1.0.xlsx'},
        {'code':'S03','version':'0.1.4','status':'ready-for-review','issue':9,'branch':BRANCH,'file':str(TARGET),'sha256':sha,'size_bytes':size,
         'formula_count_core':core,'formula_count_total':total,'checks':22,
         'business_lunch':{'a_la_carte_check':1000,'discount':0.25,'calculated_check':750,'food_cost':0.40},
         'hotel_dinner':{'average_check':1000,'food_cost_source':'ALA_COGS','food_cost_rate':0.30,'unit_cogs':300,'annual_revenue':3650000,'annual_cogs':1095000},
         'key_outputs':{'project_revenue':43740200,'cafe_cogs':14099783.485714287,'cafe_opex':4100000,'cafe_gop':-3848230.451231525,'project_net_result':-3610432.4512315253}}]}
    write('inputs/model_manifest.json',json.dumps(manifest,ensure_ascii=False,indent=2))
    rows=[['code','parameter','s02_value','s03_value','status'],['S03_DINNER_CHECK','Средний чек ужина',550,1000,'рабочее допущение'],
      ['S03_DINNER_COGS','Food cost ужина',0.5,0.3,'связано с ALA_COGS'],['EQUIP_MAINT','Обслуживание оборудования',10000,0,'подтверждено'],
      ['CASH_RENT','Аренда кассового оборудования',9000,0,'подтверждено'],['COFFEE_RENT','Аренда кофемашины',10000,0,'подтверждено'],
      ['SES','СЭС',15000,2000,'подтверждено'],['VENT','Вентиляция',6000,2000,'подтверждено'],['CARPETS','Ковры',12000,5000,'допущение'],
      ['GREASE','Жироуловитель',8000,0,'допущение'],['LAUNDRY','Стирка',15000,0,'допущение'],['LEGAL','Юридические услуги',10000,0,'допущение'],
      ['STAFF_MEALS','Питание персонала',0,15000,'требует уточнения']]
    csv_write('inputs/scenarios/S03_v0.1.4_inputs.csv',rows)
    csv_write('inputs/scenarios/S03_v0.1.4_changes.csv',rows)
    monthly=[['month','s02_project_revenue','s03_project_revenue','delta'],['Сен-26',3386000,3474000,88000],['Окт-26',3540800,3628800,88000],
      ['Ноя-26',3562800,3642800,80000],['Дек-26',3614600,3702600,88000],['Янв-27',3781200,3841200,60000],['Фев-27',3329200,3405200,76000],
      ['Мар-27',3596200,3684200,88000],['Апр-27',3523800,3611800,88000],['Май-27',3656600,3740600,84000],['Июн-27',3472800,3560800,88000],
      ['Июл-27',3665600,3753600,88000],['Авг-27',3606600,3694600,88000]]
    csv_write('outputs/scenarios/S03_v0.1.4_vs_S02_monthly.csv',monthly)
    write('models/scenarios/S03/SHA256SUMS.txt',f'{sha}  FINMODEL_VARSHAVKA_USALI_SCENARIO_S03_v0.1.4.xlsx')
