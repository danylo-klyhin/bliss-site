# Bliss website

The website for Bliss, Vinos Naturales y Cócteles (Ruzafa, València): a home page and the menu, built for phones first, in Spanish and English.

## What is in this folder

| Path | What it is |
|---|---|
| `site/` | The website itself. Everything in here goes online as it is. |
| `tools/` | A script that refreshes the menu from the till (Loyverse). |
| `AGENTS.md` | Instructions for an AI agent or a developer who will edit the site. |
| `README.md` | This file. |

## See it

Open `site/index.html` in a browser by double-clicking it. No installation is needed. The fonts load from the internet, so be online.

## Change something

For small things you can ask an AI agent (Claude, ChatGPT, Cursor and similar). Give it this whole folder and say:

> Read AGENTS.md first, then: *what you want changed*.

`AGENTS.md` tells the agent how the site is built and which design decisions to keep, so the result still looks and works like the rest of the site.

Things that take one small edit and are described there step by step:

- make the "Reservar mesa" button call a phone number or open WhatsApp
- replace the photo at the top, or add more photos
- change the opening hours, the address or the Instagram link
- refresh the prices and the wine list from Loyverse

## Put it online

1. Upload the contents of `site/` to any web hosting (Netlify, Vercel, GitHub Pages, or your own).
2. Point everything that leads to the old menu at the new address:
   - the QR codes on the tables (link them to `carta.html`, the menu page)
   - the "Menu" link in your Google Maps profile
   - the link in your Instagram bio (Linktree)
3. Keep the old site (`bliss-menu.vercel.app`) online for now. The menu refresh reads the till through it. See "Refreshing the menu" in `AGENTS.md`.

## Not confirmed yet

These were filled in from public sources and need the bar's word:

- **Opening hours.** Taken from Google Maps: Tuesday to Thursday 18:00 to 24:00, Friday and Saturday 18:00 to 2:00.
- **Seven wines without a colour.** Loyverse has no colour for them, so they are listed under "Otros naturales": Cos a Cos Vinyeta, Cos a Cos Tortosi, Pigar ChaChaCha, Macameu, Libera, Sant Pere, Pura Vida Oropendola. Set the colour in Loyverse and refresh the menu, and they move to the right group.
- **Item names and English translations.** Some names were tidied (capital letters, accents) and the English text was written for this site. Worth one read-through.
- **Prices.** A copy from Loyverse taken on 15 November 2026. They change only when the menu is refreshed.
- **"Reservar mesa".** The button is visible but does nothing until a phone number or booking link is set.
