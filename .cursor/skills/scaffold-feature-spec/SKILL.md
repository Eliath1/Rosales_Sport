---
name: scaffold-feature-spec
description: >-
  Scaffolds feature specifications from templates with acceptance criteria,
  API touchpoints, and data model notes. Use when starting a new feature,
  epic, or Wave increment before implementation.
---

# Scaffold Feature Spec

## Instructions

1. Copy structure from the feature spec template - do not invent a new format.
2. Tie every requirement to a user story and measurable acceptance criterion.
3. Cross-reference domain glossary terms; link proposed Prisma entities and API routes.
4. Flag Wave assignment (0, 1, 2...) and dependencies on external systems (ERP, payments).

## Key Workflows

### Spec creation

```
- [ ] Title, owner, wave, status
- [ ] Problem statement and New Era MX reference (if applicable)
- [ ] User stories (staff + customer personas)
- [ ] Acceptance criteria (Given/When/Then)
- [ ] Data model deltas (Prisma entities)
- [ ] API contract stubs (OpenAPI paths)
- [ ] i18n keys and bilingual copy notes
- [ ] Privacy impact (LFPDPPP) and security notes
- [ ] Out of scope / future waves
```

### Handoff to implementation

Link spec to architecture docs and assign skills: `implement-frontend-nextjs`, `implement-backend-api`, `data-modeling-prisma`.

## Reference Docs

- [docs/specs/feature-spec-template.md](../../../docs/specs/feature-spec-template.md)
- [docs/product/mvp-newera-mx-reference.md](../../../docs/product/mvp-newera-mx-reference.md)
- [docs/domain/baseball-store-glossary.md](../../../docs/domain/baseball-store-glossary.md)
- [docs/architecture/system-overview.md](../../../docs/architecture/system-overview.md)
