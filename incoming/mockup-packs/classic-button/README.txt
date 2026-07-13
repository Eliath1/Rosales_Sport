Drop RS mockup files here, then run:

  npm run demo:mockups:ingest

Required files (see docs/specs/uniform-mockup-asset-brief-photographer.md):

  front-base.png
  back-base.png
  front-mask-body.png
  front-mask-sleeve.png
  front-mask-collar.png
  back-mask-body.png
  back-mask-sleeve.png
  front-shadow.png
  back-shadow.png

Optional:

  placement.json
  README.txt (your notes: blank code, date, photographer)

Or ingest from another folder:

  $env:MOCKUP_SRC="C:\path\to\your\classic-button"; npm run demo:mockups:ingest
