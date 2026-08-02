import type { Player } from "../data/players";

export const ROUND_COUNT = 5;

export function scoreForRevealCount(revealed: number, totalStops: number) {
  if (revealed <= 0 || totalStops <= 0) return 0;
  if (totalStops === 1) return 1000;

  const clampedRevealCount = Math.min(Math.max(revealed, 1), totalStops);
  const hiddenFraction = (totalStops - clampedRevealCount) / (totalStops - 1);
  const rawScore = 1000 * hiddenFraction;

  // Keep the UI tidy while ensuring every additional reveal still costs points.
  return Math.max(0, Math.round(rawScore / 25) * 25);
}

export function normalizeAnswer(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function playerSearchTerms(player: Player) {
  return [player.name, ...player.aliases].map(normalizeAnswer);
}

export function getPlayerSuggestions(players: Player[], query: string, limit = 6) {
  const normalizedQuery = normalizeAnswer(query);
  if (normalizedQuery.length < 2) return [];

  return players
    .map((player) => {
      const terms = playerSearchTerms(player);
      const starts = terms.some((term) => term.startsWith(normalizedQuery));
      const contains = terms.some((term) => term.includes(normalizedQuery));
      return { player, rank: starts ? 0 : contains ? 1 : 2 };
    })
    .filter(({ rank }) => rank < 2)
    .sort((a, b) => a.rank - b.rank || a.player.name.localeCompare(b.player.name))
    .slice(0, limit)
    .map(({ player }) => player);
}

export function resolvePlayerInput(players: Player[], input: string) {
  const normalized = normalizeAnswer(input);
  if (!normalized) return { status: "none" as const };

  const matches = players.filter((player) =>
    playerSearchTerms(player).some((term) => term === normalized)
  );

  if (matches.length === 1) return { status: "matched" as const, player: matches[0] };
  if (matches.length > 1) return { status: "ambiguous" as const, players: matches };
  return { status: "none" as const };
}

export function chooseRounds(players: Player[], count = ROUND_COUNT, random = Math.random) {
  const shuffled = [...players];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
