---
name: validate-quality-gate
description: >-
  Runs quality gates including lint, typecheck, tests, and spec compliance
  before merge or deploy. Use when validating PRs, pre-release checks, or
  CI failures on the RS project.
---

# Validate Quality Gate

## Instructions

1. Run gates in order: install -> lint -> typecheck -> unit tests -> build.
2. Block merge if spec acceptance criteria are unmet or API contract drift exists.
3. Verify i18n: no missing keys in es-MX or en-US resource files.
4. Check privacy: no new PII fields without LFPDPPP doc update.
5. Report failures with file, command, and fix suggestion - do not skip gates.

## Key Workflows

### Pre-merge checklist

```
- [ ] npm run lint (or project equivalent)
- [ ] npm run typecheck
- [ ] npm test
- [ ] npm run build
- [ ] OpenAPI diff vs implemented routes
- [ ] Prisma migrate status clean
- [ ] No secrets in diff
```

### Wave 0 release gate

- Quote workflow happy path manually verified
- Email CRM hooks smoke-tested (staging)
- Security hardening checklist reviewed for changed surface area

## Reference Docs

- [docs/quality/quality-gates.md](../../../docs/quality/quality-gates.md)
- [docs/testing/e2e-playbook.md](../../../docs/testing/e2e-playbook.md)
- [docs/security/hardening-checklist.md](../../../docs/security/hardening-checklist.md)
- [docs/legal/lfpdppp-compliance.md](../../../docs/legal/lfpdppp-compliance.md)
