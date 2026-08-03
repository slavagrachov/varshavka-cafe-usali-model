# S03 — physical test and PPK/HACCP validation program for 31 positions

Artifact ID: `VAR-82-S03-PPK-VALIDATION-PROGRAM`  
Version: `0.1.0-DRAFT`  
Status: `PROGRAM_READY / EVIDENCE_NOT_RECEIVED / SAFETY_VETO_PRESERVED`

The program does not approve recipes, limits, shelf lives, equipment or safety. It does not set a universal repeat count: the PPK owner approves sampling/repetition after hazard analysis. Existing Issue #52 breakfast forms retain their own provenance.

## Gate 0 prerequisites

A series is blocked as evidence without: exact recipe/VSF lock; make-buy lock; complete SKU/lot dossier; dish×channel route; site flow and allergen changeover; exact equipment/assets/connections; identified calibrated instruments; approved PPK protocol and acceptance criteria; named RACI; immutable evidence plan.

Series ID: `S03-[DISH]-[ROUTE]-S[n]-[UTC]`.

## Process groups

1. VKM-001…004 pizza: dough/sauce VSF, actual oven load, endpoint, holding/service, allergen changeover and separate delivery simulation.
2. VKM-005…008 bread: actual bake, post-bake cooling, contamination protection, packaging and shelf-life plan.
3. VKM-009…011,015 cold RTE: receiving/cold chain, produce sanitation, opening/use-by, assembly, holding and allergens.
4. VKM-012,014 cooked components served cold: component cooking, cooling/storage, assembly and cross-contact.
5. VKM-013,017 supplier RTE animal foods: dossier/lot/cold chain/use-by, slicing, exposure and traceability.
6. VKM-016 pickled/acidified: BUY dossier or MAKE exact process plus PPK/lab validation.
7. VKM-018…022 hot animal/soup: actual load, endpoint, holding, cooling/reheat if selected, ground-meat/doneness/channel policy.
8. VKM-023…025 hot sides: actual cook and hold; rice cool/reheat only after separate validation.
9. VKM-029…031 desserts: component bake/cool/chill, assembly, packaging and shelf-life/lab plan.
10. VKM-026…028 breakfast extension: link accepted menu codes to I52 field forms; do not promote draft breakfast limits automatically.

## Forms

`S03-F01` calendar; `F02` recipe/SKU/lot; `F03` equipment/instruments; `F04` hazard controls; `F05` inputs/waste/mass balance; `F06` process time/temperature; `F07` cool/reheat/store/hold/channel; `F08` allergens/cleaning; `F09` output/sensory; `F10` trace/recall; `F11` shelf-life/lab; `F12` deviation/CAPA; `F13` decision act; `F14` immutable transfer inventory.

A technological PASS is not a safety release. Missing prerequisite, criterion, calibration, identity, signature or required result means BLOCKED. Veto review is possible only for the exact recipe×SKU/lot×equipment×load×route×channel after complete PPK evidence, trace test, closed deviations, signed decision and version-locked FoodSafety rereview.
