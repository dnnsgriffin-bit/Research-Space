# Product film

The one-minute product film is generated from the real Evidence Check, not screen-recorded
by hand. Running the scripts again gives the same film, so it can be refreshed whenever the
tool changes.

| File | What it does |
|---|---|
| `capture.cjs` | Pass 1. Opens the real tool, moves a scripted cursor through six steps and saves every video frame at 3840 x 2880. Time is controlled, so each frame is exactly one sixtieth of a second after the last. |
| `film.html` | The film itself: opening and closing cards, the two framed views of the tool, the cursor, and the on-screen lines. Every style is a function of time. |
| `render.cjs` | Pass 2. Draws each frame of `film.html` at 1920 x 1080 and encodes the video. |
| `score.py` | The soundtrack: an original synthesized music bed and soft interface sounds, timed from the same timeline. No samples and no third-party audio. |
| `captions.cjs` | Captions (`.srt` for YouTube, `.vtt` for the site) and YouTube chapters, from the same timeline. |

## Make the film

```bash
# 1. Build the static preview and serve it
PREVIEW_OUT=/tmp/es-preview npx vite build --config preview/vite.config.ts
python3 -m http.server 4173 -d /tmp/es-preview &

# 2. Capture, score, caption, render (WORK is any empty folder with about 3 GB free)
export OUT=/tmp/es-film
node tools/film/capture.cjs
python3 tools/film/score.py $OUT
node tools/film/captions.cjs
AUDIO=$OUT/score-master.wav node tools/film/render.cjs   # see "Loudness" below
```

For a quick draft, run the capture with `FPS=30 DSF=1.5`. To check single frames without
rendering everything: `STILLS=12.5,19.6,48 node tools/film/render.cjs`.

### Loudness

`score.py` writes `score.wav` at a safe peak. Before muxing, bring it to about -16 LUFS:

```bash
ffmpeg -i $OUT/score.wav -af "highpass=f=35,loudnorm=I=-16:TP=-1.5:LRA=11" -ar 48000 $OUT/score-master.wav
```

## What to keep true when editing it

- Every input in the film is an example. The on-screen tag "Example inputs · illustrative,
  not real data" stays on screen for the whole product section, and the brief keeps its own
  example label.
- The film shows what the prototype does. It does not claim results, impact or ROI.
- The italic gold brand line, the gold glow that means "measured," and the dark look are
  the product's identity. The film uses the same fonts and colors as the product.
- To change the story, edit the "Choreography" section of `capture.cjs`. To change the look,
  edit `film.html`. The on-screen lines live in `capture.cjs` (`line(...)` calls).

## Sound

The music was written in code and has not been checked by ear in the session that produced
it. Listen before publishing. A silent version of the film is one command:

```bash
node tools/film/render.cjs            # no AUDIO set
```
