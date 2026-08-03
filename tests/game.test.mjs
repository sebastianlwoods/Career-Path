import assert from "node:assert/strict";
import test from "node:test";
import { players } from "../data/players.ts";
import { playerSources } from "../data/player-sources.ts";
import {
  chooseDailyRounds,
  chooseRounds,
  dailyNumberForDate,
  getPlayerSuggestions,
  normalizeAnswer,
  resolvePlayerInput,
  scoreForRevealCount,
  utcDateKey,
} from "../lib/game.ts";

test("answer normalisation ignores accents and punctuation", () => {
  assert.equal(normalizeAnswer("Diego Forlán"), "diego forlan");
  assert.equal(normalizeAnswer("  El-Niño! "), "el nino");
});

test("known aliases resolve to a real player", () => {
  const result = resolvePlayerInput(players, "R9");
  assert.equal(result.status, "matched");
  assert.equal(result.status === "matched" ? result.player.id : null, "ronaldo-nazario");
});

test("aliases resolve across the expanded bank", () => {
  const zlatan = resolvePlayerInput(players, "Zlatan");
  const rvp = resolvePlayerInput(players, "RVP");
  const yak = resolvePlayerInput(players, "The Yak");
  const kpb = resolvePlayerInput(players, "KPB");
  assert.equal(zlatan.status === "matched" ? zlatan.player.id : null, "zlatan-ibrahimovic");
  assert.equal(rvp.status === "matched" ? rvp.player.id : null, "robin-van-persie");
  assert.equal(yak.status === "matched" ? yak.player.id : null, "yakubu");
  assert.equal(kpb.status === "matched" ? kpb.player.id : null, "kevin-prince-boateng");
});

test("unknown spellings do not consume a guess", () => {
  assert.equal(resolvePlayerInput(players, "Hernandaz").status, "none");
});

test("autocomplete searches aliases as well as display names", () => {
  const suggestions = getPlayerSuggestions(players, "el ni");
  assert.equal(suggestions[0]?.id, "fernando-torres");
});

test("scoring falls to zero as a career is fully revealed", () => {
  assert.deepEqual(
    [1, 2, 3, 4, 5].map((revealed) => scoreForRevealCount(revealed, 5)),
    [1000, 750, 500, 250, 0]
  );
});

test("long careers never gain a free reveal", () => {
  const anelka = players.find((player) => player.id === "nicolas-anelka");
  assert.ok(anelka);
  const scores = anelka.career.map((_, index) =>
    scoreForRevealCount(index + 1, anelka.career.length)
  );
  for (let index = 1; index < scores.length; index += 1) {
    assert.ok(scores[index] < scores[index - 1]);
  }
  assert.equal(scores.at(-1), 0);
});

test("five-round selection contains no duplicate players", () => {
  const selected = chooseRounds(players, 5, () => 0.42);
  assert.equal(selected.length, 5);
  assert.equal(new Set(selected.map((player) => player.id)).size, 5);
});

test("Daily Five is deterministic for the same date", () => {
  const first = chooseDailyRounds(players, "2026-08-03").map((player) => player.id);
  const second = chooseDailyRounds(players, "2026-08-03").map((player) => player.id);
  assert.deepEqual(first, second);
  assert.equal(first.length, 5);
  assert.equal(new Set(first).size, 5);
});

test("different dates can produce a different Daily Five", () => {
  const first = chooseDailyRounds(players, "2026-08-03").map((player) => player.id);
  const second = chooseDailyRounds(players, "2026-08-04").map((player) => player.id);
  assert.notDeepEqual(first, second);
});

test("daily numbering begins with Played For #1 on launch day", () => {
  assert.equal(dailyNumberForDate("2026-08-03"), 1);
  assert.equal(dailyNumberForDate("2026-08-04"), 2);
});

test("UTC date keys are stable", () => {
  assert.equal(utcDateKey(new Date("2026-08-03T23:59:59Z")), "2026-08-03");
  assert.equal(utcDateKey(new Date("2026-08-04T00:00:00Z")), "2026-08-04");
});

test("expanded bank has sixty players and loans are explicitly flagged", () => {
  assert.equal(players.length, 60);
  assert.equal(players.some((player) => player.career.some((stop) => stop.loan)), true);
  assert.equal(new Set(players.map((player) => player.id)).size, 60);
});

test("every player career has an audit source", () => {
  for (const player of players) {
    const source = playerSources[player.id];
    assert.ok(source, `Missing source for ${player.id}`);
    assert.match(source.url, /^https:\/\//);
  }
});
