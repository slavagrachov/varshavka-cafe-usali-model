# XLSX binary publication blocker — Issue #93

The exact workbook exists locally and passed QA with SHA-256 `9da67cc9297ccb0c16b6872c1cdbdde002a63455b5bd466e488bafb3a2fd3897`.

A publication attempt through the UTF-8 GitHub Contents wrapper encoded the Base64 representation as text instead of creating an exact binary XLSX blob. Therefore the repository object currently named `VKM-004_PEPPERONI_CHEF_MANAGER_APPROVAL_DRAFT_v1.0.0.xlsx` is not accepted as the workbook and must not be used.

Status: `BLOCKED_PENDING_EXACT_BINARY_GIT_BLOB_PUBLICATION`.

Required remediation:

1. replace the incorrect object with the exact binary XLSX;
2. download the repository object and confirm SHA-256;
3. repeat round-trip and exact-head verification;
4. update the PR attestation;
5. present a new Owner/Merge Gate.

Merge and Issue closure remain prohibited.
