# AGENTS — mandatory repository bootstrap

## Canonical data management

Before a substantive operation on tabular or structured data, read the current `slavagrachov/is-mts-gbu/main/docs/00-governance/TABULAR_DATA_MANAGEMENT_STANDARD.md`, record its version and main SHA, then apply local governance. If unavailable, block data writes with `BLOCKED / CANONICAL DATA STANDARD UNAVAILABLE`; if rules conflict, block the affected write with `BLOCKED / DATA STANDARD CONFLICT`.

## Mandatory OPS-TIME labor-accounting bootstrap

These rules apply to every substantive Issue, Task, and Work Package in this repository. The OWNER does not need to remember or request these controls; the agent must run them automatically.

Canonical sources:
- `slavagrachov/software-governance/main/docs/GPT_LABOR_ACCOUNTING.md`;
- `slavagrachov/software-governance/main/docs/PROJECT_PLANNING_AND_GPT_EFFORT_POLICY.md`.

Before substantive execution, the agent must:
1. resolve and state Project, Issue, Work Package (if applicable), and Execution Cycle;
2. right-size Work Packages: create a separate WP only when it has an independently identifiable deliverable, acceptance criterion, evidence, and measurable execution boundary; merge fragments that do not meet all four conditions;
3. keep planning, prompt preparation, evidence lookup, reconciliation, qualification, verification, coordination, and closeout out of substantive WPs; these are `GOVERNANCE_CONTROL`;
4. record Plan GPT min/max and identify the Plan/Fact row;
5. verify the OPS-TIME collector API, status `RUNNING`, current production version, current conversation identity, and absence of a blocking capture failure;
6. report `OPS-TIME START GATE — PASS` or stop with one exact blocker.

Execution and accounting:
- Prefer one substantive Assistant response per measurable WP.
- The first next turn after a substantive response must reconcile that response before new substantive work, regardless of the wording of the OWNER's next message.
- Match evidence by immutable `event_id`, `conversation_id`, and `response_message_id`/exact Assistant turn; timestamp proximity alone is insufficient.
- Keep context attribution and labor-purpose classification independent.
- Labor classes are `SUBSTANTIVE_WP`, `GOVERNANCE_CONTROL`, and `ISSUE_SCOPE_UNALLOCATED`.
- Required/conflicting context or classification fails closed and remains outside FACT.
- Only an immutable, unique, context-qualified and classification-qualified `SUBSTANTIVE_WP` event may enter WP FACT.
- Never use an estimate as FACT, create a synthetic event, rewrite raw evidence or historical `processing_seconds`, silently reassign an event, or split one event retrospectively across WPs.
- Preserve `Issue Substantive FACT = Σ qualified child WP FACT`; governance and Issue-scope unallocated labor are separate supplemental buckets.

If the event is absent or not uniquely attributable, perform one bounded evidence pass, leave FACT empty, record the evidence gap, and continue the Issue. Do not create repeated capture-recovery cycles unless a newly proven recurring defect blocks an acceptance criterion.

At Issue closeout, report Plan versus qualified substantive FACT, governance overhead, Issue-scope unallocated labor, unresolved coverage, and evidence gaps separately.
