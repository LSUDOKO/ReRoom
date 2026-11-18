"""Build src/timing.json: scene windows from real voice-over lengths, with word timing for sync and captions."""
import difflib, json, re, wave
FPS = 30
# key, frames of silence before the line, frames after it
SCENES = [("01_intro", 14, 10), ("02_problem", 4, 10), ("03_cost", 16, 22), ("04_pain", 22, 18), ("05_analyze", 6, 8), ("06_redteam", 6, 8),
          ("07_incident", 6, 8), ("08_audience", 4, 4), ("09_actions", 4, 8), ("10_arch", 8, 12), ("11_proof", 6, 12), ("12_real", 6, 8), ("13_outro", 4, 48)]
LABEL = {"AI": "AI", "A": "A"}
SCRIPT = json.load(open("tools/script.json"))
# Spoken forms shown in their written form on screen.
WRITTEN = [("A I", "AI"), ("llama three point two", "llama3.2"), ("one hundred percent", "100%"), ("three point four", "3.4%"), ("fifty six point five percent.", "56.5%."), ("worst case", "worst-case")]
def norm(x): return re.sub(r"[^a-z0-9]", "", x.lower())
def align(text, heard, lead):
    """Script words with Whisper's timing. Whisper mishears some words, so the script supplies the text."""
    toks = text.split()
    h = [norm(x["word"]) for x in heard]
    times = [None] * len(toks)
    for a, b, n in difflib.SequenceMatcher(None, [norm(t) for t in toks], h, autojunk=False).get_matching_blocks():
        for i in range(n):
            times[a + i] = (heard[b + i]["start"], heard[b + i]["end"])
    end = heard[-1]["end"]
    for i, v in enumerate(times):
        if v is None:
            prev = times[i - 1][1] if i else 0
            nxt = next((x[0] for x in times[i + 1:] if x), end)
            run = next((j for j, x in enumerate(times[i:]) if x), len(toks) - i) or 1
            step = (nxt - prev) / run
            times[i] = (prev, prev + step)
    words = [{"w": t, "f": round(a * FPS) + lead, "e": round(b * FPS) + lead} for t, (a, b) in zip(toks, times)]
    for spoken, shown in WRITTEN:
        parts = spoken.split()
        i = 0
        while i <= len(words) - len(parts):
            if [x["w"].rstrip(",.:") for x in words[i:i + len(parts)]] == [q.rstrip(",.:") for q in parts]:
                tail = words[i + len(parts) - 1]["w"]
                punct = tail[len(tail.rstrip(",.:")):]
                words[i:i + len(parts)] = [{"w": shown.rstrip(".") + punct, "f": words[i]["f"], "e": words[i + len(parts) - 1]["e"]}]
            i += 1
    return words

out, cursor = [], 0
for key, lead, tail in SCENES:
    w = wave.open(f"public/audio/{key}.wav"); dur = w.getnframes() / w.getframerate()
    n = round(dur * FPS)
    heard = [x for seg in json.load(open(f"tools/words/{key}.json"))["segments"] for x in seg.get("words", [])]
    words = align(SCRIPT[key], heard, lead)
    total = lead + n + tail
    out.append({"key": key, "start": cursor, "dur": total, "lead": lead, "voice": n, "words": words})
    cursor += total
json.dump({"total": cursor, "scenes": out}, open("src/timing.json", "w"), indent=0)
print("total", round(cursor / FPS, 1), "s")
assert cursor / FPS < 120, "over the 2 minute limit"
