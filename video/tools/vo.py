"""Generate each voice-over line with Kokoro. usage: vo.py <voice> [only_key]"""
import json, os, sys
import soundfile as sf
from kokoro_onnx import Kokoro
H = os.path.expanduser("~/.cache/instep-tts/")
k = Kokoro(H + "kokoro-v1.0.onnx", H + "voices-v1.0.bin")
LINES = json.load(open("tools/script.json"))
voice = sys.argv[1] if len(sys.argv) > 1 else "am_michael"
only = sys.argv[2] if len(sys.argv) > 2 else None
os.makedirs("public/audio", exist_ok=True)
out = {}
for key, text in LINES.items():
    if only and key != only:
        continue
    wav, sr = k.create(text, voice=voice, speed=1.0, lang="en-us")
    sf.write(f"public/audio/{key}.wav", wav, sr)
    print(key, round(len(wav) / sr, 2), flush=True)
