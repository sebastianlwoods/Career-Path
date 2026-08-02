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
    <div className="score-strip score-strip-dynamic" aria-label="Current reveal trade-off">
      <div className="score-step active">
        <span>Clubs shown</span>
        <b>{revealed}/{totalStops}</b>
      </div>
      <div className="score-step">
        <span>Next reveal</span>
        <b>{revealed < totalStops ? `-${revealCost}` : "—"}</b>
      </div>
      <div className="score-step">
        <span>Correct now</span>
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
          <div className="brand-lockup"><span className="brand-dot" /> Career Path</div>
          <span className="beta-pill">football career game · v0.1</span>
        </nav>

        <section className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">CLUB BY CLUB. ONE PLAYER.</p>
            <h1>How early can you see the career?</h1>
            <p className="hero-text">
              Follow a footballer&apos;s senior career in order. Guess after one club for the maximum score, or reveal another and make it easier.
            </p>
            <div className="rule-row">
              <span>5 players</span>
              <span>1 guess each</span>
              <span>wrong guess = 0</span>
              <span>loans shown</span>
            </div>
            <button className="primary-button" onClick={startGame}>
              Start Career Path <span>→</span>
            </button>
          </div>

          <div className="preview-card">
            <div className="preview-topline"><span>EXAMPLE PATH</span><span>1,000 PTS</span></div>
            <div className="preview-path">
              <CareerStop club="Cannes" index={0} />
              <div className="hidden-stop">?</div>
              <div className="hidden-stop">?</div>
              <div className="hidden-stop">?</div>
            </div>
            <div className="preview-answer">Who is it?</div>
          </div>
        </section>

        <section className="how-grid">
          <article><span>01</span><h2>Read the path</h2><p>Clubs appear chronologically. Loan spells are marked clearly.</p></article>
          <article><span>02</span><h2>Choose your moment</h2><p>Reveal another club if you need it. Every reveal lowers the maximum score.</p></article>
          <article><span>03</span><h2>Commit once</h2><p>A recognised wrong player ends the round for zero. Bad spelling does not.</p></article>
        </section>
      </main>
    );
  }

  if (phase === "results") {
    const correctCount = results.filter((result) => result.correct).length;
    return (
      <main className="shell results-shell">
        <nav className="topbar">
          <div className="brand-lockup"><span className="brand-dot" /> Career Path</div>
          <button className="text-button" onClick={() => setPhase("menu")}>Home</button>
        </nav>
        <section className="results-card">
          <p className="eyebrow">FULL TIME</p>
          <h1>{totalScore.toLocaleString()} <small>/ 5,000</small></h1>
          <p className="result-summary">You got {correctCount} of 5 players.</p>
          <div className="result-list">
            {results.map((result, index) => (
              <div className="result-row" key={`${result.playerId}-${index}`}>
                <span className={result.correct ? "result-mark correct" : "result-mark wrong"}>{result.correct ? "✓" : "×"}</span>
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

  return (
    <main className="shell game-shell">
      <nav className="topbar">
        <div className="brand-lockup"><span className="brand-dot" /> Career Path</div>
        <div className="game-meta"><span>Player {roundIndex + 1}/5</span><b>{totalScore.toLocaleString()} pts</b></div>
      </nav>

      <section className="game-card">
        <div className="round-head">
          <div>
            <p className="eyebrow">CAREER PATH</p>
            <h1>{roundOver ? current.name : "Who is this footballer?"}</h1>
          </div>
          <div className="score-badge"><small>AVAILABLE</small><b>{roundOver ? roundResult?.score ?? 0 : availableScore}</b></div>
        </div>

        <RevealTradeoff revealed={revealed} totalStops={current.career.length} />

        <div className="path-list">
          {current.career.map((stop, index) => {
            const visible = roundOver || index < revealed;
            if (!visible) return <div className="hidden-career-stop" key={`${stop.club}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span><i>hidden club</i></div>;
            return <CareerStop key={`${stop.club}-${index}`} club={stop.club} loan={stop.loan} index={index} />;
          })}
        </div>

        {!roundOver ? (
          <div className="answer-zone">
            <label htmlFor="player-search">Your guess</label>
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
            {error ? <p className="input-error">{error}</p> : <p className="input-help">Typing something unrecognised never uses your one guess.</p>}
            <div className="action-row">
              <button className="secondary-button" onClick={revealNext} disabled={revealed >= current.career.length}>Reveal next club</button>
              <button className="primary-button compact" onClick={submitGuess}>Lock in guess <span>→</span></button>
            </div>
          </div>
        ) : (
          <div className={roundResult?.correct ? "feedback correct-feedback" : "feedback wrong-feedback"}>
            <div>
              <p>{roundResult?.correct ? "Correct" : "Wrong player"}</p>
              <h2>{roundResult?.correct ? `+${roundResult.score} points` : `${roundResult?.guessedName} was not the answer.`}</h2>
            </div>
            <button className="primary-button compact" onClick={nextRound}>{roundIndex === rounds.length - 1 ? "See result" : "Next player"}<span>→</span></button>
          </div>
        )}
      </section>
    </main>
  );
}
