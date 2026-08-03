# Independent Verification Report — Issue #82

## Verdict

`CONDITIONAL`.

The frozen workbook is structurally complete and its formulas, blocker guards, source selection, recursive costing mechanics, external recalculation and semantic rebuild passed independent verification. No new S1/S2 workbook or calculation defect was found. Final `PASS` is impossible while the known subject-matter S1/S2 blockers remain open: `INT-C-002…INT-C-008` (registered as `IV-001…IV-007`). The S3 visual defect `IV-008` was corrected through CR-0002 and independently rechecked as resolved.

The workbook remains a controlled draft. This verdict does not authorize production, safety release, final pricing, nutrition declaration or owner/Chef approval.

## Frozen release candidate and method

- Workbook: `VARSHAVKA_MENU_COSTING_TECH_CARDS_DRAFT_v2.0.0.xlsx`.
- Verified post-CR-0002 SHA-256 before and after all rechecks: `914a70c4c5ba67c8cba1750a17c667157bdf97b79e0b2ea5da7ef64a114cc0b6`.
- Builder: `releases/builds/build_issue_82_menu_cards.mjs`.
- Reproducible verifier: `scripts/qa_issue_82_independent_verification.mjs`.
- Latest CR-0002 verification summary: `/tmp/issue82_independent_verification_cr0002/verification_summary.json` (temporary run evidence).
- Independent tools: `@oai/artifact-tool` import/inspect/render/recalculation, isolated LibreOffice recalc, direct CSV arithmetic and semantic rebuild comparison.

The verifier did not edit the frozen workbook or subject-matter datasets. Rebuild and formula-reactivity tests used isolated copies.

## Acceptance-control results

| Control | Result | Evidence |
|---|---:|---|
| Exact scope | PASS | 28 unique positions: `VKM-001…025`, `VKM-029…031`; no `VKM-026…028` |
| Exact workbook sheets | PASS | All 17 required names in exact order |
| Completeness | PASS | 28 × 13 = 364 nonempty, evidence-backed outcomes; no `PLANNED`, empty or template result counted |
| Stable identifiers | PASS | 28 `VKM/VKC/VKT` links and per-dish source coverage |
| Price-source partition | PASS | 46 active verified observations + 22 rejected = 68; sets disjoint and exhaustive |
| Superseded/rejected flow | PASS | 0 rejected IDs in raw selections or frozen workbook; builder imports the active register only |
| Safety-critical fields/veto | PASS as blocker preservation | 28/28 `BLOCK`; 112/112 dish critical fields null; all 140 CCP rows checked (112 null blocked limits + 28 draft traceability limits), every row has a blocker |
| Formula/error scan | PASS | 803 formulas; 0 common formula errors |
| Automatic costing recalc | PASS | All 28 rows: partial formula equals visible input; incomplete outputs remain blank |
| Formula reactivity | PASS | Test-copy change to `04_КАЛЬКУЛЯЦИИ!F6` changed `G6` by exactly 1.00 |
| LibreOffice recalc | PASS | Isolated profile/copy; Gate D 15/15 PASS; 0 formula errors after recalc |
| Mass balance | PASS (draft arithmetic only) | 28/28 `PASS_DRAFT_ARITHMETIC`; reconciled output equals target |
| Semi-finished topology | PASS | 34 VSF, 42 DAG edges, 42 mappings, 0 cycles, 0 multiply mapped recipe lines |
| Equipment/inventory/tableware links | PASS structure | 155/155 operations; 28 inventory and 28 tableware links; CAPEX references resolve |
| Unknown/zero guard | PASS | Unknown nutrition, complete COGS and pricing remain blank/null; no selected zero/negative price |
| Builder reproducibility | PASS | Isolated rebuild matches frozen workbook values (blank/null normalized) and formulas on all 17 sheets; binary SHA differs as documented |
| Visual inspection | PASS | All 17 sheets rendered and inspected; CR-0002 resolved `IV-008` and all exact sheet names are fully visible |

## Completeness: 364 deliverables

The canonical matrix has 28 rows and these 13 result fields: passport, recipe, semi-finished disposition, costing, tech card, equipment/capacity, inventory/tableware, allergen/safety, nutrition, channel pricing, Chef questions, control-cook form and approval sheet.

Every cell contains an evidence-based draft/blocker outcome rather than a template marker. The verifier also traced each dish to source/workbook records. Recipes and Chef questions contain substantive rows; control-cook and approval records have identity/status/blockers even though actuals/decisions are intentionally blank. Semi-finished coverage was derived as linked or not applicable; special reuse/production mappings such as `VKM-023 → VSF-011` were retained rather than inferred from a simple recipe marker.

## Price provenance sample

Deterministic selection: SHA-256 ordering of `issue82-iv|price_source_id`, first `ceil(46 × 20%) = 10` records. Sample rate: 21.7%. No sampled data defect was found, so escalation to 100% semantic sampling was not triggered. The full 46/22 ID partition, all normalization arithmetic and every downstream selection were nevertheless checked at 100%.

For each sampled row, the verifier matched exact workbook and CSV fields for ID, ingredient, observed product, supplier, pack quantity/unit, pack price, normalized price, date, URL, selection flag and review status. Normalization was recomputed as `pack_price_rub / pack_qty`. Live page titles confirmed product and pack for five accessible retailer pages; five retailer pages returned a tool/site internal error, so price/date evidence remains an `ESTIMATE_PUBLIC_RETAIL_BENCHMARK`, not a current supplier quotation.

| ID | Product | Pack / price | Normalized RUB/kg | Date | Exact URL | Result |
|---|---|---:|---:|---|---|---|
| PSR-0001 | Мука ЛЕНТА высший сорт | 1 kg / 54.99 | 54.990000 | 2026-08-03 | https://lenta.com/product/muka-pshenichnaya-vs-rossiya-1kg-30854/ | PASS |
| PSR-0028 | Буррата ЛЕНТА FRESH | 0.15 kg / 214.99 | 1433.266667 | 2026-08-03 | https://lenta.com/product/syr-myagkijj-burrata-bez-zmzh-rossiya-150g-712603/ | PASS |
| PSR-0005 | Дрожжи ANGEL активные | 0.10 kg / 59.99 | 599.900000 | 2026-08-03 | https://lenta.com/product/drozhzhi-suhie-aktivnye-dvypechki-i-napitkov-rossiya-100g-650540/ | PASS |
| PSR-0052 | Сливки Село Зеленое 33% | 0.50 kg / 449.99 | 899.980000 | 2026-08-03 | https://lenta.com/product/slivki-upast-dlya-vzbivaniya-33-bez-zmzh-rossiya-500g-440469/ | PASS |
| PSR-0035 | Креветки ЛЕНТА очищенные | 0.50 kg / 749.99 | 1499.980000 | 2026-08-03 | https://lenta.com/product/krevetki-ochishchennye-vm-200300-rossiya-500g-227076/ | PASS |
| PSR-0046 | Треска Borealis филе | 0.60 kg / 1249.99 | 2083.316667 | 2026-08-03 | https://www.auchan.ru/product/treska-borealis-file-bez-shkury-600-g/ | PASS; live access unavailable |
| PSR-0010 | Масло Вкуснотеево 82.5% | 0.18 kg / 199.99 | 1111.055556 | 2026-08-03 | https://lenta.com/product/maslo-slivochnoe-vkusnoteevo-tradicionnoe-825-rossiya-180g-743324/ | PASS; live access unavailable |
| PSR-0055 | Вырезка говяжья | 1 kg / 1999.99 | 1999.990000 | 2026-08-03 | https://www.auchan.ru/product/vyrezka-govyazhya-1kg/ | PASS; live access unavailable |
| PSR-0032 | Креветки Polar очищенные | 0.50 kg / 769.99 | 1539.980000 | 2026-08-03 | https://www.auchan.ru/product/krevetki-ochishchennye-polar-vareno-morozhenye-200-300-500-g/ | PASS; live access unavailable |
| PSR-0040 | Семга Русское море | 0.30 kg / 1199.99 | 3999.966667 | 2026-08-03 | https://www.auchan.ru/product/semga-russkoe-more-slabosolenaya-file-kusok-300-g/ | PASS; live access unavailable |

## Manual costing recomputation by menu section

There are eight menu sections, so eight dishes were recomputed independently. The algorithm prices unmapped raw recipe lines once, excludes lines reassigned to a mapped VSF, recursively prices each mapped VSF once and compares the partial known cost. Null remains null when no known component cost is available.

| Section | Dish | Recomputed partial RUB | Stored partial RUB | Delta |
|---|---|---:|---:|---:|
| Гарниры | VKM-023 | null | null | null |
| Горячие блюда | VKM-019 | 303.75729556 | 303.757296 | 0.00000044 |
| Десерты | VKM-029 | 834.720372315 | 834.720372 | -0.000000315 |
| Пицца | VKM-001 | 144.936420 | 144.936420 | 0 |
| Салаты | VKM-009 | 192.074166688 | 192.074167 | 0.0000003125 |
| Супы | VKM-018 | 0.949810 | 0.949810 | approximately 0 |
| Хлеб | VKM-005 | 3.260405 | 3.260405 | approximately 0 |
| Холодные закуски | VKM-013 | 439.99633337 | 439.996333 | -0.00000037 |

The sub-micro-ruble differences are decimal storage/rounding only and are below the `1e-5` acceptance tolerance.

## Formula and logical review

- `04_КАЛЬКУЛЯЦИИ`: all 28 partial formulas recalculate; complete food cost, spoilage, kitchen COGS and complete portion COGS are guarded and blank while required inputs are absent.
- `07_ЦЕНООБРАЗОВАНИЕ`: all 101 project-price/food-cost/margin/contribution outputs remain blank under the incomplete-COGS guard.
- `01_МЕНЮ`: cross-sheet COGS/price/food-cost/margin outputs remain blank rather than zero.
- `15_ПРОВЕРКИ`: 15/15 checks PASS before and after LibreOffice recalculation.
- Workbook-wide error scan found no `#REF!`, `#DIV/0!`, `#VALUE!`, `#NAME?`, `#N/A`, `#NUM!` or `#NULL!`.
- No rejected price ID appears in the workbook. Raw-material selections reference only the 46 accepted IDs.

## Visual review

All 17 worksheets were independently rendered and visually inspected. Titles, warnings, headers, input/formula/status color roles, populated ranges and key numeric outputs are visible. Tall registers are intentionally long and filterable. No blank default sheet, broken object, overlap or clipped key numeric result was observed.

`IV-008 / S3` was resolved by CR-0002: column A on `15_ПРОВЕРКИ` was widened from 18 to 38 and wrapping was enabled for A31:A47. Independent rendering confirms that all 17 exact names are fully visible without collision with column B.

## Defects and release conditions

The full register is `DEFECT_REGISTER.csv`.

- S1 open: `IV-001`, `IV-002` — recipe-version safety lock and all-dish safety veto.
- S2 open: `IV-003…IV-007` — equipment code, complete economics, nutrition, capacity and VSF decisions.
- S3 resolved: `IV-008` — CR-0002 corrected the required-sheet-name readability issue.

There are no open workbook/model defects. The existing S1/S2 subject blockers are correctly preserved and are the reason for `CONDITIONAL`, not `PASS`.

## CR-0002 independent regression recheck

- New frozen SHA-256: `914a70c4c5ba67c8cba1750a17c667157bdf97b79e0b2ea5da7ef64a114cc0b6` — PASS.
- Authorized builder diff: only column A width `18 → 38` plus `wrapText=true` on `15_ПРОВЕРКИ!A31:A47` — PASS.
- Old/new workbook comparison: 0 sheets with value differences and 0 sheets with formula differences — no subject-data change.
- Full IV regression: 28 dishes, 17 sheets, 364 outcomes, 46 accepted/22 rejected prices, 28 safety vetoes, 34 VSF, 42 DAG edges, 155 equipment operations and 803 formulas unchanged — PASS.
- Gate D: 15/15 PASS; formula/error scan: 0; formula reactivity delta: exactly 1.00 — PASS.
- Isolated LibreOffice recalculation: 15/15 PASS and 0 formula errors — PASS.
- Semantic builder rebuild: all 17-sheet values and formulas match — PASS.
- Artifact-tool render: all 17 exact names in A31:A47 are fully visible — PASS; `IV-008 RESOLVED`.

## Independent decision

`CONDITIONAL`: accept the workbook only as a controlled draft for Owner/Chef review. Keep all current blanks, nulls, statuses, EvidenceIDs and safety vetoes. Rerun integration, workbook, LibreOffice, provenance and visual verification after the responsible owners close any S1/S2 blocker or issue a new accepted handoff.
