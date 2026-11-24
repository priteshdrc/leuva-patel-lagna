# Ritual data format (for src/data-*.js)

Each file contains only `RITUALS.push({...});` calls (plain JS, no imports, no comments needed).
Every text is a 3-element array: `[gujarati, english, hindi]`.
Hindi text: write Gujarati ritual names transliterated in Devanagari (e.g. "गोळ धाणा", "मामेरुं", "कंकु पगलां").
Gujarati text: use Gujarati numerals (૧ ૨ ૩), simple everyday Saurashtra Gujarati that grandparents understand. Short sentences.
English: plain, simple English for an NRI / young family member. Keep Gujarati terms in italics-free plain text, e.g. "Mameru (gifts from the maternal uncle)".

```js
RITUALS.push({
  id: "goldhana",                 // ascii lowercase, unique
  icon: "pot",                    // one of: ring, coconut, pot, letter, ganesh, haldi, gift, lamp, dhol, horse, mandap, fire, palki, feet, kalash
  host: "both",                   // "b" = held at bride's home, "g" = groom's home, "both"
  when: ["લગ્નના ૩–૬ મહિના પહેલાં", "3–6 months before the wedding", "शादी से 3–6 महीने पहले"],
  name: ["ગોળ ધાણા", "Gol Dhana", "गोळ धाणा"],
  short: [gu, en, hi],            // one line, max ~60 chars: what it is
  about: [gu, en, hi],            // 2–3 short sentences: meaning + what happens
  steps: [ [gu,en,hi], ... ],     // 5–8 steps in real order, each one sentence
  items: [ [gu,en,hi], [gu,en,hi,"b"], ... ],   // 8–15 things to buy/arrange; optional 4th element "b" (bride side only) or "g" (groom side only)
  todos: [ [gu,en,hi], [gu,en,hi,"g"], ... ],   // 6–10 practical tasks (booking, calling, inviting, confirming), same optional side tag
  tip: [gu, en, hi]               // one practical tip from elders; may mention Leuva Patel / Saurashtra custom
});
```

Item names should be concrete and countable where possible: "શ્રીફળ (નાળિયેર) – ૫", "કંકુ, ચોખા, નાડાછડી", "પેંડા / મીઠાઈ – ૫ કિલો". Write quantities as typical suggestions.

Community context: Saurashtra (Rajkot, Amreli, Junagadh, Bhavnagar, Jamnagar, Surat-settled) Leuva Patel families. Many revere Khodiyar Maa (Khodaldham, Kagvad) and their own kuldevi and surapura dada; say "your kuldevi" generically and mention Khodiyar Maa only as a common example. Samaj encourages simple weddings and no dahej (dowry). Customs vary by village and family — don't claim one rule is universal; phrase as "usually", "in many families".

## Group headings inside items / todos

A list may contain heading objects between entries: `{h: [gu, en, hi]}`.
Use them to group items by type (e.g. "Puja items", "Gifts", "Hosting") and to-dos by timing
("1–2 weeks before", "The day before", "After the ritual"). Headings with no visible entries
(after the bride/groom side filter) are hidden automatically.

Ticks are stored by a hash of the English text, so editing an entry's English text resets its tick.
