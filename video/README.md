# ReRoom · VR film

The Remotion project for ReRoom's VR film: step inside rooms generated with Aholo World and furnish them with your hands.

## Render it

```bash
cd video
npm install            # Remotion 4, React 19
npx remotion studio    # preview and scrub in the browser
npx remotion render src/index.ts ReRoomVR out/ReRoom-VR.mp4 --codec=h264 --crf=18
```

Needs Node 20.19+ (or 22.13+) and about 10 minutes for a full 1080p render.

## What's here

| Path | What |
|---|---|
| `src/Film.tsx` | The film: scenes, timeline, music and sound effects |
| `src/lib.tsx`, `src/theme.ts` | Type moves, glass pills, the ReRoom palette (Outfit + JetBrains Mono) |
| `src/take.json` | Timestamps of each step in the VR recording, used to time the on-screen captions |
| `public/take.mp4` | The VR recording: hands furnishing three Aholo rooms |
| `public/img/` | Logo, the three Aholo World rooms (`pano.jpg` Japandi studio, `loft.jpg`, `bedroom.jpg`), furniture renders |
| `public/audio/` | Music bed (`music.mp3`) and sound effects |
| `tools/score.py` | Synthesises the alternative original score (`music-synth.mp3`) |

## Re-record the VR footage

From the repo root, with the dev server on port 3300:

```bash
pnpm dev --port 3300
node scripts/xr-demo.mjs http://localhost:3300 tmp/tour --vr --tour --video
```

It prints `MARKS [...]`, the time of each step; copy those into `src/take.json`.
