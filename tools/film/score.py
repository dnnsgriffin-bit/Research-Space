"""
Product film, soundtrack: an original, synthesized music bed plus soft interface sounds,
timed from the same timeline.json the picture uses. No samples, no third-party audio.

    python3 tools/film/score.py /path/to/work     -> writes score.wav there

The bed is a calm four-chord loop in D major at 88 BPM. The tempo is chosen so the
product appears exactly on a downbeat (four bars = the 10.9 s opening).
"""
import json
import sys
import wave

import numpy as np

SR = 48000
INTRO = 10.9  # seconds before footage time 0 (matches film.html)
OUTRO = 7.2
BAR = INTRO / 4
BEAT = BAR / 4

work = sys.argv[1]
tl = json.load(open(f"{work}/timeline.json"))
footage = tl["total"] / tl["fps"]
END = INTRO + footage
TOTAL = END + OUTRO
N = int(TOTAL * SR) + SR
rng = np.random.default_rng(7)
mix = np.zeros((N, 2))
wet = np.zeros((N, 2))  # reverb send


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def add(buf, sig, t, gain=1.0, pan=0.0):
    i = int(t * SR)
    if i >= N or i < 0:
        return
    sig = sig[: N - i]
    l = np.cos((pan + 1) * np.pi / 4)
    r = np.sin((pan + 1) * np.pi / 4)
    buf[i : i + len(sig), 0] += sig * gain * l
    buf[i : i + len(sig), 1] += sig * gain * r


def env(n, attack, release):
    e = np.ones(n)
    a = min(n, int(attack * SR))
    r = min(n, int(release * SR))
    if a:
        e[:a] = 0.5 - 0.5 * np.cos(np.pi * np.arange(a) / a)
    if r:
        e[-r:] *= 0.5 + 0.5 * np.cos(np.pi * np.arange(r) / r)
    return e


def pluck(m, dur=1.6, bright=1.0):
    """A soft, felt-piano-like note: a few partials, the higher ones dying faster."""
    t = np.arange(int(dur * SR)) / SR
    f = hz(m)
    s = np.zeros_like(t)
    for k, a in enumerate([1.0, 0.42, 0.2, 0.09, 0.04], start=1):
        s += a * bright ** (k - 1) * np.sin(2 * np.pi * f * k * t * (1 + 0.0004 * k * k)) * np.exp(-t * (2.2 + 1.7 * k))
    s *= 1 - np.exp(-t * 900)  # 1 ms rise, no click
    return s * env(len(t), 0, 0.05)


def pad(m, dur):
    t = np.arange(int(dur * SR)) / SR
    f = hz(m)
    out = np.zeros((len(t), 2))
    for ch, det in enumerate([-0.0022, 0.0022]):
        ph = rng.uniform(0, 6.28)
        s = np.sin(2 * np.pi * f * (1 + det) * t + ph)
        s += 0.28 * np.sin(2 * np.pi * 2 * f * (1 - det) * t + ph * 2)
        s += 0.08 * np.sin(2 * np.pi * 3 * f * (1 + det) * t)
        s *= 1 + 0.12 * np.sin(2 * np.pi * 0.19 * t + ch * 1.3)
        out[:, ch] = s
    return out * env(len(t), min(1.4, dur * 0.35), min(2.0, dur * 0.4))[:, None]


def add_st(buf, sig, t, gain):
    i = int(t * SR)
    sig = sig[: N - i]
    buf[i : i + len(sig)] += sig * gain


def kick():
    t = np.arange(int(0.4 * SR)) / SR
    f = 44 + 62 * np.exp(-t * 26)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 8.5) * (1 - np.exp(-t * 700))


def shaker():
    n = int(0.07 * SR)
    s = rng.standard_normal(n)
    s = np.diff(s, prepend=0)  # tilt toward highs
    s = np.diff(s, prepend=0)
    return s / 4 * np.exp(-np.arange(n) / SR * 75)


def chime(m, dur=2.2):
    t = np.arange(int(dur * SR)) / SR
    f = hz(m)
    s = np.sin(2 * np.pi * f * t) * np.exp(-t * 2.4)
    s += 0.35 * np.sin(2 * np.pi * f * 2.0 * t) * np.exp(-t * 4.0)
    s += 0.16 * np.sin(2 * np.pi * f * 3.01 * t) * np.exp(-t * 6.5)
    return s * (1 - np.exp(-t * 500))


def tick():
    t = np.arange(int(0.045 * SR)) / SR
    s = np.sin(2 * np.pi * 1850 * t) * np.exp(-t * 170)
    s += 0.5 * rng.standard_normal(len(t)) * np.exp(-t * 420)
    return s


# Chords: bass note, pad voicing, arpeggio tones.
D = (38, [50, 57, 64, 66], [62, 66, 69, 73, 76])
Bm = (35, [47, 54, 57, 62], [59, 62, 66, 69, 74])
G = (43, [55, 59, 62, 66], [62, 67, 71, 74, 78])
A = (45, [57, 59, 64, 69], [61, 64, 69, 71, 76])
ARP = [0, 2, 1, 3, 2, 4, 1, 3]

# Bars: the opening holds D, lifts through G and A, and lands on D as the product appears.
bars = [D, D, G, A]
loop = [D, D, Bm, Bm, G, G, A, A]
first_end_bar = int(np.ceil(END / BAR))
i = 0
while len(bars) < first_end_bar:
    bars.append(loop[i % len(loop)])
    i += 1
bars += [G]  # one bar of lift under the closing line, then home
while len(bars) * BAR < TOTAL + BAR:
    bars.append(D)

events = tl["events"]
lines = [e for e in events if e["type"] == "line"]
clicks = [e for e in events if e["type"] == "click"]
step_t = {e["n"]: INTRO + e["t"] / 1000 for e in lines}
beat_on = int(np.ceil(step_t[2] / BAR))  # the pulse joins at the first bar of step 2
beat_off = int(np.floor(step_t[6] / BAR))  # and leaves when the brief appears

for b, (bass, voicing, tones) in enumerate(bars):
    t0 = b * BAR
    if t0 > TOTAL:
        break
    in_product = 4 <= b < first_end_bar
    closing = b >= first_end_bar
    # Pad: one swell per bar, overlapping the next.
    level = 0.016 if b < 4 else (0.013 if in_product else 0.02)
    for m in voicing[1:] + [voicing[2] + 12]:
        add_st(mix, pad(m, BAR * 1.5), t0, level)
        add_st(wet, pad(m, BAR * 1.5), t0, level * 0.5)
    # Bass: a soft root with its octave so small speakers still carry it.
    if b >= 4:
        dur = BAR * (1.0 if not closing else 2.0)
        t = np.arange(int(dur * SR)) / SR
        s = (np.sin(2 * np.pi * hz(bass) * t) + 0.45 * np.sin(2 * np.pi * hz(bass + 12) * t)) * env(len(t), 0.06, 0.5)
        add(mix, s, t0, 0.06)
    # Arpeggio in eighths.
    if in_product:
        for k, idx in enumerate(ARP):
            vel = (0.2 if k % 2 == 0 else 0.14) * rng.uniform(0.85, 1.1)
            tt = t0 + k * BEAT / 2 + rng.uniform(-0.004, 0.004)
            n = pluck(tones[idx], 1.5, 1.25)
            pan = -0.35 if k % 2 == 0 else 0.35
            add(mix, n, tt, vel, pan)
            add(wet, n, tt, vel * 0.55, pan)
    # Pulse.
    if beat_on <= b < beat_off:
        for k in range(4):
            if k in (0, 2):
                add(mix, kick(), t0 + k * BEAT, 0.15)
        for k in range(16):
            acc = 0.03 if k % 4 == 2 else 0.014
            add(mix, shaker(), t0 + k * BEAT / 4, acc * rng.uniform(0.8, 1.1), 0.25 if k % 2 else -0.25)

# Opening: single notes placed on the words.
for t, m, v in [(0.35, 62, 0.2), (0.95, 69, 0.14), (1.75, 74, 0.2), (2.1, 78, 0.14), (2.45, 81, 0.11)]:
    n = pluck(m, 2.4, 0.9)
    add(mix, n, t, v)
    add(wet, n, t, v * 0.9)
# The first link ignites (5.75 s), the bracket appears (6.9 s), the lockup lands (8.85 s).
for t, m, v in [(5.75, 78, 0.1), (6.9, 71, 0.07), (7.08, 74, 0.07), (7.26, 78, 0.07), (8.85, 73, 0.1), (9.55, 76, 0.08)]:
    n = chime(m)
    add(mix, n, t, v)
    add(wet, n, t, v)

# Interface sounds: a tick on every click, a small chime when a tick lights the chain.
for j, c in enumerate(clicks):
    t = INTRO + c["t"] / 1000
    add(mix, tick(), t, 0.05)
    step = max(n for n, st in step_t.items() if st <= t + 0.01)
    if step == 2:
        n = chime(81 if j == 1 else 85, 1.8)
        add(mix, n, t + 0.16, 0.07)
        add(wet, n, t + 0.16, 0.08)
    if step == 5:  # the reported barrier: a lower, plainer tone
        n = chime(66, 1.6)
        add(mix, n, t + 0.14, 0.07)
        add(wet, n, t + 0.14, 0.06)
    if step == 6:  # brief copied
        for d, m in [(0.12, 78), (0.24, 85)]:
            n = chime(m, 1.6)
            add(mix, n, t + d, 0.06)
            add(wet, n, t + d, 0.07)

# Closing: a slow rising figure that resolves on D.
for d, m, v in [(0.45, 62, 0.2), (0.45 + BEAT, 66, 0.16), (0.45 + 2 * BEAT, 69, 0.16), (BAR + 0.45, 74, 0.2), (BAR + 0.45 + BEAT, 78, 0.16), (BAR + 0.45 + 2 * BEAT, 81, 0.14), (2 * BAR + 0.4, 86, 0.1)]:
    n = pluck(m, 3.0, 0.9)
    add(mix, n, END + d, v)
    add(wet, n, END + d, v)

# Reverb: convolve the send with a decaying, darkened noise tail.
ir_n = int(2.4 * SR)
tt = np.arange(ir_n) / SR
ir = rng.standard_normal((ir_n, 2)) * np.exp(-tt * 2.6)[:, None]
for _ in range(3):  # darken
    ir = (ir + np.roll(ir, 1, axis=0)) / 2
ir[: int(0.012 * SR)] = 0
size = 1
while size < N + ir_n:
    size *= 2
for ch in range(2):
    y = np.fft.irfft(np.fft.rfft(wet[:, ch], size) * np.fft.rfft(ir[:, ch], size), size)[:N]
    mix[:, ch] += y * 0.035

# Master: gentle saturation, fades, peak at -1.5 dBFS (loudness is set later with ffmpeg).
mix = mix[: int(TOTAL * SR)]
t = np.arange(len(mix)) / SR
fade = np.clip(t / 0.4, 0, 1) * np.clip((TOTAL - t) / 2.2, 0, 1)
mix *= fade[:, None]
mix = np.tanh(mix * 1.6) / 1.6
mix *= 10 ** (-1.5 / 20) / np.max(np.abs(mix))
pcm = (mix * 32767).astype("<i2")
with wave.open(f"{work}/score.wav", "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print(f"score.wav {TOTAL:.1f} s, bars {len(bars)}, pulse bars {beat_on}-{beat_off}, peak {np.max(np.abs(mix)):.2f}")
