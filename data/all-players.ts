import { players as originalPlayers, type Player } from "./players";
import { extraPlayers } from "./players-extra";

export type { Player } from "./players";
export { playerSources } from "./player-sources";

export const players: Player[] = [...originalPlayers, ...extraPlayers];
