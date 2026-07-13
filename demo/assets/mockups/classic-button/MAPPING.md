# classic-button mockup mapping (Gemini exports)

Verified jul 2026. If preview tint looks misaligned, regenerate masks from the SAME base photo.

| Pack file | Source in images/ | Role |
|-----------|-------------------|------|
| front-base.png | Gemini_Generated_Image_tjpbz0tjpbz0tjpb.png | Jersey front photo |
| back-base.png | Gemini_Generated_Image_ppcpqdppcpqdppcp.png | Jersey back photo |
| front-mask-body.png | Gemini_Generated_Image_cmllm9cmllm9cmll.png | Body tint mask |
| front-mask-sleeve.png | Gemini_Generated_Image_d5zkj5d5zkj5d5zk.png | Sleeve tint mask |
| front-mask-collar.png | Gemini_Generated_Image_m2gw19m2gw19m2gw.png | Collar/placket mask |
| back-mask-*.png | auto from back-base | Until you deliver back masks |

Re-ingest after changes:

  npm run demo:mockups:gemini

Correct mapping if wrong: edit scripts/ingest-gemini-mockups.js JERSEY_MAP.
