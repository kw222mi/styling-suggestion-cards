# Styling Suggestion Cards

Ett litet React-projekt som visar slumpade outfitförslag i kortform. Byggt för att snabbt bli en snygg **quick win** i din portfolio.

## Funktioner
- 🎲 Visa 3 slumpade outfits med en knapp
- ♡ Spara/ta bort favoriter (localStorage)
- 🖼️ Inbyggda SVG-bilder (inga externa tillgångar behövs)
- 💅 Enkel, ren UI som ser bra ut på mobil

## Kom igång (Vite)
```bash
npm create vite@latest styling-suggestion-cards -- --template react
# ersätt genererade filer med innehållet i denna mapp
npm install
npm run dev
```

> Alternativt: Lägg `src/`-mappen i ett befintligt React-projekt.

## Struktur
```
src/
  components/
    Header.jsx
    StyleCard.jsx
  data/
    outfits.json
  assets/
    *.svg
  App.jsx
  main.jsx
  styles.css
index.html
```

## Att visa upp i portfolio
- Skärmdumpar: startsidan, “Ny stil”, samt favoritsekt.
- README: kort beskrivning, teknikval, vad du lärt dig.
- Demo-länk: Vercel/Netlify eller GitHub Pages.
