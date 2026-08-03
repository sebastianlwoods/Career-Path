# Played For

**Guess the footballer from the clubs they played for.**

Played For is a five-round football knowledge game. A player's senior clubs are revealed chronologically. Guess early for more points, reveal another club to make it easier, but a wrong recognised player scores zero for the round.

## MVP rules

- Five random players per game.
- Senior competitive clubs only.
- Loan spells are included and marked `(loan)`.
- Return spells appear again in the chronology.
- One real guess per player.
- Wrong recognised player = 0 points and the round ends.
- Invalid/unrecognised spelling does **not** use the guess.
- Searchable autocomplete supports stored aliases and accent-insensitive matching.
- Scoring adapts to career length: the first club is always worth 1,000, every additional reveal lowers the score, and revealing the complete career leaves 0 points available.

## Run locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Validation

```bash
npm test
npm run lint
npm run build
```

## Scoring

The score is based on the proportion of the career still hidden after the first club. This avoids a flat `6+` floor for journeymen: every extra club always costs points. A five-stop career scores `1000 → 750 → 500 → 250 → 0`; a thirteen-stop career declines in smaller steps but still reaches `0` if every club is revealed.

## Next up

- Curate difficulty and expand the player bank.
- Add a deterministic Daily Five.
- Add shareable result grid.
- Add recent-player avoidance in Practice.
- Add sourced career data and content validation.
