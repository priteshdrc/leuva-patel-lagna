# લેઉવા પટેલ લગ્ન માર્ગદર્શિકા · Leuva Patel Wedding Guide

A mobile-first website, in Gujarati first with English and Hindi, that guides Saurashtra Leuva Patel families through wedding rituals from ચાંદલો and ગોળ ધાણા to કંકુ પગલાં. Each ritual has:

- **વિધિ** – what the ritual means and how it is done, step by step
- **સામાન** – a tickable list of items with typical quantities
- **કામ** – a tickable to-do list

Other features: a bride side / groom side filter, a wedding-date countdown, an "everything pending" view, your own added items, a WhatsApp share button and a text-size setting. Ticks are saved in the phone's browser (localStorage).

## Rituals covered

ચાંદલો · ગોળ ધાણા · સગાઈ (રીંગ સેરેમની) · લગ્ન લખવા અને કંકોત્રી · ગણેશ સ્થાપના / માણેક સ્તંભ / મંડપ મુહૂર્ત · ગ્રહશાંતિ · પીઠી · મામેરું · રાસ-ગરબા / મહેંદી / ડાયરો · ફૂલેકું · જાન / સામૈયું / પોંખણું · લગ્ન વિધિ · વિદાય · કંકુ પગલાં · પગફેરો અને કથા

## Project layout

| Path | What it is |
|---|---|
| `src/shell.html` | Page markup and CSS |
| `src/app.js` | App logic: routing, checklists, storage, WhatsApp sharing |
| `src/data-0.js` … `data-3.js` | Ritual content in `[gujarati, english, hindi]` arrays (format in `src/FORMAT.md`) |
| `build.js` | Combines everything into single-file pages |
| `docs/index.html` | Built standalone site, ready for GitHub Pages |
| `artifact/page.html` | Built page body for the claude.ai artifact version |

## Build

```bash
node build.js
```

No dependencies are needed. The output is one self-contained HTML file; only Google Fonts load from the network.

## Host on GitHub Pages

Go to **Settings → Pages**, choose **Deploy from a branch**, select branch `main` and folder `/docs`, then save.

## Editing content

To change a ritual, edit the matching `src/data-*.js` file and run `node build.js`. Every text is an array of `[ગુજરાતી, English, हिन्दी]`. To mark an item or task as bride-side or groom-side only, add `"b"` or `"g"` as its 4th element. To group a list, put a heading object `{h: [gu, en, hi]}` before its entries (see `src/FORMAT.md`).

> Customs differ by village and family. The lists are suggestions; please confirm with your gor maharaj and family elders.
