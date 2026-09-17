# Verse Daily

A daily vocabulary ritual for poetic writing, clear professional conversation, and romantic expression.

## How it works

- `data/words.json` is the single source of truth. Every entry is tied to a date.
- The website selects today’s entry, supports earlier/later days, reads the word aloud, and saves your own line locally.
- `mac/word_of_the_day.py` fetches the same JSON from GitHub, caches it for offline use, and shows a native macOS dialog.
- GitHub Actions publishes the site to GitHub Pages after every push to `main`.

## Add more words

Copy one object in `data/words.json`, use the next date, and fill all fields. Keep dates in `YYYY-MM-DD` format. After the last dated entry, the app cycles through the collection so it never presents an empty day.

## Publish

The live site is published from the `main` branch by GitHub Actions. Changes pushed to the repository automatically become the next live version.

## Local preview

Run `python3 -m http.server 8000` in this folder and visit `http://localhost:8000`.
