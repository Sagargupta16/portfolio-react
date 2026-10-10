/*
 * The Minesweeper cover's PlayField (w = 10, h = 13) and its tile geometry
 * in the shared 160 x 100 viewBox. The board below is a real medium deal
 * (Random.value < 0.15); the digits are exactly what PlayField.FFuncover
 * uncovers from CLICK.
 */

/* '*' mine, '#' stays covered, digits are what the flood uncovers. */
export const BOARD = [
   "*#*#######",
   "***#*##*##",
   "##221#*###",
   "#1000111##",
   "*#1000001*",
   "#*1000002#",
   "##1000001*",
   "###11221##",
   "##*##**###",
   "######*###",
   "*########*",
   "##########",
   "*#*#######",
];
export const CLICK = { col: 3, row: 4 };
export const HIT = { col: 9, row: 4 };

export interface Cell {
   col: number;
   row: number;
   mark: string;
}
export const CELLS: Cell[] = BOARD.flatMap((line, row) =>
   [...line].map((mark, col) => ({ col, row, mark })),
);
const isDigit = (c: Cell) => c.mark >= "0" && c.mark <= "9";
export const MINES = CELLS.filter((c) => c.mark === "*");
export const OPENED = CELLS.filter(isDigit);
export const NUMBERED = OPENED.filter((c) => c.mark !== "0");
export const CLOSED = CELLS.filter((c) => c.mark === "#");
/* The flood radiates from the click; four rings of two Manhattan steps. */
const ringOf = (c: Cell) =>
   Math.min(
      Math.floor(
         (Math.abs(c.col - CLICK.col) + Math.abs(c.row - CLICK.row)) / 2,
      ),
      3,
   );
export const RINGS = [0, 1, 2, 3].map((ring) => ({
   id: `ring${ring}`,
   ring,
   cells: OPENED.filter((c) => ringOf(c) === ring),
}));

/* Geometry, viewBox units. */
export const PITCH = 4.6;
export const TILE = 4;
export const BOARD_X = 28;
export const BOARD_Y = 26.5;
export const tileX = (c: { col: number }) => BOARD_X + PITCH * c.col;
export const tileY = (c: { row: number }) => BOARD_Y + PITCH * c.row;
export const centre = (c: { col: number; row: number }) => ({
   x: tileX(c) + TILE / 2,
   y: tileY(c) + TILE / 2,
});
const roundedTile = (c: Cell, r = 0.7) => {
   const x = tileX(c);
   const y = tileY(c);
   const e = x + TILE;
   const b = y + TILE;
   return `M${x + r} ${y}H${e - r}Q${e} ${y} ${e} ${y + r}V${b - r}Q${e} ${b} ${e - r} ${b}H${x + r}Q${x} ${b} ${x} ${b - r}V${y + r}Q${x} ${y} ${x + r} ${y}Z`;
};
export const tilesD = (cells: Cell[]) =>
   cells.map((c) => roundedTile(c)).join("");
export const ALL_D = tilesD(CELLS);

/* HUD: Score LCD, smiley, Time LCD in the sunken strip above the board. */
export const LCD = { w: 13, h: 7, y: 16 };
export const SCORE_X = 30;
export const TIME_X = 58.4;

export const CYCLE = 6;

/* Storyboard clock, seconds. */
export const CLICK_AT = 1;
export const FLOOD_STEP = 0.12;
export const FADE = 0.15;
export const ringAt = (ring: number) => CLICK_AT + FLOOD_STEP * ring;
export const MINE_AT = 3.8;
export const LINK_AT = 4;
export const PANEL_AT = 4.3;
export const RESTART_AT = 5.2;
export const RESET = 5.3;
export const RESET_END = 5.5;
