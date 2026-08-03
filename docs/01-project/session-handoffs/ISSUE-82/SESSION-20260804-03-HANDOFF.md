# SESSION HANDOFF — Issue #82 S03 recovery after merge

## 1. Identification

- Handoff ID: `HO-VAR-82-S03-V1.0`
- Version: `1.0`
- Date/time: `2026-08-03T22:25:48Z` (session date in Europe/Amsterdam: `2026-08-04`)
- Project/repository: `VARSHAVKA / slavagrachov/varshavka-cafe-usali-model`
- Primary Issue: [#82](https://github.com/slavagrachov/varshavka-cafe-usali-model/issues/82)
- Target Issue for a later separate session: [#80](https://github.com/slavagrachov/varshavka-cafe-usali-model/issues/80)
- Parent Issue: [#69](https://github.com/slavagrachov/varshavka-cafe-usali-model/issues/69)
- Related PRs: [#83](https://github.com/slavagrachov/varshavka-cafe-usali-model/pull/83), [#81](https://github.com/slavagrachov/varshavka-cafe-usali-model/pull/81)
- Session type: `RECOVERY / POST_MERGE_RECONCILIATION`
- Session ID: `VAR-ISSUE-82-S03-OWNER_GATE`
- Recovery branch: `agent/issue-82-s03-recovery-handoff`
- S03 result base SHA: `71516bf871fa560e890ce5bc7f858854a5335ae2`
- S03 result head SHA: `4d7096f9a6c6a6aab14676dd5fde1ea7e684d625`
- PR #83 merge/current main SHA: `cd23852fda61d9ee42dc7bae453e164c8f4d130c`
- Merge parent: `1573dc616ead7244146c8601cf61cd3c82d3c46e`
- Governance: `MULTI_AGENT_GOVERNANCE_VARSHAVKA.md v1.1.0 / Approved`, blob `418bc27f4a8caa5ebebf9e68e80acf658be002ec`
- Previous handoff: `HO-VAR-82-S02-V1.0`
- Supersedes: none
- Publication Attestation: external; exact blob/commit/comment identifiers are added after immutable publication
- Issue #82 at snapshot: `OPEN`
- Issue #80 at snapshot: `OPEN`
- Issue #69 at snapshot: `OPEN`
- PR #83 at snapshot: `CLOSED / MERGED / NOT DRAFT`
- PR #81 at snapshot: `OPEN / DRAFT / NOT MERGED`

This handoff records the S03 result and post-merge drift. It does not repeat development of 28 dishes, approve a subject result, cure the unauthorized merge, close an Issue, remove a veto, or start Issue #80.

## 2. Handoff Preflight

Preflight verdict: `READY_WITH_DRIFT`.

GitHub SSOT confirms:

- current `main` is exactly the PR #83 squash merge `cd23852fda61d9ee42dc7bae453e164c8f4d130c`; no later commit drift exists;
- PR #83 was merged at `2026-08-03T20:05:18Z`;
- Issues #82, #80 and #69 remain open;
- PR #81 remains open, draft and unmerged;
- the latest S03 package comment precedes the merge and preserves five defects and the safety veto;
- S03 final immutable handoff, its independent verification, and a post-merge attestation were absent before this recovery.

### Conflict / Drift Log

| ID | Finding | Evidence | Consequence |
|---|---|---|---|
| `GH-DRIFT-001` | PR #83 was merged after the latest written Owner statement that merge was not authorized | Owner/S03 comments [5170472832](https://github.com/slavagrachov/varshavka-cafe-usali-model/issues/82#issuecomment-5170472832), [5170791106](https://github.com/slavagrachov/varshavka-cafe-usali-model/issues/82#issuecomment-5170791106), [5170923416](https://github.com/slavagrachov/varshavka-cafe-usali-model/issues/82#issuecomment-5170923416); merge metadata | Procedural contradiction is preserved; merge is not treated as Owner acceptance |
| `GH-DRIFT-002` | Merge occurred while PR body and RC2 said `CONDITIONAL / NOT_MERGE_READY`, with S1/S2 defects and safety veto open | PR #83 body; RC2 report | Governance §13.8 Merge Gate was not satisfied |
| `GH-DRIFT-003` | PR metadata changed from `OPEN / DRAFT` to `CLOSED / MERGED`; the registers still show the former state | GitHub metadata; register blobs in merge | Both registers require recovery synchronization |
| `GH-DRIFT-004` | No final S03 SESSION HANDOFF/verification/post-merge attestation existed at merge | handoff register and comments | This recovery publication closes only the documentation gap |
| `GH-DRIFT-005` | Three workflow runs passed on PR head `4d7096f…`, but no workflow run/status exists on merge SHA | Actions runs 30846667151, 30846666839, 30846667060; merge-SHA query | Head CI is valid historical evidence; it is not merge-SHA CI |
| `GH-DRIFT-006` | PR body retains statements that it is open/draft while authoritative metadata says merged | PR #83 body and metadata | Metadata wins; stale prose is disclosed, not silently rewritten |

No separate written merge authorization was found in Issue #82 comments, PR #83 comments, reviews, or review threads. The UI merge event is not inferred to be such authorization.

## 3. Scope actually completed in S03

S03 completed organization of an evidence program and a calculation-layer bridge for all 31 active menu positions. Issue #82 substantive development scope remains the 28 positions `VKM-001…025,029…031`; the three breakfasts `VKM-026…028` are existing S04 reference inputs and share the 31-position evidence backlog.

Excluded:

- new recipe development;
- dispatching RFQs or receiving quotations;
- physical tests, control cooks, laboratory work, equipment/load tests;
- approval of recipes, prices, nutrition, safety or equipment;
- rebuilding the financial-model workbook itself;
- starting Issue #80;
- merging/closing PR #81 or closing Issues.

## 4. Two-layer result

### 4.1 Calculation layer

| Result | Coverage | Status and permitted use |
|---|---:|---|
| Position bridge | 31/31 unique menu codes | `DRAFT / ASSUMPTION / PRELIMINARY / CALCULATED`; preliminary financial-model input only |
| Channel economics bridge | 104/104 unique position×channel rows | 101 Issue #82 scenario rows plus 3 breakfast rows; planning only |
| Arithmetic/non-promotion controls | PASS | All evidence fields remain blank; no proxy promoted to evidence |
| Financial-model rebuild | 0 | Import contract and inputs prepared; target financial-model workbook was not rebuilt in S03 |

### 4.2 Evidence layer

| Dimension | Verified state at handoff |
|---|---|
| Approved recipes | 0/28 for Issue #82; three breakfasts are model references, not a new evidence release |
| Supplier quotations / evidence COGS | no RFQ dispatched; quotation/evidence registers empty; evidence COGS 0/28 |
| Approved prices | 0/101 Issue #82 dish×channel rows |
| Safety and shelf lives | safety veto `BLOCK` 28/28; no safety release asserted for breakfasts |
| Nutrition | calculated draft 28/28; laboratory confirmed 0/28; release-ready 0/28 |
| Equipment and actual performance | passport suitability 0/28; actual capacity/load proof 0/28 |
| Control cooks and physical tests | programs/forms prepared; results not performed or invented |
| Chef decisions | no approved recipes or signed physical-trial decisions |

The evidence-completion obligation remains open for all 31 positions. The calculation layer may not be promoted to evidence by merge, import, nonempty value, arithmetic PASS, or Owner acceptance of this handoff.

## 5. Open defects and vetoes

| Defect | Severity | Status | Closure evidence |
|---|---|---|---|
| `IV-002` | S1 | OPEN | Exact recipe×SKU/lot×process×route PPK/HACCP evidence, signed profile review and veto release |
| `IV-003` | S2 | OPEN | Bakery preparation requirement code and verified operation/equipment mapping |
| `IV-004` | S2 | OPEN | Complete supplier/landed-cost evidence COGS and separately approved dish×channel prices |
| `IV-006` | S2 | OPEN | Exact equipment passports/assets/connections, approved demand and timed-load evidence |
| `IV-007` | S2 | OPEN | Approved VSF variant/decomposition and make-buy decisions with linked recipe/safety/economics evidence |

Safety veto remains `BLOCK` for all 28 Issue #82 positions. No safety release is inferred for the three breakfasts.

## 6. Decisions and source hierarchy

The Owner accepted `OG-IV002`, `OG-IV003`, `OG-IV004`, `OG-IV006`, and `OG-IV007` only as projects for organizing evidence work. The exact Owner policy is in Issue #82 comment [5170791106](https://github.com/slavagrachov/varshavka-cafe-usali-model/issues/82#issuecomment-5170791106) and PR #83 comment [5170791234](https://github.com/slavagrachov/varshavka-cafe-usali-model/pull/83#issuecomment-5170791234).

Authoritative evidence used:

1. `main@cd23852fda61d9ee42dc7bae453e164c8f4d130c`;
2. Issue/PR metadata, comments, reviews and Actions;
3. immutable S01/S02 handoffs and verifications;
4. RC2 report and profile CSVs;
5. the S03 package at exact merged blobs.

No chat memory or absent external document is treated as evidence.

## 7. Actual multi-agent execution

| Role | Agent ID | Task | Delivered result | Status |
|---|---|---|---|---|
| Orchestrator | `/root` | Scope, task ledger, synthesis and immutable publication | This handoff and publication sequence | COMPLETED_FOR_HANDOFF; awaiting Owner Decision |
| GitHubStateAuditor | `/root/github_state_auditor` | Independent read-only GitHub state, chronology, CI and merge contradiction | Exact object state and six-item drift log | COMPLETED / ACCEPTED |
| HandoffAuditor | `/root/handoff_auditor` | S03 artifacts, complete per-path inventory and transfer boundary | 138-path delta plus S03 payload classification | COMPLETED / ACCEPTED_WITH_REMARKS |
| RegisterSyncAgent | `/root/register_sync_agent` | Register synchronization plan without status inflation | Exact diff plan for both registers | COMPLETED / ACCEPTED |
| IndependentVerifier | separate agent, not a preparer | Exact immutable handoff blob, SHA/inventory/attestation verification | Separate `SESSION-20260804-03-VERIFICATION.md` | PENDING after handoff blob publication |

Historical `AGENT_EXECUTION_LOG.csv` documents S03 preparers but has no row for a final S03 package IndependentVerifier; its Orchestrator row remains `IN_PROGRESS`. Recovery agents are therefore recorded here rather than falsely backdated into that historical log.

## 8. Transfer to a later separate Issue #80 session

| Issue #82/S03 output | Exact input for Issue #80 | Allowed use | Explicit exclusion |
|---|---|---|---|
| `FINMODEL_CALCULATION_BRIDGE_31.csv` | 31-position preliminary model input | Scenario/financial planning with status propagation | Not evidence COGS, approved recipe or price |
| `FINMODEL_CHANNEL_ECONOMICS_BRIDGE_104.csv` | 104-row channel scenario input | Channel planning/sensitivity | Not approved menu pricing |
| `FINMODEL_CALCULATION_BRIDGE_CONTRACT.md` | Import and non-promotion contract | Data mapping and controls | Does not authorize rebuild without a separate #80 scope |
| Two-layer policy and coverage matrix | Readiness/status controls | Preserve calculation/evidence separation | No subject PASS |
| Consolidated decision forms, RFQ/evidence schemas and PPK program | Evidence-work backlog | Plan collection and tests | No RFQ dispatch, supplier fact, test result or approval |
| Entire 138-path PR #83 delta at exact merge tree | Provenance/supporting controlled draft | Read-only source and reproducibility baseline | Historical/blocked artifacts retain their own statuses |

Open defects remain obligations of Issue #82 unless an explicit Owner decision assigns them elsewhere with owner and acceptance criteria. They are not silently transferred to Issue #80.

Issue #80 may start only in a new separate session after:

1. this exact handoff receives a separate IndependentVerifier verdict;
2. Publication Attestation is present in Issue #82 and PR #83;
3. the Owner records `ACCEPTED` or `ACCEPTED_WITH_CONDITIONS` for `HO-VAR-82-S03-V1.0`;
4. the Owner separately authorizes the bounded Issue #80 session and accepted inputs.

## 9. Verification evidence

Historical PR-head Actions at `4d7096f…`:

- [Validate Issue 82 menu package — run 30846667151](https://github.com/slavagrachov/varshavka-cafe-usali-model/actions/runs/30846667151): success;
- [Validate investment register — run 30846666839](https://github.com/slavagrachov/varshavka-cafe-usali-model/actions/runs/30846666839): success;
- [Validate S03 v0.1.7 — run 30846667060](https://github.com/slavagrachov/varshavka-cafe-usali-model/actions/runs/30846667060): success.

Recovery local rerun on exact merge tree `cd23852…`:

- costing/proxy scope: PASS;
- 28-dish integration: `PASS_WITH_CONDITIONS`;
- workbook QA: PASS, 17 sheets, 809 formulas, SHA-256 `38462a6df3c9c429e17bc759fb522f4fb6aee7c28c378d8e421c0441a14ac382`;
- independent-contract QA script: PASS;
- merge SHA Actions/statuses: none found.

These checks confirm reproducibility and structure. They do not close subject defects.

## 10. Complete per-path inventory of the PR #83 delta

Inventory boundary: all 138 paths in the squash merge delta `1573dc616ead7244146c8601cf61cd3c82d3c46e..cd23852fda61d9ee42dc7bae453e164c8f4d130c`. Blob SHAs are resolved from the exact merge tree. The 15 S03 Owner Gate paths have prefix `docs/07-operations/issue-82/s03-owner-gate/`.

| Path | Blob SHA | Purpose | Status | Limitations |
|---|---|---|---|---|
| `.github/workflows/validate-issue-82-menu-package.yml` | `63bd20951986397bc9ecd66b1fffa33885d26071` | Автоматическая проверка Issue #82 | `REPRODUCIBILITY_SUPPORT` | Не запускалась автоматически на merge SHA |
| `docs/01-project/session-handoffs/ISSUE-82/SESSION-20260803-01-HANDOFF.md` | `19ed859df5309ee0952b02ea3db9968c20bb6978` | Исторический SESSION HANDOFF S01/S02 | `IMMUTABLE HISTORICAL` | Предшествует S03 и merge |
| `docs/01-project/session-handoffs/ISSUE-82/SESSION-20260803-01-VERIFICATION.md` | `2b09b9294522414ea73c8e5a8efd3f9a8458e7a5` | Историческая verification attestation S01/S02 | `IMMUTABLE HISTORICAL` | Не S03/post-merge verification |
| `docs/01-project/session-handoffs/ISSUE-82/SESSION-20260803-02-HANDOFF.md` | `08e9a25622d1696c2359ee94580ea584d064e472` | Исторический SESSION HANDOFF S01/S02 | `IMMUTABLE HISTORICAL` | Предшествует S03 и merge |
| `docs/01-project/session-handoffs/ISSUE-82/SESSION-20260803-02-VERIFICATION.md` | `6460d5e127b76bda47b30078cdc4904e7410b933` | Историческая verification attestation S01/S02 | `IMMUTABLE HISTORICAL` | Не S03/post-merge verification |
| `docs/01-project/session-handoffs/SESSION_HANDOFF_REGISTER.md` | `cf317927067e96daa5000eaec153318e0ecce071` | Реестр межсессионных передач | `STALE_AT_MERGE / TO_SYNC` | S03 отсутствует; обновляется recovery PR |
| `docs/05-data/ISSUE_REGISTER.md` | `79347a99b2706245fa4509e6ce5977e1454e6ba0` | Сводный реестр Issues и readiness | `STALE_AT_MERGE / TO_SYNC` | PR #83 ошибочно указан OPEN/DRAFT |
| `docs/07-operations/issue-82/AGENT_EXECUTION_LOG.csv` | `24c1ff91ecc5113d5d27279dfb79955dd50a8ff5` | Журнал агентов Issue #82/S03 | `CONTROL RECORD / INCOMPLETE S03 CLOSE` | Нет final-package IV; Orchestrator S03 IN_PROGRESS |
| `docs/07-operations/issue-82/ALLERGEN_MATRIX.csv` | `7938820ebdbc9f621f73878f1bcf46fe5c27d6c0` | Безопасность, аллергены и CCP | `CONTROLLED DRAFT / BLOCK` | Safety veto 28/28; валидация открыта |
| `docs/07-operations/issue-82/ALLOWED_ASSUMPTIONS.md` | `6b03b72ce79abf665dcaaa5b08daa57febb2d714` | Поддерживающий артефакт Issue #82 | `CONTROLLED DRAFT / HISTORICAL` | Применять только с внутренним статусом и RC2 |
| `docs/07-operations/issue-82/BLOCKER_REGISTER.csv` | `ac5a1af05247ae5c3304c181b9483afcc9e461aa` | Управление дефектами, решениями и готовностью | `CONTROL RECORD` | Открытые S1/S2 сохраняются |
| `docs/07-operations/issue-82/BUILD_LOG.md` | `e91e98af4c9cce46f84fe0d1b53d16f4a0a23646` | Сборка и QA | `PASS_MECHANICS / SUBJECT OPEN` | Структура/механика, не предметная достоверность |
| `docs/07-operations/issue-82/CAPACITY_BOTTLENECK_REPORT.csv` | `49581a3f3e4b2fb1778f64828d14957a9ee0fa3d` | Оборудование, мощность и ресурсы | `DRAFT / BLOCKED` | Паспорта и load-test не подтверждены |
| `docs/07-operations/issue-82/CAPEX_TECHNICAL_GAPS.csv` | `a99ea40a5b35d6bf2acbfc27eda36b385ba27d63` | Оборудование, мощность и ресурсы | `DRAFT / BLOCKED` | Паспорта и load-test не подтверждены |
| `docs/07-operations/issue-82/CCP_CONTROL_REGISTER.csv` | `20767f8a05b5d0f5fd4eca73dfa3c9ac96b301aa` | Безопасность, аллергены и CCP | `CONTROLLED DRAFT / BLOCK` | Safety veto 28/28; валидация открыта |
| `docs/07-operations/issue-82/CHANGE_REQUEST_REGISTER.csv` | `7b574c3c67b250f6fecc0f4867c46f272d1d0a5b` | Управление дефектами, решениями и готовностью | `CONTROL RECORD` | Открытые S1/S2 сохраняются |
| `docs/07-operations/issue-82/CHANNEL_PRICING_TABLE.csv` | `da77fb959ef8bc8e074954769645143bd2421e13` | Калькуляции, цены и сценарная экономика | `ASSUMPTION / CALCULATED / BLOCKED` | Evidence COGS 0/28; цены 0/101 |
| `docs/07-operations/issue-82/CHEF_DECISION_PACK.md` | `161ac2cc98bb6542625f1981ac2ae106a3013f0b` | Рецептуры, технология, VSF или проработки | `DRAFT / PENDING VALIDATION` | Рецептуры 0/28 approved; испытания не выполнены |
| `docs/07-operations/issue-82/CHEF_QUESTIONS_REGISTER.csv` | `ec4ecb2214e66654ee6444b70ed9a38a0345b764` | Рецептуры, технология, VSF или проработки | `DRAFT / PENDING VALIDATION` | Рецептуры 0/28 approved; испытания не выполнены |
| `docs/07-operations/issue-82/CHEF_TECHNOLOGY_REMEDIATION_REPORT.md` | `edb613f6286b98deccc56e371729c3d94e8bb068` | Рецептуры, технология, VSF или проработки | `DRAFT / PENDING VALIDATION` | Рецептуры 0/28 approved; испытания не выполнены |
| `docs/07-operations/issue-82/CHEF_TECHNOLOGY_REPORT.md` | `72b347ca03184662a83f8bf0073ead71a73e8986` | Рецептуры, технология, VSF или проработки | `DRAFT / PENDING VALIDATION` | Рецептуры 0/28 approved; испытания не выполнены |
| `docs/07-operations/issue-82/COMPLETENESS_MATRIX_28x13.csv` | `c65d2db35fae5365139609324353088489dc948e` | Управление дефектами, решениями и готовностью | `CONTROL RECORD` | Открытые S1/S2 сохраняются |
| `docs/07-operations/issue-82/CONTROL_COOK_FORMS.md` | `d84cbd396ebbc6fbc4bc47e06cd10d52bb24bb10` | Рецептуры, технология, VSF или проработки | `DRAFT / PENDING VALIDATION` | Рецептуры 0/28 approved; испытания не выполнены |
| `docs/07-operations/issue-82/CONTROL_COOK_PLAN.csv` | `47db93fb25ae1562e03f0c5e7da8c23933175a6f` | Рецептуры, технология, VSF или проработки | `DRAFT / PENDING VALIDATION` | Рецептуры 0/28 approved; испытания не выполнены |
| `docs/07-operations/issue-82/COSTING_CARDS.csv` | `44a6aadd8aef03876a63ff16e92ad3b39391eb6c` | Калькуляции, цены и сценарная экономика | `ASSUMPTION / CALCULATED / BLOCKED` | Evidence COGS 0/28; цены 0/101 |
| `docs/07-operations/issue-82/COSTING_PRICING_REPORT.md` | `160533150d8da605a4722fb903b6ac65c7735059` | Калькуляции, цены и сценарная экономика | `ASSUMPTION / CALCULATED / BLOCKED` | Evidence COGS 0/28; цены 0/101 |
| `docs/07-operations/issue-82/CR-0001_COSTING_PRICE_PROVENANCE.md` | `0ed46b4f12a471d7414a98c342cf0ac20033ee26` | Калькуляции, цены и сценарная экономика | `ASSUMPTION / CALCULATED / BLOCKED` | Evidence COGS 0/28; цены 0/101 |
| `docs/07-operations/issue-82/CROSS_DOMAIN_RECONCILIATION_MATRIX.csv` | `9284c5c9956e341d72aec656bb227721bf41ab69` | Управление дефектами, решениями и готовностью | `CONTROL RECORD` | Открытые S1/S2 сохраняются |
| `docs/07-operations/issue-82/DATA_DICTIONARY.md` | `a6b403894b6d1ff9598dabcb87cea7aae9a2d750` | Поддерживающий артефакт Issue #82 | `CONTROLLED DRAFT / HISTORICAL` | Применять только с внутренним статусом и RC2 |
| `docs/07-operations/issue-82/DECISION_CONFLICT_LOG.csv` | `ab7a8ac2959829dc977c812307574985cda05b92` | Управление дефектами, решениями и готовностью | `CONTROL RECORD` | Открытые S1/S2 сохраняются |
| `docs/07-operations/issue-82/DEFECT_REGISTER.csv` | `2edc15b138438d8c8fc69259e89b8e5849be330a` | Управление дефектами, решениями и готовностью | `CONTROL RECORD` | Открытые S1/S2 сохраняются |
| `docs/07-operations/issue-82/DISH_NUTRITION.csv` | `39a75aebcad5a03a6c11d281c11b686894266070` | Пищевая ценность и источники | `CALCULATED_DRAFT / BLOCKED_FOR_RELEASE` | Лабораторное подтверждение 0/28 |
| `docs/07-operations/issue-82/DISH_PASSPORTS.csv` | `4410e78dedb76a67355bdee2a1db60ef2cb4ee31` | Поддерживающий артефакт Issue #82 | `CONTROLLED DRAFT / HISTORICAL` | Применять только с внутренним статусом и RC2 |
| `docs/07-operations/issue-82/ECONOMIC_BLOCKER_REGISTER.csv` | `f9c3a1dda6820205cfae74dd727d75ee5e40d30f` | Калькуляции, цены и сценарная экономика | `ASSUMPTION / CALCULATED / BLOCKED` | Evidence COGS 0/28; цены 0/101 |
| `docs/07-operations/issue-82/EQUIPMENT_CAPACITY_REPORT.md` | `ba2988a1c099f27759dc067071c6985e9a6b1f66` | Оборудование, мощность и ресурсы | `DRAFT / BLOCKED` | Паспорта и load-test не подтверждены |
| `docs/07-operations/issue-82/EQUIPMENT_FUNCTION_MATRIX.csv` | `524eb903976b8c4422cd262fe0e1303868148de6` | Оборудование, мощность и ресурсы | `DRAFT / BLOCKED` | Паспорта и load-test не подтверждены |
| `docs/07-operations/issue-82/EQUIPMENT_OWNER_DECISION_PACK.csv` | `809a9f7d4f4c312af4a13181cb62dad0183c5525` | Оборудование, мощность и ресурсы | `DRAFT / BLOCKED` | Паспорта и load-test не подтверждены |
| `docs/07-operations/issue-82/EVIDENCE_MATRIX.csv` | `ebfd5aff5736447a4caa4bf4b2a58d17d4b4f57a` | Происхождение и потребность в доказательствах | `CONTROL RECORD / EVIDENCE OPEN` | Не заменяет первичные документы |
| `docs/07-operations/issue-82/FINAL_INDEPENDENT_VERIFICATION_REPORT_RC1.md` | `fa2c8bc9f26fd43817943c27f72d9ad7d5c7ff1e` | Финальный IV RC1 | `FAIL / NOT_MERGE_READY / HISTORICAL` | История не переписывается |
| `docs/07-operations/issue-82/FINAL_INDEPENDENT_VERIFICATION_REPORT_RC2.md` | `7eb1a4182514cdb89b92b3849d60ef9317e9a507` | Финальный IV RC2 | `CONDITIONAL / NOT_MERGE_READY` | Пять дефектов открыты |
| `docs/07-operations/issue-82/FOOD_SAFETY_DECISION_PACK.md` | `d3ef86f83a86dd728e61409a037b34c1dd28d1e1` | Безопасность, аллергены и CCP | `CONTROLLED DRAFT / BLOCK` | Safety veto 28/28; валидация открыта |
| `docs/07-operations/issue-82/FOOD_SAFETY_REPORT.md` | `3c57993056b3b76e5c1b902a7427b89dc83508de` | Безопасность, аллергены и CCP | `CONTROLLED DRAFT / BLOCK` | Safety veto 28/28; валидация открыта |
| `docs/07-operations/issue-82/FORMULA_QA_REPORT.md` | `80097f535f3b293d9eedef716a6a066c5551626f` | Сборка и QA | `PASS_MECHANICS / SUBJECT OPEN` | Структура/механика, не предметная достоверность |
| `docs/07-operations/issue-82/GAP_REGISTER.csv` | `c882869b14add9f5774dc9b75503f7380e657691` | Управление дефектами, решениями и готовностью | `CONTROL RECORD` | Открытые S1/S2 сохраняются |
| `docs/07-operations/issue-82/HANDOFF_HOF-0001_SOURCE_AUDIT.md` | `9732f243aa8a466c4c0a1afd4027577ad8ab5cb1` | Происхождение и потребность в доказательствах | `CONTROL RECORD / EVIDENCE OPEN` | Не заменяет первичные документы |
| `docs/07-operations/issue-82/HANDOFF_HOF-0002_CHEF_TECHNOLOGY.md` | `42f82bd302371006780696a4ddb0023c35bff385` | Рецептуры, технология, VSF или проработки | `DRAFT / PENDING VALIDATION` | Рецептуры 0/28 approved; испытания не выполнены |
| `docs/07-operations/issue-82/HANDOFF_HOF-0003_FOOD_SAFETY.md` | `3b8dee4f509e85460840e869cb486c6fb5d29ac8` | Безопасность, аллергены и CCP | `CONTROLLED DRAFT / BLOCK` | Safety veto 28/28; валидация открыта |
| `docs/07-operations/issue-82/HANDOFF_HOF-0004_SEMI_FINISHED.md` | `f7dfb62dfcb5d5fe33670e60179261399e446661` | Рецептуры, технология, VSF или проработки | `DRAFT / PENDING VALIDATION` | Рецептуры 0/28 approved; испытания не выполнены |
| `docs/07-operations/issue-82/HANDOFF_HOF-0005_COSTING_PRICING.md` | `a3fc00ccead9e1dfa75bcbe2e35aa39e966dd216` | Калькуляции, цены и сценарная экономика | `ASSUMPTION / CALCULATED / BLOCKED` | Evidence COGS 0/28; цены 0/101 |
| `docs/07-operations/issue-82/HANDOFF_HOF-0005_v0.2.0_COSTING_PRICING.md` | `a3fc00ccead9e1dfa75bcbe2e35aa39e966dd216` | Калькуляции, цены и сценарная экономика | `ASSUMPTION / CALCULATED / BLOCKED` | Evidence COGS 0/28; цены 0/101 |
| `docs/07-operations/issue-82/HANDOFF_HOF-0005_v0.2.1_COSTING_PRICING.md` | `f68573d57f08f0246c3e708ea792f77026f16572` | Калькуляции, цены и сценарная экономика | `ASSUMPTION / CALCULATED / BLOCKED` | Evidence COGS 0/28; цены 0/101 |
| `docs/07-operations/issue-82/HANDOFF_HOF-0006_EQUIPMENT_CAPACITY.md` | `eaf5f2f0409fded74bf1af723b25bb1729f8aa18` | Оборудование, мощность и ресурсы | `DRAFT / BLOCKED` | Паспорта и load-test не подтверждены |
| `docs/07-operations/issue-82/HANDOFF_HOF-0007_NUTRITION.md` | `88d73b62c7d0ced097a56ccdef525394d5c4b709` | Пищевая ценность и источники | `CALCULATED_DRAFT / BLOCKED_FOR_RELEASE` | Лабораторное подтверждение 0/28 |
| `docs/07-operations/issue-82/HANDOFF_HOF-0008_INTEGRATION.md` | `f04e1488f1155d7524a8df004878c8bd37fb0a00` | Управление дефектами, решениями и готовностью | `CONTROL RECORD` | Открытые S1/S2 сохраняются |
| `docs/07-operations/issue-82/HANDOFF_HOF-0009_EXCEL.md` | `be7925d9ca2636e61c3a8b1b3897498b2293d009` | Поддерживающий артефакт Issue #82 | `CONTROLLED DRAFT / HISTORICAL` | Применять только с внутренним статусом и RC2 |
| `docs/07-operations/issue-82/HANDOFF_HOF-0010_INDEPENDENT_VERIFICATION.md` | `fd1fc942dedd116cdef45eaae3d7f8db29db405c` | Поддерживающий артефакт Issue #82 | `CONTROLLED DRAFT / HISTORICAL` | Применять только с внутренним статусом и RC2 |
| `docs/07-operations/issue-82/HANDOFF_HOF-0011_CHEF_TECHNOLOGY_REMEDIATION.md` | `ded0bb89a39b7826c0ff56fc2279faa71ee1d286` | Рецептуры, технология, VSF или проработки | `DRAFT / PENDING VALIDATION` | Рецептуры 0/28 approved; испытания не выполнены |
| `docs/07-operations/issue-82/HANDOFF_HOF-0012_FOOD_SAFETY_REMEDIATION.md` | `6a15257996778087e9ff45acd1651f6d603f8f90` | Безопасность, аллергены и CCP | `CONTROLLED DRAFT / BLOCK` | Safety veto 28/28; валидация открыта |
| `docs/07-operations/issue-82/HANDOFF_HOF-0013_NUTRITION_REMEDIATION.md` | `655720f1863ad70f75db1b705182f3544203a7a0` | Пищевая ценность и источники | `CALCULATED_DRAFT / BLOCKED_FOR_RELEASE` | Лабораторное подтверждение 0/28 |
| `docs/07-operations/issue-82/HANDOFF_HOF-0014_COSTING_PRICING_REMEDIATION.md` | `78c26e58eda0df22b9bacd9cc7cb8bcc32a27567` | Калькуляции, цены и сценарная экономика | `ASSUMPTION / CALCULATED / BLOCKED` | Evidence COGS 0/28; цены 0/101 |
| `docs/07-operations/issue-82/HANDOFF_HOF-0015_EQUIPMENT_CAPACITY_REMEDIATION.md` | `fa05d71146e0acdf4cf98bb7e17976c35057c42a` | Оборудование, мощность и ресурсы | `DRAFT / BLOCKED` | Паспорта и load-test не подтверждены |
| `docs/07-operations/issue-82/HANDOFF_HOF-0016_EXCELBUILDER_REMEDIATION.md` | `dd0bc2df6734fe8113e931e5c96fdc8014d47500` | Поддерживающий артефакт Issue #82 | `CONTROLLED DRAFT / HISTORICAL` | Применять только с внутренним статусом и RC2 |
| `docs/07-operations/issue-82/HANDOFF_HOF-0017_REGISTER_SYNC_REMEDIATION.md` | `ffe50ca299bd34baf1791b246b5ad3c88552be76` | Поддерживающий артефакт Issue #82 | `CONTROLLED DRAFT / HISTORICAL` | Применять только с внутренним статусом и RC2 |
| `docs/07-operations/issue-82/HANDOFF_HOF-0018_FINAL_INDEPENDENT_VERIFICATION.md` | `ab93c455bf5d8fcf0d55259f0f6928c4d8e960d5` | Поддерживающий артефакт Issue #82 | `CONTROLLED DRAFT / HISTORICAL` | Применять только с внутренним статусом и RC2 |
| `docs/07-operations/issue-82/HANDOFF_HOF-0019_IV-016_QA_REMEDIATION.md` | `5de10ca9478f311a8abee18ee86912be3a6ac664` | Сборка и QA | `PASS_MECHANICS / SUBJECT OPEN` | Структура/механика, не предметная достоверность |
| `docs/07-operations/issue-82/HANDOFF_HOF-0020_REGISTER_SYNC_RC2.md` | `06b5fd6e616cdc62e7f65f531e45ed55447857d8` | Поддерживающий артефакт Issue #82 | `CONTROLLED DRAFT / HISTORICAL` | Применять только с внутренним статусом и RC2 |
| `docs/07-operations/issue-82/HANDOFF_HOF-0021_FINAL_INDEPENDENT_VERIFICATION_RC2.md` | `e522f3428ce1c0936e93271f353a0830ab749802` | Поддерживающий артефакт Issue #82 | `CONTROLLED DRAFT / HISTORICAL` | Применять только с внутренним статусом и RC2 |
| `docs/07-operations/issue-82/HANDOFF_HOF-0022_FINAL_REGISTER_SYNC.md` | `3de0c1059fce879a73eece8a11a1287d1e2d8d28` | Поддерживающий артефакт Issue #82 | `CONTROLLED DRAFT / HISTORICAL` | Применять только с внутренним статусом и RC2 |
| `docs/07-operations/issue-82/HANDOFF_REGISTER.csv` | `752d4648353b9a3218a46fc9bd6595e3e0ad8012` | Поддерживающий артефакт Issue #82 | `CONTROLLED DRAFT / HISTORICAL` | Применять только с внутренним статусом и RC2 |
| `docs/07-operations/issue-82/INDEPENDENT_VERIFICATION_REPORT.md` | `4511ce6d60719eebbe93a12a034e5089441df7e7` | Ранний IV report | `CONDITIONAL / HISTORICAL` | Не финальная S03 verification |
| `docs/07-operations/issue-82/INGREDIENT_NUTRITION_REGISTER.csv` | `8caeeca48aedcfd72f1eca2a170d53d275415f6a` | Пищевая ценность и источники | `CALCULATED_DRAFT / BLOCKED_FOR_RELEASE` | Лабораторное подтверждение 0/28 |
| `docs/07-operations/issue-82/INTEGRATION_CONFLICT_REGISTER.csv` | `f21a1b2c03b58318ca065590b76b1b4721471890` | Управление дефектами, решениями и готовностью | `CONTROL RECORD` | Открытые S1/S2 сохраняются |
| `docs/07-operations/issue-82/INTEGRATION_REVIEW_REPORT.md` | `74093a59f12ce6bfe6a1bf67595d5fd0b2369519` | Управление дефектами, решениями и готовностью | `CONTROL RECORD` | Открытые S1/S2 сохраняются |
| `docs/07-operations/issue-82/INVENTORY_REGISTER.csv` | `4af9ec28e185fa3d3765d797c75601e6bc4e684e` | Оборудование, мощность и ресурсы | `DRAFT / BLOCKED` | Паспорта и load-test не подтверждены |
| `docs/07-operations/issue-82/IV-016_QA_REMEDIATION_REPORT.md` | `457bbc685f6d40e486c566e3fcd159a830837ee6` | Сборка и QA | `PASS_MECHANICS / SUBJECT OPEN` | Структура/механика, не предметная достоверность |
| `docs/07-operations/issue-82/MASS_BALANCE_REPORT.csv` | `8f21c8f70cef0eefaa5636ae782dc024e6ab60b0` | Рецептуры, технология, VSF или проработки | `DRAFT / PENDING VALIDATION` | Рецептуры 0/28 approved; испытания не выполнены |
| `docs/07-operations/issue-82/NUTRITION_CALCULATION_METHOD.md` | `0de824fec5139155ffee3b6ddeb3a1419cbb05c9` | Пищевая ценность и источники | `CALCULATED_DRAFT / BLOCKED_FOR_RELEASE` | Лабораторное подтверждение 0/28 |
| `docs/07-operations/issue-82/NUTRITION_LIMITATIONS.csv` | `55f367fb7654c4f7fcec214a99bee86058c7adca` | Пищевая ценность и источники | `CALCULATED_DRAFT / BLOCKED_FOR_RELEASE` | Лабораторное подтверждение 0/28 |
| `docs/07-operations/issue-82/NUTRITION_REMEDIATION_REPORT.md` | `3eadccfd00aeb519ed8f63e9bf6ba368364075e9` | Пищевая ценность и источники | `CALCULATED_DRAFT / BLOCKED_FOR_RELEASE` | Лабораторное подтверждение 0/28 |
| `docs/07-operations/issue-82/NUTRITION_SOURCE_REGISTER.csv` | `f13598e6a03994a02e957d1737f0c64ee75043cf` | Пищевая ценность и источники | `CALCULATED_DRAFT / BLOCKED_FOR_RELEASE` | Лабораторное подтверждение 0/28 |
| `docs/07-operations/issue-82/OWNER_CHEF_DECISION_PACK.csv` | `1de4cbaac45c6c082d23d248600ff9beee886725` | Рецептуры, технология, VSF или проработки | `DRAFT / PENDING VALIDATION` | Рецептуры 0/28 approved; испытания не выполнены |
| `docs/07-operations/issue-82/OWNER_PROCUREMENT_DECISION_PACK_ECONOMICS.csv` | `a42bf5fe3a366a95f73257599be15b3ac1854214` | Калькуляции, цены и сценарная экономика | `ASSUMPTION / CALCULATED / BLOCKED` | Evidence COGS 0/28; цены 0/101 |
| `docs/07-operations/issue-82/PRICE_SOURCE_REGISTER.csv` | `72677b346759c026b8da4350cf8f5408a2d2c0c2` | Калькуляции, цены и сценарная экономика | `ASSUMPTION / CALCULATED / BLOCKED` | Evidence COGS 0/28; цены 0/101 |
| `docs/07-operations/issue-82/PROVISIONAL_PROXY_SCENARIO_CHANNEL_PRICING.csv` | `1b12114705e7fe028b5e1c43662e44f16c480ba2` | Калькуляции, цены и сценарная экономика | `ASSUMPTION / CALCULATED / BLOCKED` | Evidence COGS 0/28; цены 0/101 |
| `docs/07-operations/issue-82/PROVISIONAL_PROXY_SCENARIO_COSTING.csv` | `211dd6956c43dbfb72de38d17c43ed8138594564` | Калькуляции, цены и сценарная экономика | `ASSUMPTION / CALCULATED / BLOCKED` | Evidence COGS 0/28; цены 0/101 |
| `docs/07-operations/issue-82/PROVISIONAL_PROXY_SCENARIO_SENSITIVITY.csv` | `6b28a19977e1794ec5575e451975c965812577d9` | Калькуляции, цены и сценарная экономика | `ASSUMPTION / CALCULATED / BLOCKED` | Evidence COGS 0/28; цены 0/101 |
| `docs/07-operations/issue-82/PROXY_SCENARIO_PRICE_REGISTER.csv` | `e028f53a3b9e8cd6e6a8aa447c36d42b73803e3c` | Калькуляции, цены и сценарная экономика | `ASSUMPTION / CALCULATED / BLOCKED` | Evidence COGS 0/28; цены 0/101 |
| `docs/07-operations/issue-82/PUBLIC_PROXY_SOURCE_REGISTER.csv` | `55ba976eb7a6f7255b91ed8e70319b01072082c5` | Калькуляции, цены и сценарная экономика | `ASSUMPTION / CALCULATED / BLOCKED` | Evidence COGS 0/28; цены 0/101 |
| `docs/07-operations/issue-82/RAW_MATERIAL_PRICE_REGISTER.csv` | `858ae4a34ffdf3155787bb9a13bddc4d13607b4e` | Калькуляции, цены и сценарная экономика | `ASSUMPTION / CALCULATED / BLOCKED` | Evidence COGS 0/28; цены 0/101 |
| `docs/07-operations/issue-82/READINESS_STATUS_REPORT.md` | `6d678d0746a5beb914107341e8965121498bcc48` | Управление дефектами, решениями и готовностью | `CONTROL RECORD` | Открытые S1/S2 сохраняются |
| `docs/07-operations/issue-82/README.md` | `9b33788a71f7d68a26711d69da984826a3c3d802` | Поддерживающий артефакт Issue #82 | `CONTROLLED DRAFT / HISTORICAL` | Применять только с внутренним статусом и RC2 |
| `docs/07-operations/issue-82/RECIPES.csv` | `c6b22ad5f2812cc989a0d3593f40e21207da8f53` | Рецептуры, технология, VSF или проработки | `DRAFT / PENDING VALIDATION` | Рецептуры 0/28 approved; испытания не выполнены |
| `docs/07-operations/issue-82/RECIPE_FREEZE_REGISTER.csv` | `f1279b63c494a62df02a6906c4c3a441fe38042a` | Рецептуры, технология, VSF или проработки | `DRAFT / PENDING VALIDATION` | Рецептуры 0/28 approved; испытания не выполнены |
| `docs/07-operations/issue-82/REQUIRED_PRIMARY_DOCUMENTS.md` | `7c51f344dbb601c2af8c3ba77c203c2357056ca4` | Происхождение и потребность в доказательствах | `CONTROL RECORD / EVIDENCE OPEN` | Не заменяет первичные документы |
| `docs/07-operations/issue-82/RESOURCE_CARDS.csv` | `2cd0c694b09f1cf968eee934fda1e02b13138867` | Оборудование, мощность и ресурсы | `DRAFT / BLOCKED` | Паспорта и load-test не подтверждены |
| `docs/07-operations/issue-82/SAFETY_BLOCKER_REGISTER.csv` | `32b274be6cc3ede33a086715012a685580caa888` | Безопасность, аллергены и CCP | `CONTROLLED DRAFT / BLOCK` | Safety veto 28/28; валидация открыта |
| `docs/07-operations/issue-82/SAFETY_CARDS.csv` | `c2623774d485fa471f913edeca44ff30c8658c8e` | Безопасность, аллергены и CCP | `CONTROLLED DRAFT / BLOCK` | Safety veto 28/28; валидация открыта |
| `docs/07-operations/issue-82/SAFETY_SOURCE_REGISTER.csv` | `d2d942377639442a15429eeb738f6c5df7c4fa4a` | Безопасность, аллергены и CCP | `CONTROLLED DRAFT / BLOCK` | Safety veto 28/28; валидация открыта |
| `docs/07-operations/issue-82/SEMI_FINISHED_CANDIDATES.csv` | `6613feb2ca746ce44bd17ad1ca55032251105783` | Рецептуры, технология, VSF или проработки | `DRAFT / PENDING VALIDATION` | Рецептуры 0/28 approved; испытания не выполнены |
| `docs/07-operations/issue-82/SEMI_FINISHED_COSTING.csv` | `2040f0185fcd17eb942c33fba9ae47c14431476f` | Калькуляции, цены и сценарная экономика | `ASSUMPTION / CALCULATED / BLOCKED` | Evidence COGS 0/28; цены 0/101 |
| `docs/07-operations/issue-82/SEMI_FINISHED_DAG.csv` | `62d9ba77503d66dba219ffa857656456afcdd82d` | Рецептуры, технология, VSF или проработки | `DRAFT / PENDING VALIDATION` | Рецептуры 0/28 approved; испытания не выполнены |
| `docs/07-operations/issue-82/SEMI_FINISHED_MAPPING.csv` | `612c75715afa772ddd64a55af56b4c29a1bcfce6` | Рецептуры, технология, VSF или проработки | `DRAFT / PENDING VALIDATION` | Рецептуры 0/28 approved; испытания не выполнены |
| `docs/07-operations/issue-82/SEMI_FINISHED_PRODUCTS.csv` | `ab0f20fb7bbc68981bf307d8c817d6d2d983bdfb` | Рецептуры, технология, VSF или проработки | `DRAFT / PENDING VALIDATION` | Рецептуры 0/28 approved; испытания не выполнены |
| `docs/07-operations/issue-82/SEMI_FINISHED_QA_REPORT.md` | `aef540869114618e7888f2ef2eb22ca6606b9004` | Рецептуры, технология, VSF или проработки | `DRAFT / PENDING VALIDATION` | Рецептуры 0/28 approved; испытания не выполнены |
| `docs/07-operations/issue-82/SEMI_FINISHED_RECIPE_LINES.csv` | `4fda8cc37165b0eb49abb5eb36b63b18abcd819c` | Рецептуры, технология, VSF или проработки | `DRAFT / PENDING VALIDATION` | Рецептуры 0/28 approved; испытания не выполнены |
| `docs/07-operations/issue-82/SENSITIVITY_REPORT.csv` | `c6d4f4ef9a073eae3da2d051e6894d61a24b4e35` | Калькуляции, цены и сценарная экономика | `ASSUMPTION / CALCULATED / BLOCKED` | Evidence COGS 0/28; цены 0/101 |
| `docs/07-operations/issue-82/SESSION_MANIFEST.md` | `a07f9d72efd0c6a5d804f1e1bf258314f917eee2` | Поддерживающий артефакт Issue #82 | `CONTROLLED DRAFT / HISTORICAL` | Применять только с внутренним статусом и RC2 |
| `docs/07-operations/issue-82/SOURCE_AUDIT.md` | `cf4062a16d5d2793a284e40915f7258747ad382d` | Происхождение и потребность в доказательствах | `CONTROL RECORD / EVIDENCE OPEN` | Не заменяет первичные документы |
| `docs/07-operations/issue-82/SOURCE_REGISTER.csv` | `4bc7a4d7cc6439ddf58f0fa4ee18af4732f34262` | Происхождение и потребность в доказательствах | `CONTROL RECORD / EVIDENCE OPEN` | Не заменяет первичные документы |
| `docs/07-operations/issue-82/TABLEWARE_REGISTER.csv` | `0659aea74726e05cc3871526d8e0995a179d14d8` | Оборудование, мощность и ресурсы | `DRAFT / BLOCKED` | Паспорта и load-test не подтверждены |
| `docs/07-operations/issue-82/TECH_CARDS.csv` | `c36595f110a8bb5fd5b28282488ef144ec6ee535` | Рецептуры, технология, VSF или проработки | `DRAFT / PENDING VALIDATION` | Рецептуры 0/28 approved; испытания не выполнены |
| `docs/07-operations/issue-82/VARSHAVKA_MENU_COSTING_TECH_CARDS_DRAFT_v2.0.0.xlsx` | `c8e4c5a9fbbad70121a7717a4395b0efb7a1b823` | Калькуляции, цены и сценарная экономика | `ASSUMPTION / CALCULATED / BLOCKED` | Evidence COGS 0/28; цены 0/101 |
| `docs/07-operations/issue-82/VISUAL_QA_REPORT.md` | `ffb79ffe39ba79e7abadce7c621c799910900fc9` | Сборка и QA | `PASS_MECHANICS / SUBJECT OPEN` | Структура/механика, не предметная достоверность |
| `docs/07-operations/issue-82/s03-owner-gate/BREAKFAST_EVIDENCE_CROSSWALK.csv` | `ad2b76d3d8b4dde5789a209dc9f3b6bf2bca920c` | Связь завтраков VKM-026…028 с legacy evidence backlog | `CANDIDATE_PROVENANCE_ONLY` | 5 строк; RFQ не отправлены; доказательства открыты |
| `docs/07-operations/issue-82/s03-owner-gate/CALCULATION_EVIDENCE_TWO_LAYER_POLICY.md` | `610c4553f25e6565b7103f92090ab904b2458fe5` | Разделение calculation/evidence | `BINDING_METHOD / NO_SUBJECT_APPROVAL` | Расчёты не повышаются до evidence |
| `docs/07-operations/issue-82/s03-owner-gate/CONSOLIDATED_DECISION_FORMS_31.md` | `ee30b9db342f8ac9f041eac495bf3ad056216801` | Формы решений для 31 позиции | `METHOD_ACCEPTED / SUBJECT_DECISIONS_PENDING` | Все предметные решения pending/blocking |
| `docs/07-operations/issue-82/s03-owner-gate/EVIDENCE_REGISTER.csv` | `5e5c7caa195d3fee2b158d4f0738cc8a1b459d09` | Схема реестра доказательств | `HEADER_ONLY` | 0 доказательств |
| `docs/07-operations/issue-82/s03-owner-gate/FINMODEL_CALCULATION_BRIDGE_31.csv` | `1cb026381f9def41b899e2487bdf11c45080efd3` | 31 строка входов финмодели | `MODEL_ONLY_NOT_EVIDENCE` | 28 proxy + 3 preliminary; evidence-поля пусты |
| `docs/07-operations/issue-82/s03-owner-gate/FINMODEL_CALCULATION_BRIDGE_CONTRACT.md` | `b62ab82c1193c64ee950f8f91a741056a78799e2` | Контракт импорта | `POPULATED_MODEL_BRIDGE_READY / EVIDENCE_BRIDGE_BLOCKED` | Запрещена подмена evidence model-значениями |
| `docs/07-operations/issue-82/s03-owner-gate/FINMODEL_CHANNEL_ECONOMICS_BRIDGE_104.csv` | `067ff02568919da9104e37250730cf61ec26ebef` | 104 position×channel строки | `MODEL_SCENARIO` | 101 не утверждены для меню; 3 breakfast preliminary |
| `docs/07-operations/issue-82/s03-owner-gate/MENU_EVIDENCE_COVERAGE_31.csv` | `556d215e5b12ec90bec8bade30f11b994092db4d` | Индекс готовности 31 позиции | `EVIDENCE OPEN / BLOCKED` | COGS 0/31; Chef approval 0/31; tests 0/31 |
| `docs/07-operations/issue-82/s03-owner-gate/PPK_PHYSICAL_VALIDATION_PROGRAM_31.md` | `bf831831e9468bfe2198f841672484fc15b94c8f` | Программа физических испытаний и PPK/HACCP | `PROGRAM_READY / EVIDENCE_NOT_RECEIVED` | Safety veto сохранён |
| `docs/07-operations/issue-82/s03-owner-gate/QUOTATION_LINE_REGISTER.csv` | `a3fb6e60d6728abff5ccd04db8fd80dabac69d6c` | Схема коммерческих предложений | `HEADER_ONLY` | 0 quotations |
| `docs/07-operations/issue-82/s03-owner-gate/README.md` | `402d2b47b98d351f8c756dac36efbc8eb674558d` | Манифест S03 | `CALCULATION_LAYER_READY / EVIDENCE_PROGRAM_OPEN` | Не разрешает approval, closure или veto removal |
| `docs/07-operations/issue-82/s03-owner-gate/RFQ_DISPATCH_LOG.csv` | `f0047be8633c28e5881819bd2e9b1ac8456ba60f` | Журнал отправки RFQ | `HEADER_ONLY` | 0 отправок |
| `docs/07-operations/issue-82/s03-owner-gate/RFQ_LINE_REGISTER.csv` | `81b31a92a9f85cfdd8b5c36b14470b6d2a79c911` | Схема строк RFQ | `HEADER_ONLY` | 0 строк RFQ |
| `docs/07-operations/issue-82/s03-owner-gate/RFQ_TEMPLATES_31.md` | `cc1319d3b5d6dcc4483acf207cae73daf29b928f` | Шаблоны ingredient/packaging/equipment RFQ | `DRAFT_NOT_SENT` | Нужна отдельная Owner dispatch authorization |
| `docs/07-operations/issue-82/s03-owner-gate/S03_PACKAGE_QA_REPORT.md` | `2737d198e8449efa211e410a793d77cb7a20ec4c` | QA структуры и арифметики | `PASS_STRUCTURE / SUBJECT_EVIDENCE_OPEN` | Не закрывает ни одного дефекта |
| `releases/builds/build_issue_82_menu_cards.mjs` | `629af585841f5d8175fbdc74b2ef216c8fab3bdc` | Воспроизводимая сборка или QA Issue #82 | `REPRODUCIBILITY_SUPPORT` | Механика/структура; не внешнее доказательство |
| `scripts/generate_issue_82_costing_pricing.py` | `39c250bd6ace2516853204786dce45eb5233f2b3` | Воспроизводимая сборка или QA Issue #82 | `REPRODUCIBILITY_SUPPORT` | Механика/структура; не внешнее доказательство |
| `scripts/generate_issue_82_equipment_capacity.py` | `8778e51497e3ce41461692d3a1b108fdd2bbcb19` | Воспроизводимая сборка или QA Issue #82 | `REPRODUCIBILITY_SUPPORT` | Механика/структура; не внешнее доказательство |
| `scripts/generate_issue_82_food_safety.mjs` | `d52811aa9193d0f536940b00e3ae010569bb92f7` | Воспроизводимая сборка или QA Issue #82 | `REPRODUCIBILITY_SUPPORT` | Механика/структура; не внешнее доказательство |
| `scripts/generate_issue_82_nutrition.py` | `927278f73d641342592bdcd0b5ef5933fc3082b9` | Воспроизводимая сборка или QA Issue #82 | `REPRODUCIBILITY_SUPPORT` | Механика/структура; не внешнее доказательство |
| `scripts/generate_issue_82_semi_finished.py` | `d5c052c6f5b434ccd9579207005230afdfd24e6d` | Воспроизводимая сборка или QA Issue #82 | `REPRODUCIBILITY_SUPPORT` | Механика/структура; не внешнее доказательство |
| `scripts/qa_issue_82_costing_pricing_remediation.py` | `2af48536120c56fac7cb2cb7cb50f32e3a2370d5` | Воспроизводимая сборка или QA Issue #82 | `REPRODUCIBILITY_SUPPORT` | Механика/структура; не внешнее доказательство |
| `scripts/qa_issue_82_independent_verification.mjs` | `08ec326718494dfc6e17e1dc0e79a025737a4ebf` | Воспроизводимая сборка или QA Issue #82 | `REPRODUCIBILITY_SUPPORT` | Механика/структура; не внешнее доказательство |
| `scripts/qa_issue_82_integration.py` | `6812f169a5cbb6ccd28be2f6cf45677b4e3f9b86` | Воспроизводимая сборка или QA Issue #82 | `REPRODUCIBILITY_SUPPORT` | Механика/структура; не внешнее доказательство |
| `scripts/qa_issue_82_workbook.py` | `4dadedff5a8aa633ae5d4aecb1f72758b18e9eef` | Воспроизводимая сборка или QA Issue #82 | `REPRODUCIBILITY_SUPPORT` | Механика/структура; не внешнее доказательство |

## 11. Next session and acceptance criteria

Recommended next action: Owner Decision on this recovery handoff. No subject development begins in this session.

Handoff acceptance criteria:

- exact merge/main SHA and GitHub states agree with SSOT;
- all 138 transmitted paths and blobs reconcile to merge tree;
- S03 calculation/evidence layers and 31/31 scope are separated;
- five defects, safety veto and merge contradiction are disclosed;
- separate verification attestation has verdict `PASS` or `PASS_WITH_REMARKS`;
- publication links and register entries resolve;
- no Issue/PR was closed or merged by recovery.

Ready-to-use prompt after Owner acceptance and separate authorization:

> Start a new separate session for Issue #80. Use only the exact inputs accepted from `HO-VAR-82-S03-V1.0` and its Verification Attestation. Treat the 31-position and 104-row bridges only as `DRAFT / ASSUMPTION / PRELIMINARY / CALCULATED` financial-model inputs. Do not transfer or close `IV-002/S1` or `IV-003/004/006/007/S2`, remove safety vetoes, approve recipes/prices/nutrition/safety/equipment, dispatch RFQs, close Issue #82, or merge/close PR #81 without separate Owner authorization. Perform a new Handoff Preflight before content work.

## 12. Prohibitions carried forward

- do not treat PR #83 merge as subject approval or as cure of the procedural contradiction;
- do not close Issues #82 or #80;
- do not merge or close PR #81;
- do not remove safety vetoes;
- do not declare recipes, prices, nutrition, safety or equipment approved;
- do not fabricate supplier, laboratory, physical-test or capacity evidence;
- do not begin Issue #80 until the two Owner decisions described above.

