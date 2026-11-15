#!/usr/bin/env python3
"""Builds site/menu-data.js from the Loyverse menu JSON.

Usage:
  python3 tools/update-menu.py                 # uses tools/menu-snapshot.json
  python3 tools/update-menu.py --fetch         # refreshes the snapshot from the old site's API first

The old site (bliss-menu.vercel.app/api) proxies the bar's Loyverse POS. This script
regroups its 10 flat categories into the 4 groups of the new carta and adds English text.
"""
import json
import re
import sys
import unicodedata
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SNAPSHOT = ROOT / "tools" / "menu-snapshot.json"
OUT = ROOT / "site" / "menu-data.js"
API = "https://bliss-menu.vercel.app/api"

# New structure: group -> subsections -> source categories (names as they come from the POS).
STRUCTURE = [
    {"id": "vino", "name": "Vino", "name_en": "Wine", "short": "Vino", "short_en": "Wine", "subs": [
        {"id": "copa", "name": "Por copa", "name_en": "By the glass", "from": ["Copa de vino"], "sort": "desc"},
        {"id": "naturales", "name": "Naturales, por botella", "name_en": "Natural, by the bottle",
         "from": ["Vino Natural"], "sort": "asc", "wine": True},
        {"id": "organicos", "name": "Orgánicos, por botella", "name_en": "Organic, by the bottle",
         "short": "Orgánicos", "short_en": "Organic", "from": ["Vino Orgánico"], "sort": "asc"},
    ]},
    {"id": "cocteles", "name": "Cócteles", "name_en": "Cocktails", "short": "Cócteles", "short_en": "Cocktails", "subs": [
        {"id": "autor", "name": "De autor", "name_en": "House cocktails", "from": ["De autor"], "sort": None},
        {"id": "clasicos", "name": "Clásicos", "name_en": "Classics", "from": ["Cocktails", "Cocktail Frozen"], "sort": "desc"},
        {"id": "sin", "name": "Sin alcohol", "name_en": "Alcohol-free", "from": ["Mocktails"], "sort": None},
    ]},
    {"id": "picoteo", "name": "Picoteo", "name_en": "Snacks", "short": "Picoteo", "short_en": "Snacks", "subs": [
        {"id": "tapas", "name": "", "name_en": "", "from": ["Tapas"], "sort": "asc", "last": ["Extra Pan"]},
    ]},
    {"id": "cafe", "name": "Café y bebidas", "name_en": "Coffee and drinks", "short": "Café", "short_en": "Coffee", "subs": [
        {"id": "bebidas", "name": "Bebidas", "name_en": "Drinks", "from": ["Bebidas"], "sort": "asc"},
        {"id": "cafeteria", "name": "Café", "name_en": "Coffee", "from": ["Cafeteria"], "sort": "asc"},
    ]},
]

# Display names. Left side is the POS name; the POS stays the source of truth for prices.
NAMES = {
    "Copa Vino natural": ("Vino natural", "Natural wine"),
    "Copa Cava": ("Cava", "Cava"),
    "Copa vino VA": ("Vino V.A", "V.A wine"),
    "Copa Vino de la Casa": ("Vino de la casa", "House wine"),
    "Cocktail Frozen": ("Frozen", "Frozen"),
    "GinTonic/ Gin Sabores": ("Gin tonic", "Gin and tonic"),
    "Cuba Libre / Vodka Limon": ("Cuba libre / Vodka limón", "Cuba libre / Vodka lemon"),
    "Sangria/Tinto de Verano": ("Sangría / Tinto de verano", "Sangria / Tinto de verano"),
    "Piña colada sin Alcohol": ("Piña colada sin alcohol", "Virgin piña colada"),
    "Mojito sin Alcohol": ("Mojito sin alcohol", "Virgin mojito"),
    "Basilic spritz": ("Basilic Spritz", "Basilic Spritz"),
    "Cheese sticks": ("Cheese sticks", "Cheese sticks"),
    "Extra Pan": ("Pan extra", "Extra bread"),
    "Patatas Fritas": ("Patatas fritas", "Fries"),
    "Olivas": ("Olivas", "Olives"),
    "Bruschetta Tomate": ("Bruschetta de tomate", "Tomato bruschetta"),
    "Croquetas": ("Croquetas", "Croquettes"),
    "Bruschetta Mixta": ("Bruschetta mixta", "Mixed bruschetta"),
    "Pincho de Tortilla": ("Pincho de tortilla", "Spanish omelette"),
    "Provolone Fundido": ("Provolone fundido", "Melted provolone"),
    "Tabla de quesos": ("Tabla de quesos", "Cheese board"),
    "Tabla de quesos y Jamon": ("Tabla de quesos y jamón", "Cheese and ham board"),
    "Refresco": ("Refresco", "Soft drink"),
    "Agua sin gas": ("Agua sin gas", "Still water"),
    "Agua con gas": ("Agua con gas", "Sparkling water"),
    "Limonada": ("Limonada", "Lemonade"),
    "Vermut": ("Vermut", "Vermouth"),
    "Cerveza": ("Cerveza", "Beer"),
    "Infusiones": ("Infusiones", "Herbal tea"),
    "Cafe Americano": ("Café americano", "Americano"),
    "Cafe Bombón": ("Café bombón", "Café bombón"),
    "Cafe Carajillo": ("Carajillo", "Carajillo"),
    "Cafe con Leche": ("Café con leche", "Café con leche"),
    "Capuccino": ("Capuchino", "Cappuccino"),
}

# Descriptions: (es override or None to keep the POS text, en).
DESCS = {
    "Dessert Bliss": ("Vodka infusionado en vainilla, lima, sirope de vainilla", "Vanilla-infused vodka, lime, vanilla syrup"),
    "Raspberry Bliss": ("Gin macerado en frambuesas, tónica, frutos rojos, sirope de frambuesa",
                        "Raspberry-infused gin, tonic, red berries, raspberry syrup"),
    "Margarita Bliss": ("Aperol, tequila, lima, sirope", "Aperol, tequila, lime, syrup"),
    "Summer Bliss": ("Limoncello, pomelo, Campari, soda", "Limoncello, grapefruit, Campari, soda"),
    "Basilic spritz": ("Albahaca, cava, flor de saúco", "Basil, cava, elderflower"),
    "Spicy Gin Tonic": (None, "Chilli-infused gin"),
    "Espresso Bliss": (None, "Vodka, Baileys, espresso, hazelnut syrup"),
    "Bliss Spicy": ("Vodka, sirope de maracuyá, zumo de limón, zumo de naranja",
                    "Vodka, passion fruit syrup, lemon juice, orange juice"),
    "Sweet Bliss": ("Nata, limoncello, piña, sirope de avellana, lima",
                    "Cream, limoncello, pineapple, hazelnut syrup, lime"),
    "Espresso Martini": (None, "Vodka, coffee liqueur, espresso, sugar syrup"),
    "Sex on the Beach": ("Vodka, licor de melocotón, zumo de naranja, sirope de mora",
                         "Vodka, peach liqueur, orange juice, blackberry syrup"),
    "Margarita": (None, "Tequila, triple sec, fresh lime juice, sugar syrup"),
    "Caipiroska": ("Vodka, zumo de lima, azúcar", "Vodka, lime juice, sugar"),
    "Americano": ("Campari, vermut rojo, soda, naranja", "Campari, red vermouth, soda, orange"),
    "Tequila Sunrise": ("Tequila, zumo de naranja, granadina", "Tequila, orange juice, grenadine"),
    "White Russian": (None, "Vodka, coffee liqueur, cream"),
    "Clover Club": ("Gin, frambuesa, limón, clara de huevo", "Gin, raspberry, lemon, egg white"),
    "Negroni": ("Gin, Campari, vermut, twist de naranja", "Gin, Campari, vermouth, orange twist"),
    "Moscow Mule": ("Vodka, ginger beer, zumo de lima fresca, menta", "Vodka, ginger beer, fresh lime juice, mint"),
    "Cosmopolitan": (None, "Vodka, triple sec, cranberry juice, fresh lime juice"),
    "Whiskey Sour": ("Bourbon, zumo de limón fresco, sirope de azúcar, clara de huevo, angostura",
                     "Bourbon, fresh lemon juice, sugar syrup, egg white, Angostura"),
    "Mojito": ("Ron, lima fresca, azúcar mascabado, menta, soda", "Rum, fresh lime, muscovado sugar, mint, soda"),
    "Agua de Valencia": ("Cava, zumo de naranja fresco, vodka, gin", "Cava, fresh orange juice, vodka, gin"),
    "GinTonic/ Gin Sabores": ("Gin café: 9 €", "Coffee gin: 9 €"),
    "Cuba Libre / Vodka Limon": ("", ""),
    "Hibiscus Bliss": ("Infusión de hibisco, rosas y violetas", "Hibiscus, rose and violet infusion"),
    "Cerveza": ("Alhambra, Águila o 0,0 %", "Alhambra, Águila or 0.0%"),
}

PAIRING_EN = {"Duo de Hummus": "Hummus duo", "Gildas": "Gildas"}


def tidy(text):
    text = re.sub(r"\s+", " ", (text or "").strip())
    text = text.replace(" ,", ",")
    return text.rstrip(".")


def infer_type(name):
    n = name.lower()
    if "orange" in n:
        return "orange"
    if "tinto" in n:
        return "tinto"
    if "blanco" in n:
        return "blanco"
    if "rose" in n or "rosado" in n:
        return "rosado"
    return None


def funk_level(value):
    # Same 1-4 scale the old site showed, from the 0-100 value stored in the POS.
    return max(1, min(4, int(value) // 25 + 1))


def body_key(intensity):
    if intensity <= 30:
        return "ligero"
    if intensity <= 65:
        return "medio"
    return "cuerpo"


def item(prod, wine=False):
    src = unicodedata.normalize("NFC", prod["name"].strip())  # the POS sends some accents decomposed
    es, en = NAMES.get(src, (src, None))
    out = {"name": es, "price": prod["price"]}
    if en and en != es:
        out["name_en"] = en
    desc_es, desc_en = DESCS.get(src, (None, None))
    desc = tidy(prod.get("description")) if desc_es is None else desc_es
    if desc:
        out["desc"] = desc
        if desc_en:
            out["desc_en"] = desc_en
    if wine:
        wtype = prod.get("wineType") or infer_type(src)
        if wtype:
            out["type"] = wtype
        img = (prod.get("image") or {}).get("small")
        if img:
            out["img"] = img
        if prod.get("funkiness") is not None:
            out["funk"] = funk_level(prod["funkiness"])
        if prod.get("acidity") is not None:
            out["acid"] = int(prod["acidity"])
        if prod.get("intensity") is not None:
            out["body"] = body_key(prod["intensity"])
        pairing = prod.get("pairingSuggestion")
        if pairing:
            out["pair"] = pairing
            if PAIRING_EN.get(pairing, pairing) != pairing:
                out["pair_en"] = PAIRING_EN[pairing]
    return out


def main():
    if "--fetch" in sys.argv:
        with urllib.request.urlopen(API, timeout=30) as res:
            SNAPSHOT.write_bytes(res.read())
    data = json.loads(SNAPSHOT.read_text(encoding="utf-8"))
    cats = {c["name"]: c["products"] for c in data["categories"]}
    used = set()
    groups = []
    for group in STRUCTURE:
        subs = []
        for sub in group["subs"]:
            prods = []
            for cat in sub["from"]:
                used.add(cat)
                prods.extend(cats.get(cat, []))
            if sub.get("sort"):
                prods.sort(key=lambda p: (p["price"], p["name"].lower()), reverse=sub["sort"] == "desc")
            last = sub.get("last", [])
            prods = [p for p in prods if p["name"] not in last] + [p for p in prods if p["name"] in last]
            entry = {"id": group["id"] + "-" + sub["id"], "name": sub["name"], "name_en": sub["name_en"],
                     "items": [item(p, sub.get("wine", False)) for p in prods]}
            if sub.get("wine"):
                entry["wine"] = True
            if sub.get("short"):
                entry["short"], entry["short_en"] = sub["short"], sub["short_en"]
            if entry["items"]:
                subs.append(entry)
        head = {k: group[k] for k in ("id", "name", "name_en", "short", "short_en")}
        groups.append({**head, "subs": subs})
    missing = sorted(set(cats) - used)
    if missing:
        print("WARNING: categories in the POS that are not placed anywhere:", ", ".join(missing))
    total = sum(len(s["items"]) for g in groups for s in g["subs"])
    payload = json.dumps({"groups": groups}, ensure_ascii=False, indent=1)
    OUT.write_text("/* Generated by tools/update-menu.py. Do not edit by hand. */\nwindow.BLISS_MENU = "
                   + payload + ";\n", encoding="utf-8")
    print(f"Wrote {OUT.relative_to(ROOT)}: {len(groups)} groups, {total} items")


if __name__ == "__main__":
    main()
