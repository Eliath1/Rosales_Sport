---
name: document-for-learning
description: >-
  Writes learning-oriented documentation for features, decisions, and runbooks
  following RS documentation standards. Use when documenting completed work,
  onboarding material, or post-implementation guides.
---

# Document for Learning

## Instructions

1. Follow documentation standards: audience, prerequisites, steps, verification, links.
2. Follow `.cursor/rules/human-writing-style.mdc` - write like one developer explaining to another; no em dashes, emoji markers, or decorative symbols.
3. Prefer teaching over listing - explain why decisions were made, not only what changed.
4. Include diagrams for workflows longer than three steps (quotation, intake, deploy).
5. Keep docs near code: update feature docs in `docs/architecture/` when shipping.
6. Bilingual summary optional; technical docs may be English with es glossaries for domain terms.

## Key Workflows

### Post-feature documentation

```
- [ ] Update feature doc with final behavior
- [ ] Add "How to verify" section matching e2e-playbook
- [ ] Link ADR if architecture changed
- [ ] Add glossary entries for new domain terms
- [ ] Cross-link from README or docs index
```

### Learning doc structure

1. **Context** - problem and wave
2. **Walkthrough** - code paths and data flow
3. **Operations** - env vars, deploy notes
4. **Further reading** - related skills and docs

## Reference Docs

- [docs/learning/documentation-standards.md](../../../docs/learning/documentation-standards.md)
- [docs/domain/baseball-store-glossary.md](../../../docs/domain/baseball-store-glossary.md)
- [docs/specs/feature-spec-template.md](../../../docs/specs/feature-spec-template.md)
- [docs/architecture/system-overview.md](../../../docs/architecture/system-overview.md)
