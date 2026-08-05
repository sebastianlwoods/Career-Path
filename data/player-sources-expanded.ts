import type { PlayerSource } from "./player-sources";
import { expandedPlayerIdsByDifficulty } from "./player-difficulty-expanded";

const expandedPlayerIds = Object.values(expandedPlayerIdsByDifficulty).flat();

export const expandedPlayerSources: Record<string, PlayerSource> = Object.fromEntries(
  expandedPlayerIds.map((id) => [
    id,
    {
      label: "Wikipedia search",
      url: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(
        id.replaceAll("-", " ")
      )}`,
    },
  ])
);
