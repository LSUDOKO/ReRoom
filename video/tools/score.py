"""Original, licence-free score for the ReRoom MR film: a warm pad that opens up, a plucked
arpeggio that enters with the product, and a lift at the outro. 44.1 kHz stereo."""
import sys, wave
import numpy as np
SR = 44100
DUR = float(sys.argv[1]) if len(sys.argv) > 1 else 180
N = int(DUR * SR); t = np.arange(N) / SR
rng = np.random.default_rng(3)
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
BPM = 92; beat = 60 / BPM; bar = 4 * beat
# i-VI-III-VII in D minor turning to D major at the reveal: Dm Bb F C | D Bm G A
MINOR = [[50, 53, 57, 62], [46, 50, 53, 58], [41, 48, 53, 57], [48, 52, 55, 60]]
MAJOR = [[50, 54, 57, 62], [47, 50, 54, 59], [43, 50, 55, 59], [45, 49, 52, 57]]
REVEAL, PRODUCT, IMPACT, OUTRO = 34, 50, 150, 168
def seg(a, b, fade=2.0):
    e = np.clip((t - a) / fade, 0, 1) * np.clip((b - t) / fade, 0, 1)
    return e
L = np.zeros(N); R = np.zeros(N)
# pad: detuned saws through a soft low-pass (cheap one-pole), chord per bar
for i in range(int(DUR / bar) + 1):
    a, b = i * bar, (i + 1) * bar
    chords = MINOR if a < REVEAL else MAJOR
    ch = chords[i % 4]
    s0, s1 = int(a * SR), min(N, int((b + 1.2) * SR))
    if s0 >= N: break
    tt = t[s0:s1] - a
    env = np.minimum(1, tt / 1.4) * np.exp(-np.maximum(0, tt - bar) * 3)
    for m in ch:
        for d, pan in ((-0.07, 0.3), (0.07, 0.7)):
            f = hz(m) * (1 + d / 100)
            w = 2 * ((tt * f) % 1) - 1
            L[s0:s1] += w * env * (1 - pan) * 0.045
            R[s0:s1] += w * env * pan * 0.045
def lowpass(x, a=0.06):
    y = np.zeros_like(x); acc = 0.0
    # vectorised one-pole via cumulative trick is unstable; chunked loop is fast enough at 44.1k
    out = np.empty_like(x)
    from scipy.signal import lfilter
    return lfilter([a], [1, a - 1], x)
try:
    L = lowpass(L); R = lowpass(R)
except Exception:
    pass
pad_env = 0.55 + 0.45 * seg(REVEAL, DUR + 5, 3)
L *= pad_env * 6; R *= pad_env * 6
# sub on the root, from the reveal
for i in range(int(DUR / bar) + 1):
    a = i * bar
    if a < REVEAL - bar or a >= DUR: continue
    ch = (MINOR if a < REVEAL else MAJOR)[i % 4]
    s0, s1 = int(a * SR), min(N, int((a + bar) * SR))
    tt = t[s0:s1] - a
    sub = np.sin(2 * np.pi * hz(ch[0] - 12) * tt) * np.minimum(1, tt / 0.05) * np.exp(-tt * 0.6) * 0.16
    L[s0:s1] += sub; R[s0:s1] += sub
# plucked arpeggio, 8ths, from the product section to the end
step = beat / 2
k = 0
while k * step < DUR:
    a = k * step
    if PRODUCT - 4 <= a < DUR - 2:
        i = int(a / bar)
        ch = MAJOR[i % 4]
        m = ch[[0, 2, 1, 3, 2, 1, 3, 2][k % 8]] + 12
        s0, s1 = int(a * SR), min(N, int((a + 1.2) * SR))
        tt = t[s0:s1] - a
        v = (0.5 + 0.5 * seg(PRODUCT, DUR, 8)[s0]) * (1.25 if a >= IMPACT else 1)
        w = (np.sin(2 * np.pi * hz(m) * tt) + 0.3 * np.sin(4 * np.pi * hz(m) * tt)) * np.exp(-tt * 5) * 0.09 * v
        pan = 0.35 + 0.3 * ((k * 5) % 7) / 6
        L[s0:s1] += w * (1 - pan); R[s0:s1] += w * pan
    k += 1
# soft kick + shaker from the product onward, fuller in impact
k = 0
while k * beat < DUR:
    a = k * beat
    if PRODUCT <= a < DUR - 4:
        s0, s1 = int(a * SR), min(N, int((a + 0.4) * SR))
        tt = t[s0:s1] - a
        kick = np.sin(2 * np.pi * (48 + 90 * np.exp(-tt * 30)) * tt) * np.exp(-tt * 9) * (0.22 if a >= IMPACT else 0.14)
        L[s0:s1] += kick; R[s0:s1] += kick
        h0 = int((a + beat / 2) * SR); h1 = min(N, h0 + int(0.06 * SR))
        if h0 < N:
            hh = rng.normal(0, 1, h1 - h0) * np.exp(-np.arange(h1 - h0) / SR * 60) * 0.025
            L[h0:h1] += hh * 0.8; R[h0:h1] += hh
    k += 1
master = np.clip(t / 2.5, 0, 1) * np.clip((DUR - t) / 4, 0, 1)
L *= master; R *= master
peak = max(np.abs(L).max(), np.abs(R).max()); L /= peak / 0.8; R /= peak / 0.8
st = np.stack([L, R], 1)
w = wave.open("public/audio/music.wav", "wb"); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((st * 32767).astype(np.int16).tobytes()); w.close()
print("music", DUR)
