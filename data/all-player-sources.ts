import { playerSources as originalPlayerSources } from "./player-sources";
import { expandedPlayerSources } from "./player-sources-expanded";

export const allPlayerSources = {
  ...originalPlayerSources,
  ...expandedPlayerSources,
};
