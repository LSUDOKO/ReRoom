# 11 — Setup, Tools & References

## 1. Install (Aholo + 3D)

```bash
# Runtime
#   Node 22.22.1+ (Aholo Viewer requirement), pnpm (corepack enable)
npm i -g @gltf-transform/cli          # inspect/optimize GLB
#   KTX-Software (toktx) for KTX2 textures
#   ffmpeg (video, frames)

# Project packages
pnpm add @manycore/aholo-viewer three
pnpm add -D @manycore/aholo-sdk-asset @manycore/aholo-sdk-world @manycore/aholo-sdk-lux3d @manycore/aholo-sdk-core
npx @manycore/aholo-splat-transform --help
```

## 2. MCP servers for Claude Code

```bash
# Aholo Lux3D MCP — get the GLOBAL URL from aholo.ai → "Set Up MCP"
claude mcp add --transport http aholo-lux3d <GLOBAL_URL_FROM_AHOLO>

# Up-to-date library docs (three.js, Next.js, Supabase…)
claude mcp add --transport http context7 https://mcp.context7.com/mcp

# Browser testing/screenshots of the app
claude mcp add playwright -- npx @playwright/mcp@latest

# Optional: inspect/fix models in Blender (needs the Blender add-on running)
claude mcp add blender uvx blender-mcp
```
Note: the public "lux3d" skill package (infometa/workbuddyskills) is the **China** distribution bound to `api.aholo3d.cn/lux3d-mcp/mcp` — it won't work with a Global key.

## 3. Skills for Claude Code

```bash
mkdir -p .claude/skills
cp -r refs/aholo-viewer/docs/ai/skills/use-aholo-viewer .claude/skills/   # official viewer integration guide
```
Write `.claude/skills/aholo/SKILL.md` yourself: how to use `pnpm aholo`, the rules in `03` §2, and where api-notes.md lives.

## 4. Reference repos (`refs/`, gitignored)

```bash
mkdir -p refs && cd refs
git clone --depth 1 https://github.com/manycoretech/aholo-spatial-sdk
git clone --depth 1 --recurse-submodules https://github.com/manycoretech/aholo-viewer
git clone --depth 1 https://github.com/manycore-research/Aholo-Lux3D
git clone --depth 1 https://github.com/manycore-research/ComfyUI-Lux3D
git clone --depth 1 https://github.com/pmndrs/drei
git clone --depth 1 https://github.com/mrdoob/three.js   # examples/ for loaders, PMREM, controls
```

## 5. CLAUDE.md (repo root)

```md
# ReRoom — rules for Claude
- Read /docs first. Follow docs/07-build-plan.md. Keep docs/api-notes.md current.
- Aholo: SDK >= 1.8.0, region 'com', worker/server only. Read refs/aholo-spatial-sdk examples + types before coding. No guessing.
- Viewer: only lib/viewer/aholoViewer.ts touches @manycore/aholo-viewer. Read .claude/skills/use-aholo-viewer.
- Download Aholo outputs immediately (URLs expire ~2 h). Queue with AHOLO_MAX_CONCURRENCY.
- Units: meters, Y-up, floor y=0, pivot bottom-center.
- After each UI change: Playwright screenshot + console check.
- Privacy: rooms private by default; never log uploads; delete-my-data must delete storage too.
- Copy code only from MIT/Apache/CC0 sources; record in CREDITS.md.
```

## 6. Official links

| Resource | Link |
| --- | --- |
| Hackathon | https://www.aholo.ai/hackathon |
| SDK docs (canonical) | https://labs.aholo3d.com/api-docs/en/sdk |
| API reference | https://labs.aholo.ai/api-docs/en/api-reference |
| API keys (Global) | https://labs.aholo3d.com/api-keys (also reachable via labs.aholo.ai) |
| Aholo Spatial SDK (MIT) | https://github.com/manycoretech/aholo-spatial-sdk |
| Aholo Viewer (MIT) | https://github.com/manycoretech/aholo-viewer · manual https://aholojs.dev |
| Lux3D | https://github.com/manycore-research/Aholo-Lux3D · web https://lux3d.aholo3d.com |
| ComfyUI-Lux3D | https://github.com/manycore-research/ComfyUI-Lux3D |
| Manycore on X | https://x.com/ManycoreTech |

## 7. Library & design references

| Topic | Link |
| --- | --- |
| three.js docs/examples | https://threejs.org/docs · https://threejs.org/examples |
| glTF Transform | https://gltf-transform.dev |
| Next.js | https://nextjs.org/docs |
| Supabase (auth, storage, TUS uploads) | https://supabase.com/docs |
| Apple AR Quick Look | https://developer.apple.com/augmented-reality/quick-look/ |
| Android Scene Viewer | https://developers.google.com/ar/develop/scene-viewer |
| Free HDRIs / textures (CC0) | https://polyhaven.com · https://ambientcg.com |
| UI inspiration | https://www.gameuidatabase.com (not just games), https://mobbin.com, Dribbble "interior design app" |

## 8. Competitive landscape (other hackathon entries seen — do not copy, differentiate)

- Product/e-commerce 3D: Shopify → 3D + AR + video ads; single product photo → 3D + turntable + share page.
- Staging/inspection toolkits: LuxStage; SceneOps (booth props placement).
- Robotics: Proving Ground (Lux3D parts → MuJoCo + Unitree G1 in browser); BeforeStep.
- Games: Daily Teardown, Pocket Atelier, Iron Dawn (Unity vehicles), A Moment in Bloom, Long Night Inn (World API + Viewer).

**Our edge:** the *real* room (Reality scan) + furniture that *works* (articulation) + whole-room restyle, as a consumer product.
