# LAW5 landing page (beta)

Two editions of the same story:

- `index.html` is the **light edition** (white and purple). This is the source file.
- `dark.html` is the **dark edition** (black and purple). It is generated from `index.html` by `./make-dark.sh`. Edit `index.html`, then run the script.

Each edition links to the other from the masthead and the footer, and the link keeps the chapter you're reading.

## Run it

Any static server works:

```bash
npx serve .            # or: python3 -m http.server 4500
```

## The story

| Chapter | What happens |
|---|---|
| Title page | "The law, in plain words." A marked-up contract, stickers and the LAW5 reading-buddy react to your pointer |
| 1 The letter | The confusing clause, set the way it arrives |
| 2 Read it together | **The main moment.** As you scroll, the buddy walks down the clause, highlights each line by meaning (lime = your right, coral = deadline, sky = money, butter = something you must do), then rewrites it in plain words and ends on a one-line summary with its source. On desktop you can hover a line to translate it straight away |
| 3 How it works | Four steps, with a line that draws as you scroll |
| 4 What to ask | Topics that open to show example questions |
| 5 Straight talk | What LAW5 is and isn't: not a lawyer, cites sources, knows when to hand off, beta |
| Close | Beta sign-up form |

The fixed § button at the bottom is the chapter index (folio).

## Before launch

- **Sign-up form:** it isn't connected to anything yet. Put your endpoint URL in `data-endpoint` on the `<form class="signup">` and it will POST JSON (`email`, `ask`, `at`). Until then it says so on screen and keeps the entry in that browser only.
- The clause and the questions are samples written for this page. No statistics, prices or dates are on the page.

## Files

`law5.css` holds the page styles and both colour themes. `law5.js` runs the buddy, the clause lens, the folio and the form. `scrollcraft.js/.css` is the skill's unmodified engine, and `fonts/` contains Bricolage Grotesque and Geist (OFL), hosted locally.

## Fingerprint (scroll-craft registry row)

| Grammar | Nav | Hero | Act shape | Close | Signature move |
|---|---|---|---|---|---|
| Chaptered editorial | Fixed folio button + chapter index, static masthead | Layered typographic title page (contract, buddy, stickers) with pointer and scroll depth | flow > flow > pin(3.6) > flow(draw + reveal) > flow(index) > flow(kinetic, inverted) > flow, 7 acts, ~10.1vh | Colophon with an inline sign-up form and the buddy | The scroll walks a reading-buddy down a contract, colour-coding each line by meaning and rewriting it in plain words |
