# VARSHAVKA — consolidated decision forms for 31 positions

Version: `1.0.0-DRAFT`  
Status: `METHOD_ACCEPTED / SUBJECT_DECISIONS_PENDING`

The accepted form structure does not approve recipes, yields, prices, nutrition, safety, equipment or capacity and does not remove safety vetoes.

## MECE master decisions

| Master ID | Decision | Owner | Required evidence | Status |
|---|---|---|---|---|
| MD-OWN-01 | channel and service route | Owner | dish×channel route register | PENDING |
| MD-CHEF-01 | exact recipe/version | Chef | signed versioned recipe | PENDING |
| MD-CHEF-02 | yield, loss, time, sensory, plating | Chef/Ops | physical trial protocol | PENDING_PHYSICAL_TEST |
| MD-VSF-01 | VSF variant/decomposition/make-buy | Chef/Owner | VSF card or exact SKU | PENDING |
| MD-PROC-01 | exact SKU/supplier/landed cost | Procurement/Owner | specification and dated quotation | PENDING_EXTERNAL |
| MD-PPK-01 | hazards, controls, limits, shelf life | PPK/HACCP | version-locked validation | BLOCK |
| MD-ENG-01 | model/passport/asset/connections | Engineering/Owner | passport, asset and commissioning records | PENDING_EXTERNAL_SITE |
| MD-CAP-01 | peak demand and observed throughput | Owner/Ops/Engineering | demand version and load test | PENDING_PHYSICAL_TEST |
| MD-ECON-01 | evidence COGS | Costing after accepted inputs | complete evidence input set | BLOCKED_INPUTS |
| MD-PRICE-01 | dish×channel price | Owner/Finance | evidence COGS and commercial inputs | PENDING_AFTER_COGS |
| MD-IV-01 | frozen candidate verdict | IndependentVerifier | exact SHA regression | PENDING |

## Per-position form DF-VKM-nnn

The form records:

- identity: code/name/scope/source SHA/recipe and VSF versions;
- Owner: channels, route, make-buy policy, CAPEX and peak demand;
- Chef: composition, gross/net, measured output/loss, process, timing, sensory and decision;
- Procurement: SKU, label/specification, pack/net, quotation, VAT, delivery, MOQ and validity;
- PPK/HACCP: hazards, allergens, limits, monitoring, CAPA, storage, traceability and veto;
- Engineering: function code, model/passport, asset, connections, commissioning, demand and timed load;
- Economics: evidence COGS, scenario COGS, packaging/direct costs, tax, commission, price and approval;
- closure: blockers, EvidenceIDs, change requests, frozen SHA and IV verdict.

Allowed flow: `FORM_OPEN → OWNER_DECISION_RECORDED → CHEF_DECISION_RECORDED → EVIDENCE_PENDING → PROFILE_REVIEWS_COMPLETE → FROZEN_CANDIDATE → IV_PASS`.

The 31-row coverage register is the machine-readable index of all forms.
