"""Synthesise the score and sound effects so every sound is original and licence-free."""
import json, wave
import numpy as np
SR = 44100
T = json.load(open("src/timing.json"))
frames = T["total"]
N = int(frames / 30 * SR)
t = np.arange(N) / SR
def save(name, x, stereo=None):
    x = np.clip(x, -1, 1)
    w = wave.open(f"public/audio/{name}.wav", "wb"); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((x * 32767).astype(np.int16).tobytes()); w.close()
def note(hz): return 440 * 2 ** ((hz - 69) / 12)
def env_at(sc_keys, a=2.0):
    """1 inside the named scenes, with smooth edges."""
    # Build at 100 Hz: smoothing a full-rate envelope would take minutes.
    r = 100; M = int(N / SR * r) + 2
    e = np.zeros(M)
    for s in T["scenes"]:
        if s["key"] in sc_keys:
            e[int(s["start"] / 30 * r):int((s["start"] + s["dur"]) / 30 * r)] = 1
    k = int(a * r); ker = np.hanning(k) / np.hanning(k).sum()
    e = np.convolve(e, ker, mode="same")
    return np.interp(t, np.arange(M) / r, e)
rng = np.random.default_rng(7)
TENSE = ["01_intro", "02_problem", "03_cost"]
LIFT = ["04_pain", "05_analyze", "06_redteam", "07_incident", "08_audience", "09_actions", "10_arch", "11_proof", "12_real"]
OUTRO = ["13_outro"]
BPM = 96; beat = 60 / BPM
# Tense: low D drone with a slow minor second beating against it.
drone = (np.sin(2*np.pi*note(38)*t) + .5*np.sin(2*np.pi*note(50)*t) + .3*np.sin(2*np.pi*note(51)*t + np.sin(t*.7))) / 1.8
music = drone * env_at(TENSE) * .34
# Lift: D major-side pad over four bars each.
chords = [[50,57,62,66],[47,54,62,66],[43,55,62,67],[45,57,61,64]]
bar = 4 * beat
pad = np.zeros(N)
for i in range(int(t[-1] / bar) + 1):
    a, b = int(i*bar*SR), min(N, int((i+1)*bar*SR))
    seg = t[a:b] - t[a]
    e = np.minimum(1, seg/.5) * np.minimum(1, (seg[-1]-seg)/.6 + .05)
    for m in chords[i % 4]:
        hz = note(m + 12)
        for h, g in ((1, 1), (2, .28), (3, .1)):
            pad[a:b] += g * np.sin(2*np.pi*hz*h*seg) * e
pad /= 5
music += pad * (env_at(LIFT) + env_at(OUTRO)) * .24
# Pulse: a soft eighth-note bass and tick that drive the product section.
pulse = np.zeros(N); tick = np.zeros(N)
for i in range(int(t[-1] / (beat/2))):
    a = int(i*beat/2*SR); L = int(.22*SR)
    if a + L >= N: break
    s = np.arange(L)/SR
    root = chords[int(i/8) % 4][0]
    pulse[a:a+L] += np.sin(2*np.pi*note(root)*s) * np.exp(-s*14) * (1 if i % 2 == 0 else .55)
    L2 = int(.05*SR); tick[a:a+L2] += rng.standard_normal(L2) * np.exp(-np.arange(L2)/SR*110) * (.5 if i % 2 else .22)
drive = env_at(["05_analyze","06_redteam","07_incident","08_audience","09_actions","10_arch"])
music += (pulse * .3 + tick * .1) * drive
# End on a resolved D chord.
o = env_at(OUTRO)
for m in (38, 50, 57, 62, 66): music += .08 * np.sin(2*np.pi*note(m)*t) * o
fade = np.minimum(1, t/1.5) * np.minimum(1, (t[-1]-t)/1.6)
music *= fade
save("music", music * .85)
def seg(sec): return np.arange(int(sec*SR))/SR
s = seg(.07); save("sfx_click", (rng.standard_normal(len(s))*.5 + np.sin(2*np.pi*1900*s)*.6) * np.exp(-s*95))
s = seg(.6); n = rng.standard_normal(len(s)); n = np.convolve(n, np.ones(30)/30, mode="same"); save("sfx_whoosh", n * np.sin(np.pi*s/.6)**2 * 2.4)
s = seg(1.0); save("sfx_impact", (np.sin(2*np.pi*(46+60*np.exp(-s*16))*s)*np.exp(-s*4.2) + rng.standard_normal(len(s))*np.exp(-s*30)*.28) * .9)
s = seg(.9); save("sfx_lift", sum(np.sin(2*np.pi*note(m)*s)*np.exp(-s*3.5) for m in (62,69,74,78)) / 3)
print("audio ok", round(N/SR,1))
