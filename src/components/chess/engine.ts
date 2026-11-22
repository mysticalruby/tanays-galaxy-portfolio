import { Chess, type Move } from "chess.js";

/**
 * A deliberately small chess engine: material plus piece-square tables,
 * searched with minimax and alpha-beta pruning. Good enough to punish blunders,
 * easy enough that it can be beaten.
 */
const VALUE: Record<string, number> = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };

// Piece-square tables from White's point of view, a8 first (index 0) to h1 (index 63).
const PST: Record<string, number[]> = {
  p: [0,0,0,0,0,0,0,0, 50,50,50,50,50,50,50,50, 10,10,20,30,30,20,10,10, 5,5,10,25,25,10,5,5, 0,0,0,20,20,0,0,0, 5,-5,-10,0,0,-10,-5,5, 5,10,10,-20,-20,10,10,5, 0,0,0,0,0,0,0,0],
  n: [-50,-40,-30,-30,-30,-30,-40,-50, -40,-20,0,0,0,0,-20,-40, -30,0,10,15,15,10,0,-30, -30,5,15,20,20,15,5,-30, -30,0,15,20,20,15,0,-30, -30,5,10,15,15,10,5,-30, -40,-20,0,5,5,0,-20,-40, -50,-40,-30,-30,-30,-30,-40,-50],
  b: [-20,-10,-10,-10,-10,-10,-10,-20, -10,0,0,0,0,0,0,-10, -10,0,5,10,10,5,0,-10, -10,5,5,10,10,5,5,-10, -10,0,10,10,10,10,0,-10, -10,10,10,10,10,10,10,-10, -10,5,0,0,0,0,5,-10, -20,-10,-10,-10,-10,-10,-10,-20],
  r: [0,0,0,0,0,0,0,0, 5,10,10,10,10,10,10,5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, 0,0,0,5,5,0,0,0],
  q: [-20,-10,-10,-5,-5,-10,-10,-20, -10,0,0,0,0,0,0,-10, -10,0,5,5,5,5,0,-10, -5,0,5,5,5,5,0,-5, 0,0,5,5,5,5,0,-5, -10,5,5,5,5,5,0,-10, -10,0,5,0,0,0,0,-10, -20,-10,-10,-5,-5,-10,-10,-20],
  k: [-30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30, -20,-30,-30,-40,-40,-30,-30,-20, -10,-20,-20,-20,-20,-20,-20,-10, 20,20,0,0,0,0,20,20, 20,30,10,0,0,10,30,20],
};

function evaluate(game: Chess): number {
  // positive = good for White
  let score = 0;
  const board = game.board();
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const sq = board[r][f];
      if (!sq) continue;
      const idx = sq.color === "w" ? r * 8 + f : (7 - r) * 8 + f;
      const v = VALUE[sq.type] + PST[sq.type][idx];
      score += sq.color === "w" ? v : -v;
    }
  }
  return score;
}

function ordered(moves: Move[]): Move[] {
  const score = (m: Move) => (m.captured ? VALUE[m.captured] * 10 - VALUE[m.piece] : 0) + (m.promotion ? 800 : 0);
  return moves.sort((a, b) => score(b) - score(a));
}

/**
 * Quiescence search: at the end of the main search, keep looking at captures
 * until things are quiet, so the engine does not stop right before losing a piece.
 * Scores are from White's point of view.
 */
class OutOfTime extends Error {}
let deadline = Infinity;
let nodes = 0;
function tick() {
  if (++nodes % 256 === 0 && performance.now() > deadline) throw new OutOfTime();
}

function quiesce(game: Chess, alpha: number, beta: number, maximizing: boolean, depth = 0): number {
  tick();
  const stand = evaluate(game);
  if (depth >= 3) return stand;
  if (maximizing) {
    if (stand >= beta) return stand;
    alpha = Math.max(alpha, stand);
  } else {
    if (stand <= alpha) return stand;
    beta = Math.min(beta, stand);
  }
  // only captures that win material or trade evenly; the rest are almost never good
  const captures = ordered(
    game.moves({ verbose: true }).filter((m) => m.promotion || (m.captured && VALUE[m.captured] >= VALUE[m.piece] - 20))
  );
  let best = stand;
  for (const m of captures) {
    game.move(m);
    const s = quiesce(game, alpha, beta, !maximizing, depth + 1);
    game.undo();
    if (maximizing) {
      best = Math.max(best, s);
      alpha = Math.max(alpha, s);
    } else {
      best = Math.min(best, s);
      beta = Math.min(beta, s);
    }
    if (beta <= alpha) break;
  }
  return best;
}

function search(game: Chess, depth: number, alpha: number, beta: number, maximizing: boolean): number {
  tick();
  if (depth === 0) return quiesce(game, alpha, beta, maximizing);
  const moves = ordered(game.moves({ verbose: true }));
  if (moves.length === 0) {
    if (game.isCheck()) return maximizing ? -100000 - depth : 100000 + depth;
    return 0;
  }
  if (game.isDraw()) return 0;
  if (maximizing) {
    let best = -Infinity;
    for (const m of moves) {
      game.move(m);
      best = Math.max(best, search(game, depth - 1, alpha, beta, false));
      game.undo();
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break;
    }
    return best;
  }
  let best = Infinity;
  for (const m of moves) {
    game.move(m);
    best = Math.min(best, search(game, depth - 1, alpha, beta, true));
    game.undo();
    beta = Math.min(beta, best);
    if (beta <= alpha) break;
  }
  return best;
}

/** A few normal replies for the first moves, so the engine does not open the same way every game. */
const BOOK: Record<string, string[]> = {
  "e2e4": ["e7e5", "c7c5", "e7e6", "c7c6", "d7d5", "g8f6", "d7d6"],
  "d2d4": ["d7d5", "g8f6", "e7e6", "d7d6", "c7c5", "g7g6"],
  "c2c4": ["e7e5", "g8f6", "c7c5", "e7e6", "g7g6"],
  "g1f3": ["d7d5", "g8f6", "c7c5", "g7g6"],
  "e2e3": ["e7e5", "d7d5", "g8f6"],
  "d2d3": ["e7e5", "d7d5", "g8f6"],
  "b1c3": ["d7d5", "e7e5", "g8f6"],
};

/**
 * Picks a move for the side to move. Searches `depth` plies (plus captures), then
 * picks randomly among the moves that are nearly as good as the best one, with more
 * freedom in the opening, so games are not identical.
 */
export function pickMove(fen: string, depth: number, history: { from: string; to: string }[] = []): Move | null {
  const game = new Chess(fen);
  // first reply: pick from a few normal openings (a FEN has no history, so the caller passes it)
  if (history.length === 1) {
    const first = history[0].from + history[0].to;
    const options = (BOOK[first] ?? []).slice().sort(() => Math.random() - 0.5);
    const legal = game.moves({ verbose: true });
    for (const o of options) {
      const m = legal.find((l) => l.from + l.to === o);
      if (m) return m;
    }
  }
  let moves = ordered(game.moves({ verbose: true }));
  if (!moves.length) return null;
  const white = game.turn() === "w";
  // iterative deepening: search 1 ply, then 2, ... up to `depth`, keeping the last
  // finished result if time runs out
  deadline = performance.now() + (depth <= 1 ? 400 : depth === 2 ? 1000 : 2200);
  nodes = 0;
  const moveNumber = Number(fen.split(" ")[5] ?? 1);
  // how many centipawns worse a move may be and still get picked
  const margin = moveNumber <= 3 ? 30 : moveNumber <= 6 ? 20 : moveNumber <= 15 ? 10 : 5;
  let scored: { m: Move; s: number }[] = moves.map((m) => ({ m, s: 0 }));
  for (let d = 1; d <= depth; d++) {
    try {
      const round: { m: Move; s: number }[] = [];
      let bestSide = -Infinity;
      for (const m of moves) {
        game.move(m);
        try {
          // only moves within `margin` of the best so far need an exact score;
          // anything worse is cut off early (it just has to be shown to be worse)
          const bound = bestSide - margin;
          const s = white
            ? search(game, d - 1, bound, Infinity, false)
            : search(game, d - 1, -Infinity, -bound, true);
          const side = white ? s : -s; // higher is better for the side to move
          // a move that was cut off is only known to be worse than the bound
          round.push({ m, s: Number.isFinite(bound) && side <= bound ? side - 10000 : side });
          if (side > bestSide) bestSide = side;
        } finally {
          game.undo();
        }
      }
      scored = round;
      // search the best moves first next round so alpha-beta cuts more
      moves = round.slice().sort((a, b) => b.s - a.s).map((x) => x.m);
    } catch (e) {
      if (e instanceof OutOfTime) break;
      throw e;
    }
  }
  // a little noise so equal-looking moves are not always chosen in the same order
  const noise = moveNumber <= 8 ? 16 : 6;
  scored = scored.map((x) => ({ m: x.m, s: x.s + (Math.random() - 0.5) * noise }));
  scored.sort((a, b) => b.s - a.s);
  const best = scored[0].s;
  const close = scored.filter((x) => x.s >= best - margin);
  return close[Math.floor(Math.random() * close.length)].m;
}
