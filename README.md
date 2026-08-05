# Played For

**Guess the footballer from the clubs they played for.**

Played For is a five-round football knowledge game. A player's senior clubs are revealed chronologically. Guess early for more points, reveal another club to make it easier, but a wrong recognised player scores zero for the round.

## Game modes

- **Daily Five:** the same five players for everyone on a given UTC date, with a numbered daily challenge beginning at Played For #1 on 3 August 2026.
- **Practice:** unlimited random five-player games using the same rules and scoring.
- Completed Daily Five results are remembered in local browser storage and can be shared without player names or club spoilers.

## Core rules

- Five players per game.
- Senior competitive clubs only.
- Loan spells are included and marked `(loan)`.
- Return spells appear again in the chronology.
- Reserve/B-team spells are excluded by default.
- One real guess per player.
- Wrong recognised player = 0 points and the round ends.
- Invalid/unrecognised spelling does **not** use the guess.
- Searchable autocomplete supports stored aliases and accent-insensitive matching.
- Scoring adapts to career length: the first club is always worth 1,000, every additional reveal lowers the score, and revealing the complete career leaves 0 points available.

## Player bank

- 100 curated players are currently available across Daily Five and Practice.
- The bank is split into base, expansion, niche, cult and famous packs so it can keep growing without becoming one unmanageable data file.
- Every player ID has a corresponding career source in `data/player-sources.ts`.
- Every profile has an initial `easy`, `normal` or `hard` assignment in `data/player-difficulty.ts`.
- Current tier sizes are 35 easy, 41 normal and 24 hard. These can be refined through playtesting before separate modes are exposed in the UI.
- Validation tests fail if a player is missing a source, is missing a difficulty tier, appears in multiple tiers, or duplicates another player ID.

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

- Use the difficulty registry to build Easy, Normal and Hard practice modes and a balanced Daily Five.
- Freeze published Daily Five line-ups so later bank expansions cannot reshuffle an already released date.
- Add recent-player avoidance in Practice.
- Add properly licensed player imagery to the reveal state.
- Add streaks only after the Daily Five system has proved stable.
