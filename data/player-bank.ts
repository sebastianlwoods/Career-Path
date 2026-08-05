import { famousPlayers } from "./players-famous";
import { players as existingPlayers } from "./players";

export type { CareerStop, Player } from "./players";

export const players = [...existingPlayers, ...famousPlayers];
