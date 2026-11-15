# Instructions for agents working on the Bliss site

Static site, no framework and no build step. Edit the files in `site/` directly and open `site/index.html` to see the result. The audience is a guest in the bar holding a phone: check every change at phone width first.

## Read this before editing

1. **Visible text is not in the HTML.** On load, `site/app.js` replaces the text of every element that has a `data-i18n` attribute with a string from the table `T` at the top of that file. Changing words in the HTML does nothing. Change them in `T`, in both `es` and `en`.
2. **`site/menu-data.js` is generated.** Do not edit it by hand: `tools/update-menu.py` overwrites it. Name fixes and English translations live in that script (`NAMES`, `DESCS`).
3. **The menu refresh depends on the old site.** `tools/update-menu.py --fetch` reads `https://bliss-menu.vercel.app/api`, which relays the bar's Loyverse till. If the old site is switched off, the refresh stops working and the menu stays at the last snapshot until someone connects Loyverse directly.
4. **Design decisions that were made on purpose. Do not undo them unless the owner asks:**
   - A wine row is the name and the price. No bottle photos, no "funk" or acidity scales, no body or pairing notes.
   - Wines are grouped by colour under headings. No filter buttons.
   - No open/closed status line on the home page.
   - The menu has two sticky navigation rows: sections on top, subsections of the current section below.
   - The wordmark "BLISS." sits on black. The photo is above it and fades to black; text is never placed over the bright part of the photo.
   - `app.js` and `base.css` still contain unused code for the rejected features (`filters`, `wineItem`, `scale`, `status`). Leave it off.

## Files

| File | Role |
|---|---|
| `site/index.html` | Home: photo, wordmark, two buttons, opening hours, address, Instagram. |
| `site/carta.html` | Menu. Almost empty: `app.js` renders it from `menu-data.js`. |
| `site/style.css` | The whole look. Tokens are at the top. |
| `site/base.css` | Reset and structural rules for rows. Rarely needs changes. |
| `site/app.js` | Links and texts (top of the file), language switch, menu rendering, scroll tracking, map chooser. |
| `site/menu-data.js` | Generated menu: 4 groups, their subsections, 93 items. Prices are in cents. |
| `site/photos/` | `hero.jpg` and any extra photos. |
| `tools/update-menu.py` | Builds `menu-data.js` from `tools/menu-snapshot.json`. |

## Design system

**Colour.** Four values, defined as variables in `style.css`:

| Variable | Value | Use |
|---|---|---|
| `--bg` | `#000` | Page |
| `--fg` | `#fff` | Text, primary button |
| `--mute` | `#9a9a93` | Secondary text, inactive navigation |
| `--line` | `#242424` | Hairlines between rows |

No other colours, no gradients except the photo fade, no shadows, square corners everywhere.

**Type.** Oswald (500, 700) for display, Instrument Sans (400, 500, 600) for text, both from Google Fonts.

| Role | Style |
|---|---|
| Wordmark `.wordmark` | Oswald 700, `clamp(96px, 34.5vw, 232px)`, line-height .84 |
| Group title `.group-title` | Oswald 700, uppercase, `clamp(56px, 20vw, 128px)` |
| Section title `.sub-title` | Oswald 500, uppercase, 22px |
| Row `.item-name`, `.item-price` | Instrument Sans 17px (16px at 340px and narrower), name weight 500 |
| Row note `.item-desc` | 14.5px, `--mute` |
| Navigation `.groups a` | Oswald 500, uppercase, 16px |
| Sub-navigation `.subnav a` | Instrument Sans 15px |

**Layout.** 20px side padding (`--pad`), 40px from 900px up. Content sits in a 680px column (`--col`).

**The row** is the one building block of both pages. Menu items, opening hours and the address all use it:

```html
<ul class="items">
  <li class="item">
    <span class="item-row">
      <span class="item-name">Left text</span><span class="item-lead"></span><span class="item-price">Right text</span>
    </span>
    <span class="item-desc">Optional second line</span>
  </li>
</ul>
```

Wrap the contents in `<a class="item-link" href="…">` to make the whole row a link; the right-hand text is then underlined.

**Buttons.** `.btn` is 52px high with a 1px white border; `.btn-primary` is filled white. One primary button per screen.

## How to

### Make "Reservar mesa" work

One line at the top of `site/app.js`:

```js
var RESERVE_LINK = '';
```

Set it to `'tel:+34600000000'` for a phone call, `'https://wa.me/34600000000'` for WhatsApp, or the address of a booking page. The button appears on the home page and in the menu header; both follow this setting. While it is empty, the button is shown and does nothing. Do not use the SumUp booking page listed in the bar's Google Maps profile: it is an unfinished template.

### Replace the photo at the top

Replace `site/photos/hero.jpg`. Use a portrait image around 1080 × 1440 px, under 400 KB. The visible crop is set by `object-position` on `.hero-photo img` in `style.css`. If the file is missing, the page falls back to a type-only layout by itself.

### Add a strip of photos under the buttons

Put the files in `site/photos/` and add one line per photo inside `<section class="photos">` in `site/index.html`:

```html
<figure><img src="photos/1.jpg" alt="" loading="lazy" onerror="this.parentNode.remove()"></figure>
```

Portrait 4:5 works best. The strip scrolls sideways and stays hidden while it has no photos.

### Change the opening hours

In `site/app.js`, table `T`: `h_days_1` to `h_days_3` and `h_time_1` to `h_time_3`, in both `es` and `en`. To add or remove a line, also add or remove its `<li class="item">` in `site/index.html`.

### Change the address, Instagram or map links

In `site/app.js`:

- texts: `addr` and `address_2` (home page), `address_1` (menu footer), in both languages
- `INSTAGRAM`: the profile address; the visible handle is plain text in `index.html` and `carta.html`
- `DIRECTIONS`: the two links behind "Cómo llegar". On iPhone the guest picks Apple Maps or Google Maps in a small sheet, because a web page cannot see which apps are installed. Everywhere else the row opens Google Maps directly.

### Add another link to the home page

Copy the Instagram row in `site/index.html` (a row wrapped in `item-link`) and change its text and `href`.

### Refresh the menu

```
python3 tools/update-menu.py --fetch
```

Without `--fetch` it rebuilds from the saved snapshot. In the script:

- `STRUCTURE` maps the till's categories to the 4 groups and their subsections
- `NAMES` holds display names: till name → (Spanish, English)
- `DESCS` holds descriptions: till name → (Spanish or `None` to keep the till's text, English)

A wine's colour comes from the till's `wineType` field, or from the words Blanco, Tinto, Orange or Rosado in its name. Wines with neither are listed under "Otros naturales".

## Check after every change

- Widths 320, 360, 390 and 430 px: no sideways scroll, nothing cut off, the address row stays on one line.
- Both languages: press the EN button, or add `?lang=en` to the address.
- Tap targets at least 40px high.
- In the menu, scroll from top to bottom and tap a few sub-navigation links: the highlighted item must match the section on screen, including the first and the last.
- Safari on iPhone is the main browser to test in.

## Before going live

- Set `RESERVE_LINK` or remove the button.
- Confirm the open items listed in `README.md`.
- Update the QR codes, the Google Maps "Menu" link and the Linktree to the new address.
