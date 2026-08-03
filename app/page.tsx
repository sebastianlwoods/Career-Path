"use client";

import { useMemo, useState } from "react";
import { players, type Player } from "../data/players";
import {
  chooseRounds,
  getPlayerSuggestions,
  resolvePlayerInput,
  scoreForRevealCount,
} from "../lib/game";

type RoundResult = {
  playerId: string;
  name: string;
  correct: boolean;
  guessedName: string;
  score: number;
  revealed: number;
};

type Phase = "menu" | "playing" | "results";

function BrandLockup() {
  return (
    <div className="brand-lockup">
      <span className="brand-kicker">THE FOOTBALL QUIZ</span>
      <strong>Played For</strong>
    </div>
  );
}

function CareerStop({ club, loan, index }: { club: string; loan?: boolean; index: number }) {
  return (
    <div className="career-stop">
      <span className="stop-index">{String(index + 1).padStart(2, "0")}</span>
      <div>
        <strong>{club}</strong>
        {loan ? <span className="loan-pill">loan</span> : null}
      </div>
    </div>
  );
}

function RevealTradeoff({ revealed, totalStops }: { revealed: number; totalStops: number }) {
  const available = scoreForRevealCount(revealed, totalStops);
  const nextScore =
    revealed < totalStops ? scoreForRevealCount(revealed + 1, totalStops) : available;
  const revealCost = Math.max(0, available - nextScore);

  return (
    <div className="score-strip" aria-label="Current reveal trade-off">
      <div className="score-step score-step-blue">
        <span>Clubs in print</span>
        <b>{revealed}/{totalStops}</b>
      </div>
      <div className="score-step score-step-gold">
        <span>Next clue costs</span>
        <b>{revealed < totalStops ? `-${revealCost}` : "—"}</b>
      </div>
      <div className="score-step score-step-green">
        <span>Bank if right</span>
        <b>{available}</b>
      </div>
    </div>
  );
}

export default function Home() {
  const [phase, setPhase] = useState<Phase>("menu");
  const [rounds, setRounds] = useState<Player[]>([]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [revealed, setRevealed] = useState(1);
  const [input, setInput] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [roundOver, setRoundOver] = useState(false);
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null);
  const [results, setResults] = useState<RoundResult[]>([]);

  const current = rounds[roundIndex];
  const suggestions = useMemo(
    () => (roundOver ? [] : getPlayerSuggestions(players, input)),
    [input, roundOver]
  );
  const totalScore = results.reduce((sum, result) => sum + result.score, 0);

  function startGame() {
    setRounds(chooseRounds(players));
    setRoundIndex(0);
    setRevealed(1);
    setInput("");
    setSelectedId(null);
    setError("");
    setRoundOver(false);
    setRoundResult(null);
    setResults([]);
    setPhase("playing");
  }

  function selectSuggestion(player: Player) {
    setInput(player.name);
    setSelectedId(player.id);
    setError("");
  }

  function revealNext() {
    if (!current || roundOver || revealed >= current.career.length) return;
    setRevealed((value) => value + 1);
    setInput("");
    setSelectedId(null);
    setError("");
  }

  function submitGuess() {
    if (!current || roundOver) return;

    let guessed: Player | undefined;
    if (selectedId) guessed = players.find((player) => player.id === selectedId);

    if (!guessed) {
      const resolved = resolvePlayerInput(players, input);
      if (resolved.status === "ambiguous") {
        setError("That name could mean more than one player. Choose the exact player from the list.");
        return;
      }
      if (resolved.status !== "matched") {
        setError("Choose a recognised player before locking in your guess. Spelling will never cost you the round.");
        return;
      }
      guessed = resolved.player;
    }

    const correct = guessed.id === current.id;
    const result: RoundResult = {
      playerId: current.id,
      name: current.name,
      correct,
      guessedName: guessed.name,
      score: correct ? scoreForRevealCount(revealed, current.career.length) : 0,
      revealed,
    };

    setRoundResult(result);
    setResults((previous) => [...previous, result]);
    setRoundOver(true);
    setError("");
  }

  function nextRound() {
    if (roundIndex >= rounds.length - 1) {
      setPhase("results");
      return;
    }
    setRoundIndex((value) => value + 1);
    setRevealed(1);
    setInput("");
    setSelectedId(null);
    setError("");
    setRoundOver(false);
    setRoundResult(null);
  }

  if (phase === "menu") {
    return (
      <main className="shell landing-shell">
        <nav className="topbar">
          <BrandLockup />
          <span className="beta-pill">ISSUE 01 · FIVE PLAYERS</span>
        </nav>

        <section className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">CLUB HISTORIES · PLAYER PROFILES · ONE GUESS</p>
            <p className="cover-line">Guess the footballer from the clubs they played for</p>
            <h1>How early can you guess the player?</h1>
            <p className="hero-text">
              Follow a footballer&apos;s senior career in order. Guess early for more points, or reveal another club to make it easier.
            </p>
            <div className="rule-row">
              <span>5 PLAYER FILES</span>
              <span>1 GUESS EACH</span>
              <span>WRONG = 0</span>
              <span>LOANS INCLUDED</span>
            </div>
            <button className="primary-button" onClick={startGame}>
              Start the game <span>→</span>
            </button>
          </div>

          <div className="preview-card">
            <div className="preview-ribbon">PLAYED FOR / EXAMPLE</div>
            <div className="preview-topline"><span>THE CLUB TRAIL</span><span>ARCHIVE No. 11</span></div>
            <div className="preview-path">
              <CareerStop club="Southampton" index={0} />
              <CareerStop club="Tottenham Hotspur" index={1} />
              <CareerStop club="Real Madrid" index={2} />
              <div className="hidden-stop"><span>04</span><b>Next club hidden</b></div>
            </div>
            <div className="preview-answer"><small>THE ANSWER</small><strong>Gareth Bale</strong><span>How early would you have gone?</span></div>
          </div>
        </section>

        <section className="how-grid">
          <article className="how-blue"><span>01 / READ</span><h2>Follow the moves</h2><p>Senior clubs appear in order. Loans are included and marked clearly.</p></article>
          <article className="how-gold"><span>02 / DECIDE</span><h2>Pick your moment</h2><p>Every extra club makes the answer easier, but takes points off the table.</p></article>
          <article className="how-red"><span>03 / COMMIT</span><h2>One guess only</h2><p>A recognised wrong player ends the round on zero. A spelling mistake never will.</p></article>
        </section>
      </main>
    );
  }

  if (phase === "results") {
    const correctCount = results.filter((result) => result.correct).length;
    return (
      <main className="shell results-shell">
        <nav className="topbar">
          <BrandLockup />
          <button className="text-button" onClick={() => setPhase("menu")}>Back to cover</button>
        </nav>
        <section className="results-card">
          <div className="feature-label">FINAL WHISTLE / SCORECARD</div>
          <p className="eyebrow">ISSUE 01 COMPLETE</p>
          <h1>{totalScore.toLocaleString()} <small>/ 5,000</small></h1>
          <p className="result-summary">You named {correctCount} of the five players.</p>
          <div className="result-list">
            {results.map((result, index) => (
              <div className="result-row" key={`${result.playerId}-${index}`}>
                <span className={result.correct ? "result-mark correct" : "result-mark wrong"}>{String(index + 1).padStart(2, "0")}</span>
                <div><b>{result.name}</b><small>{result.correct ? `Solved after ${result.revealed} club${result.revealed === 1 ? "" : "s"}` : `Guessed ${result.guessedName}`}</small></div>
                <strong>{result.score}</strong>
              </div>
            ))}
          </div>
          <button className="primary-button" onClick={startGame}>Play another five <span>→</span></button>
        </section>
      </main>
    );
  }

  if (!current) return null;

  const availableScore = scoreForRevealCount(revealed, current.career.length);
  const solvedClub = current.career[Math.max(0, revealed - 1)]?.club;

  return (
    <main className="shell game-shell">
      <nav className="topbar">
        <BrandLockup />
        <div className="game-meta"><span>FILE {String(roundIndex + 1).padStart(2, "0")} / 05</span><b>{totalScore.toLocaleString()} PTS</b></div>
      </nav>

      <section className="game-card">
        <div className="feature-label">PLAYED FOR / SENIOR CAREER</div>
        <div className="round-head">
          <div>
            <p className="eyebrow">PLAYER FILE · {String(roundIndex + 1).padStart(2, "0")}</p>
            <h1>{roundOver ? current.name : "Who played for these clubs?"}</h1>
          </div>
          <div className="score-badge"><small>{roundOver ? "ROUND SCORE" : "POINTS ON THE LINE"}</small><b>{roundOver ? roundResult?.score ?? 0 : availableScore}</b></div>
        </div>

        {!roundOver ? (
          <RevealTradeoff revealed={revealed} totalStops={current.career.length} />
        ) : (
          <div className={roundResult?.correct ? "reveal-splash reveal-correct" : "reveal-splash reveal-wrong"}>
            <span className="reveal-stamp">{roundResult?.correct ? "GOT HIM" : "MISSED"}</span>
            <div className="reveal-copy">
              <p className="reveal-kicker">PLAYER REVEALED</p>
              <h2>{current.name}</h2>
              <div className="reveal-meta">
                <span>{current.nationality}</span>
                <span>{current.career.length} senior spell{current.career.length === 1 ? "" : "s"}</span>
              </div>
            </div>
            <div className="reveal-score">
              <small>{roundResult?.correct ? "POINTS BANKED" : "ROUND SCORE"}</small>
              <strong>{roundResult?.score ?? 0}</strong>
              <span>{roundResult?.correct ? `Solved after ${revealed} club${revealed === 1 ? "" : "s"}${solvedClub ? ` · ${solvedClub}` : ""}` : `You guessed ${roundResult?.guessedName}`}</span>
            </div>
          </div>
        )}

        <div className="section-ribbon"><span>{roundOver ? "Complete senior career" : "Senior career"}</span><small>{roundOver ? "file now fully revealed" : "chronological · loans marked"}</small></div>
        <div className="path-list">
          {current.career.map((stop, index) => {
            const visible = roundOver || index < revealed;
            if (!visible) return <div className="hidden-career-stop" key={`${stop.club}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span><i>club withheld</i></div>;
            return <CareerStop key={`${stop.club}-${index}`} club={stop.club} loan={stop.loan} index={index} />;
          })}
        </div>

        {!roundOver ? (
          <div className="answer-zone">
            <div className="answer-heading"><span>YOUR SHOUT</span><small>One recognised guess. Make it count.</small></div>
            <label htmlFor="player-search">Name the player</label>
            <div className="search-wrap">
              <input
                id="player-search"
                autoComplete="off"
                value={input}
                onChange={(event) => {
                  setInput(event.target.value);
                  setSelectedId(null);
                  setError("");
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") submitGuess();
                }}
                placeholder="Start typing a player name…"
              />
              {suggestions.length > 0 && !selectedId ? (
                <div className="suggestions">
                  {suggestions.map((player) => (
                    <button type="button" key={player.id} onClick={() => selectSuggestion(player)}>
                      <span>{player.name}</span><small>{player.nationality}</small>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            {error ? <p className="input-error">{error}</p> : <p className="input-help">Unrecognised spelling never uses your one guess.</p>}
            <div className="action-row">
              <button className="secondary-button" onClick={revealNext} disabled={revealed >= current.career.length}>Reveal next club</button>
              <button className="primary-button compact" onClick={submitGuess}>Lock in guess <span>→</span></button>
            </div>
          </div>
        ) : (
          <div className="reveal-footer">
            <p>{roundResult?.correct ? "Nice. The rest of the file is open above." : `The answer was ${current.name}. The full route is now open above.`}</p>
            <button className="primary-button compact" onClick={nextRound}>{roundIndex === rounds.length - 1 ? "See scorecard" : "Next player"}<span>→</span></button>
          </div>
        )}
      </section>
    </main>
  );
}
