# Name That Nineties Blue

A three-choice quiz on 1990s Portsmouth FC players: 31 real ones, plus one made-up joke entry, David Chillcruft. Each round shows up to three clues about a player, starting with the most obscure. Guess with one clue for 3 points, two for 2, or all three for 1. Each game picks 12 players at random, and the two wrong answers are players in the same position who were at the club around the same time.

It's a single self-contained web page. Open `index.html` in any browser, phone included. There's no build step or install.

## Adding players

Players live in the `PLAYERS` list near the top of the script in `index.html`. Each entry has:

- `name`
- `pos`: `GK`, `DF`, `MF` or `FW`
- `years`: first and last year at Pompey, e.g. `[1993, 1999]`
- `clues`: three clues, from most obscure to most obvious

`pos` and `years` are used to choose believable wrong answers.

Clue facts for the real players were checked against each player's Wikipedia article. David Chillcruft is fictional and is marked as such in the code.
