#!/usr/bin/env python3
"""macOS dialog for Verse Daily. Uses only Python's standard library."""
import json, subprocess, urllib.parse, urllib.request, webbrowser
from datetime import date
from pathlib import Path

DATA_URL = "https://raw.githubusercontent.com/ananthvelraj/verse-daily/main/data/words.json"
SITE_URL = "https://ananthvelraj.github.io/verse-daily/"
CACHE = Path.home() / "Library/Caches/VerseDaily/words.json"

def fetch_words():
    try:
        with urllib.request.urlopen(DATA_URL, timeout=8) as response:
            data = response.read()
        CACHE.parent.mkdir(parents=True, exist_ok=True)
        CACHE.write_bytes(data)
    except Exception:
        if not CACHE.exists(): raise
        data = CACHE.read_bytes()
    return json.loads(data)["words"]

def choose(words):
    today = date.today().isoformat()
    exact = next((w for w in words if w["date"] == today), None)
    return exact or words[(date.today() - date.fromisoformat(words[0]["date"])).days % len(words)]

def dialog(item):
    message = f'{item["word"]}  ·  {item["pronunciation"]}\n\n{item["meaning"]}\n\n“{item["poeticSentence"]}”\n\nAt work: {item["professionalSentence"]}\n\nWith someone dear: {item["romanticSentence"]}'
    script = 'display dialog ' + json.dumps(message) + ' with title "Verse Daily" buttons {"Study online", "Open today’s page", "Done"} default button "Done" with icon note'
    result = subprocess.run(["osascript", "-e", script], capture_output=True, text=True).stdout
    if "Open today’s page" in result: webbrowser.open(SITE_URL)
    elif "Study online" in result: webbrowser.open("https://www.google.com/search?q=" + urllib.parse.quote(item["word"] + " meaning examples"))

if __name__ == "__main__":
    try: dialog(choose(fetch_words()))
    except Exception as exc:
        subprocess.run(["osascript", "-e", 'display alert "Verse Daily could not load" message ' + json.dumps(str(exc))])
