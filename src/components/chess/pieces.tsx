/** Simple flat chess pieces drawn for this site (45 x 45 viewBox). */
export type PieceType = "p" | "n" | "b" | "r" | "q" | "k";

const BASE = "M10 40h25v-3.5c0-1.4-1.1-2.5-2.5-2.5h-20c-1.4 0-2.5 1.1-2.5 2.5z";

const SHAPES: Record<PieceType, string> = {
  p: `${BASE} M22.5 10a5 5 0 1 1 0 10a5 5 0 1 1 0-10z M17 21h11l2.5 13h-16z`,
  r: `${BASE} M12 10h4v3h3v-3h7v3h3v-3h4v7l-3 3v11h-15v-11l-3-3z`,
  n: `${BASE} M14 34c0-6 3-9 6-12c-2 0-5 1-7 3c-1.5-1-2-3-1-4.5c3-4 7-8 11-11l1-3l2 2.5c5 2 8 7 8 14v11z M18.5 15.5a1.3 1.3 0 1 0 0.01 0z`,
  b: `${BASE} M22.5 6a2.5 2.5 0 1 1 0 5a2.5 2.5 0 1 1 0-5z M22.5 11c5 3 8 8 8 12c0 4-3 6-8 6s-8-2-8-6c0-4 3-9 8-12z M15 30h15l1.5 4h-18z`,
  q: `${BASE} M9 14l4.5 14h18l4.5-14l-6 6l-3.5-9l-4 9l-4-9l-3.5 9z M9 11.5a2 2 0 1 1 0 4a2 2 0 1 1 0-4z M36 11.5a2 2 0 1 1 0 4a2 2 0 1 1 0-4z M22.5 7.5a2 2 0 1 1 0 4a2 2 0 1 1 0-4z M15.5 9a2 2 0 1 1 0 4a2 2 0 1 1 0-4z M29.5 9a2 2 0 1 1 0 4a2 2 0 1 1 0-4z M13.5 29h18l1 5h-20z`,
  k: `${BASE} M21 4h3v3h3v3h-3v3h-3v-3h-3v-3h3z M13 17c2-3 6-4 9.5-4s7.5 1 9.5 4c2 4-1 9-3 12h-13c-2-3-5-8-3-12z M14 29h17l1 5h-19z`,
};

export const PIECE_NAMES: Record<PieceType, string> = {
  k: "King",
  q: "Queen",
  r: "Rook",
  b: "Bishop",
  n: "Knight",
  p: "Pawn",
};

export const PIECE_VALUES: Record<PieceType, string> = {
  k: "priceless",
  q: "9",
  r: "5",
  b: "3",
  n: "3",
  p: "1",
};

export function PieceIcon({ type, color, className }: { type: PieceType; color: "w" | "b"; className?: string }) {
  const fill = color === "w" ? "#f3efe6" : "#1a1e28";
  const stroke = color === "w" ? "#1a1e28" : "#d9d3c4";
  return (
    <svg viewBox="0 0 45 45" className={className} aria-hidden>
      <path d={SHAPES[type]} fill={fill} stroke={stroke} strokeWidth={1.4} strokeLinejoin="round" fillRule="nonzero" />
    </svg>
  );
}
