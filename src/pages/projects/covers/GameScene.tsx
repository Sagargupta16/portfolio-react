import type { ComponentType } from "react";
import Flappy from "./game/Flappy";
import Minesweeper from "./game/Minesweeper";
import Pacman from "./game/Pacman";
import Snake from "./game/Snake";

interface CoverSceneProps {
   tint: string;
   variant?: string;
}

/*
 * Unity 2D game covers. Each variant is its own file under ./game and draws
 * the playfield in a 160 x 100 viewBox so it scales with the card; this file
 * only dispatches on the registry's variant key.
 */

const GAMES: Record<string, ComponentType<{ tint: string }>> = {
   pacman: Pacman,
   minesweeper: Minesweeper,
   snake: Snake,
   flappy: Flappy,
};
const DEFAULT_GAME = "pacman";

const GameScene = ({ tint, variant = DEFAULT_GAME }: CoverSceneProps) => {
   const Game = GAMES[variant] ?? Pacman;

   return (
      <div
         aria-hidden="true"
         style={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
            background: "linear-gradient(160deg, #0e1a24 0%, #0b1012 60%)",
         }}
      >
         <Game tint={tint} />
      </div>
   );
};

export default GameScene;
