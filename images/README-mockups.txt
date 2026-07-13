RS demo image staging (images/)

NO PHOTOGRAPHER WORKFLOW

1. Grey mockup bases -> images/mockup-classic-*.png, mockup-pants-*.png
   Map in mockup-mapping.json (bases only; masks auto-derived)

2. Catalog color presets -> images/catalog-spec.json
   Run npm run demo:catalog:compose

3. Full pipeline:

   npm run demo:mockups:bootstrap
   npm run demo:assets:sync
   npm run demo:catalog:compose
   npm run demo:mockups:test
   npm run demo:build-check

Skill: .cursor/skills/rs-mockup-image-generation/SKILL.md
Architecture: docs/architecture/mockup-asset-pipeline.md
