# Trials of Camelot

An unofficial fan quiz on the BBC series *Merlin* (2008–2012). Each game asks 15 multiple-choice questions drawn from a pool of 36, covering all five series plus a few behind-the-scenes questions, and ends with a Camelot rank.

Open `index.html` in any browser, phone included.

## Music and artwork

The theme tune and the show's graphics are BBC copyright, so they aren't used here. Instead:

- **Music** is an original tune written for this quiz: a slow air in D Dorian on a plucked, harp-like voice over a drone, generated live in the browser with the Web Audio API. It starts only when you press **Music**. Right and wrong answers get a short chime while it's on.
- **Artwork** is original: a candlelit stone background, parchment question cards with illuminated drop capitals, and a sword-in-the-stone crest drawn in SVG.

## Adding questions

Questions live in the `QUESTIONS` list in the script. Each has:

- `s`: series number 1–5, or 0 for behind-the-scenes
- `q`: the question
- `a`: the right answer
- `w`: three wrong answers
- `why`: a line shown after answering

Facts were checked against Wikipedia's articles on the show and its series.
