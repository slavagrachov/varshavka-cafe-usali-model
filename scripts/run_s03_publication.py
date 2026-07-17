from pathlib import Path
import hashlib
import json
import traceback

try:
    from s03_model_builder import TARGET, build_model
    from s03_docs_data import write_data_docs

    core, total = build_model()
    data = TARGET.read_bytes()
    sha = hashlib.sha256(data).hexdigest()
    size = len(data)
    write_data_docs(sha, size, core, total)

    for path in [
        Path('README.md'),
        Path('docs/scenarios/SCENARIO_S03_v0.1.4.md'),
        Path('docs/06-validation/SCENARIO_S03_v0.1.4_VALIDATION.md'),
        Path('docs/08-releases/S03-v0.1.4.md'),
    ]:
        text = path.read_text(encoding='utf-8')
        text = text.replace('__S03_SHA__', sha).replace('__S03_SIZE__', str(size))
        path.write_text(text, encoding='utf-8')

    changelog = Path('CHANGELOG.md')
    old = changelog.read_text(encoding='utf-8')
    if '[S03-0.1.4]' not in old:
        section = f'''\n## [S03-0.1.4] — 2026-07-17\n\n### Changed\n- Выпущена нормализованная Excel-модель S03 v0.1.4.\n- Food cost ужина связан с `ALA_COGS` и равен 30%.\n- Добавлены сравнение S02/S03 и проверка `CHK.S03.DINNER.COGS`.\n- Пересмотрены десять OPEX-параметров.\n\n### Results\n- Совокупные доходы: 43 740 200 руб.\n- Чистый результат: (3 610 432) руб.\n- Улучшение к S02: 2 350 000 руб.\n\n### Validation\n- Формул основной модели: {core}.\n- Формул всего: {total}.\n- SHA-256: `{sha}`.\n'''
        changelog.write_text(old.replace('# CHANGELOG', '# CHANGELOG\n' + section, 1), encoding='utf-8')

    Path('S03_BUILD_SUCCESS.json').write_text(
        json.dumps({'sha256': sha, 'size': size, 'core': core, 'total': total}, ensure_ascii=False, indent=2) + '\n',
        encoding='utf-8',
    )
except Exception:
    Path('S03_BUILD_TRACE.log').write_text(traceback.format_exc(), encoding='utf-8')
