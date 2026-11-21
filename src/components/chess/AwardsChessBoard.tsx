"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Chess, type Move, type Square } from "chess.js";
import { AnimatePresence, motion } from "motion/react";
import { awards } from "@/lib/content";
import boardData from "../../../content/chessboard.json";
import type { Award } from "@/types/content";
import { PIECE_NAMES, PIECE_VALUES, PieceIcon, type PieceType } from "./pieces";
import { pickMove } from "./engine";
import styles from "./AwardsChessBoard.module.css";

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const RANKS = [8, 7, 6, 5, 4, 3, 2, 1];
const SIDE_LABEL = { w: boardData.white.label, b: boardData.black.label };

type Placement = Record<string, string>; // square -> starting square of the piece standing there

/** Award carried by the piece that started on each square. Some awards won more than once sit on several pieces. */
const AWARD_AT_START: Record<string, string> = {};
for (const side of [boardData.white, boardData.black] as Record<string, string>[]) {
  for (const [sq, id] of Object.entries(side)) if (sq !== "label") AWARD_AT_START[sq] = id;
}

const PIECES_PER_AWARD: Record<string, number> = {};
for (const id of Object.values(AWARD_AT_START)) PIECES_PER_AWARD[id] = (PIECES_PER_AWARD[id] ?? 0) + 1;

function startPlacement(): Placement {
  return Object.fromEntries(Object.keys(AWARD_AT_START).map((sq) => [sq, sq]));
}

/** Standard start position with the pawns that have no award yet removed. */
function startFen(placement: Placement): string {
  const g = new Chess();
  for (const f of FILES) {
    if (!placement[f + "2"]) g.remove((f + "2") as Square);
    if (!placement[f + "7"]) g.remove((f + "7") as Square);
  }
  const parts = g.fen().split(" ");
  return parts.join(" ");
}

const awardById = new Map((awards as Award[]).map((a) => [a.id, a]));

type Captured = { awardId: string; type: PieceType; color: "w" | "b" };

export function AwardsChessBoard() {
  const initial = useMemo(startPlacement, []);
  const initialFen = useMemo(() => startFen(initial), [initial]);
  const gameRef = useRef(new Chess(initialFen));
  const [fen, setFen] = useState(initialFen);
  const [placement, setPlacement] = useState<Placement>(initial);
  const [mode, setMode] = useState<"explore" | "play">("explore");
  const [depth, setDepth] = useState(2);
  const [selected, setSelected] = useState<Square | null>(null);
  const [focus, setFocus] = useState<Square | null>("e1");
  const [captured, setCaptured] = useState<Captured[]>([]);
  const [toast, setToast] = useState<Captured | null>(null);
  const [thinking, setThinking] = useState(false);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);

  const game = gameRef.current;
  const board = useMemo(() => new Chess(fen).board(), [fen]);

  const legalTargets = useMemo(() => {
    if (mode !== "play" || !selected) return new Set<string>();
    return new Set(new Chess(fen).moves({ square: selected, verbose: true }).map((m) => m.to));
  }, [fen, selected, mode]);

  const applyMove = useCallback((m: Move) => {
    setPlacement((prev) => {
      const next = { ...prev };
      let capSq: string | null = null;
      if (m.captured) capSq = m.flags.includes("e") ? m.to[0] + m.from[1] : m.to;
      if (capSq) {
        const key = next[capSq];
        if (key) {
          const c: Captured = { awardId: AWARD_AT_START[key], type: m.captured as PieceType, color: m.color === "w" ? "b" : "w" };
          setCaptured((list) => [...list, c]);
          setToast(c);
        }
        delete next[capSq];
      }
      if (next[m.from]) {
        next[m.to] = next[m.from];
        delete next[m.from];
      }
      const rank = m.color === "w" ? "1" : "8";
      if (m.flags.includes("k") && next["h" + rank]) {
        next["f" + rank] = next["h" + rank];
        delete next["h" + rank];
      }
      if (m.flags.includes("q") && next["a" + rank]) {
        next["d" + rank] = next["a" + rank];
        delete next["a" + rank];
      }
      return next;
    });
    setLastMove({ from: m.from, to: m.to });
    setFen(game.fen());
  }, [game]);

  // engine reply
  useEffect(() => {
    if (mode !== "play" || game.turn() !== "b" || game.isGameOver()) return;
    setThinking(true);
    const t = window.setTimeout(() => {
      const m = pickMove(game.fen(), depth);
      if (m) {
        const made = game.move({ from: m.from, to: m.to, promotion: m.promotion ?? "q" });
        applyMove(made);
      }
      setThinking(false);
    }, 350);
    return () => window.clearTimeout(t);
  }, [fen, mode, depth, game, applyMove]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 4200);
    return () => window.clearTimeout(t);
  }, [toast]);

  const reset = (nextMode: "explore" | "play" = mode) => {
    gameRef.current = new Chess(initialFen);
    setFen(initialFen);
    setPlacement(initial);
    setCaptured([]);
    setSelected(null);
    setLastMove(null);
    setToast(null);
    setMode(nextMode);
    setFocus("e1");
  };

  const onSquare = (sq: Square) => {
    const piece = game.get(sq);
    if (mode === "explore") {
      if (piece) setFocus(sq);
      return;
    }
    if (thinking || game.isGameOver()) return;
    if (selected && legalTargets.has(sq)) {
      const made = game.move({ from: selected, to: sq, promotion: "q" });
      setSelected(null);
      applyMove(made);
      return;
    }
    if (piece && piece.color === "w") {
      setSelected(sq);
      setFocus(sq);
    } else {
      if (piece) setFocus(sq);
      setSelected(null);
    }
  };

  const focusPiece = focus ? new Chess(fen).get(focus) : null;
  const focusAward = focus && placement[focus] ? awardById.get(AWARD_AT_START[placement[focus]]) : undefined;

  const status = (() => {
    if (mode !== "play") return "Click any piece to see the award it carries.";
    if (game.isCheckmate()) return game.turn() === "w" ? "Checkmate. The awards won this one." : "Checkmate. You won.";
    if (game.isDraw() || game.isStalemate()) return "Draw.";
    if (thinking) return "Thinking…";
    return game.isCheck() ? "You are in check. Your move." : "Your move (White).";
  })();

  const awardList = (color: "w" | "b") =>
    Object.entries(color === "w" ? boardData.white : boardData.black)
      .filter(([k]) => k !== "label")
      .map(([sq, id]) => ({ sq, award: awardById.get(id), type: new Chess(initialFen).get(sq as Square)?.type as PieceType }))
      .filter((x) => x.award && x.type)
      // an award on several pieces is listed once, under its most valuable piece
      .sort((a, b) => "kqrbnp".indexOf(a.type) - "kqrbnp".indexOf(b.type))
      .filter((x, i, all) => all.findIndex((y) => y.award === x.award) === i)
      .sort((a, b) => "kqrbnp".indexOf(a.type) - "kqrbnp".indexOf(b.type));

  return (
    <div className={styles.wrap}>
      <div className={styles.boardCol}>
        <div className={styles.board} role="grid" aria-label="Awards chess board">
          {RANKS.map((rank, ri) =>
            FILES.map((file, fi) => {
              const sq = (file + rank) as Square;
              const cell = board[ri][fi];
              const dark = (ri + fi) % 2 === 1;
              const hasAward = Boolean(placement[sq]);
              const isSel = selected === sq;
              const isFocus = focus === sq;
              const isTarget = legalTargets.has(sq);
              const isLast = lastMove && (lastMove.from === sq || lastMove.to === sq);
              const award = hasAward ? awardById.get(AWARD_AT_START[placement[sq]]) : undefined;
              return (
                <button
                  key={sq}
                  type="button"
                  role="gridcell"
                  className={[styles.square, dark ? styles.dark : styles.light, isSel ? styles.sel : "", isFocus && !isSel ? styles.focus : "", isLast ? styles.last : ""].join(" ")}
                  onClick={() => onSquare(sq)}
                  onMouseEnter={() => mode === "explore" && cell && setFocus(sq)}
                  aria-label={cell ? `${cell.color === "w" ? "White" : "Black"} ${PIECE_NAMES[cell.type as PieceType]} on ${sq}${award ? `: ${award.name}` : ""}` : `Empty square ${sq}`}
                >
                  {fi === 0 && <span className={styles.rankLabel}>{rank}</span>}
                  {ri === 7 && <span className={styles.fileLabel}>{file}</span>}
                  {cell && (
                    <motion.span layoutId={hasAward ? "piece-" + placement[sq] : undefined} className={styles.piece} transition={{ type: "spring", stiffness: 380, damping: 30 }}>
                      <PieceIcon type={cell.type as PieceType} color={cell.color} className={styles.pieceSvg} />
                      {hasAward && <span className={styles.medal} aria-hidden />}
                    </motion.span>
                  )}
                  {isTarget && <span className={cell ? styles.captureRing : styles.dot} aria-hidden />}
                </button>
              );
            })
          )}
        </div>
        <p className={styles.status} aria-live="polite">{status}</p>
      </div>

      <aside className={styles.side}>
        <div className={styles.modes} role="group" aria-label="Mode">
          <button type="button" aria-pressed={mode === "explore"} onClick={() => reset("explore")}>Explore</button>
          <button type="button" aria-pressed={mode === "play"} onClick={() => reset("play")}>Play against it</button>
        </div>

        {mode === "play" && (
          <div className={styles.controls}>
            <label>
              Difficulty{" "}
              <select value={depth} onChange={(e) => setDepth(Number(e.target.value))}>
                <option value={1}>Easy</option>
                <option value={2}>Medium</option>
                <option value={3}>Harder</option>
              </select>
            </label>
            <button type="button" className={styles.reset} onClick={() => reset("play")}>New game</button>
          </div>
        )}

        <div className={styles.card}>
          {focusPiece ? (
            <>
              <p className={styles.kicker}>
                {focusPiece.color === "w" ? "White" : "Black"} {PIECE_NAMES[focusPiece.type as PieceType]} · worth {PIECE_VALUES[focusPiece.type as PieceType]} · {SIDE_LABEL[focusPiece.color]}
              </p>
              {focusAward ? (
                <>
                  <h2>{focusAward.name}</h2>
                  <p className={styles.org}>{[focusAward.organization, focusAward.year].filter(Boolean).join(" · ")}</p>
                  <p>{focusAward.description}</p>
                  {PIECES_PER_AWARD[focusAward.id] > 1 && (
                    <p className={styles.repeat}>Won more than once, so it sits on {PIECES_PER_AWARD[focusAward.id]} pieces.</p>
                  )}
                </>
              ) : (
                <p>No award on this piece.</p>
              )}
            </>
          ) : (
            <p>Click a piece to see its award.</p>
          )}
        </div>

        {mode === "play" && captured.length > 0 && (
          <div className={styles.captured}>
            <p className={styles.kicker}>Captured</p>
            <ul>
              {captured.map((c, i) => (
                <li key={i}>
                  <PieceIcon type={c.type} color={c.color} className={styles.capIcon} />
                  <span>{awardById.get(c.awardId)?.name}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>

      <AnimatePresence>
        {toast && (
          <motion.div
            className={styles.toast}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            role="status"
          >
            <PieceIcon type={toast.type} color={toast.color} className={styles.capIcon} />
            <div>
              <p className={styles.kicker}>{toast.color === "b" ? "You took" : "You lost"} a {PIECE_NAMES[toast.type].toLowerCase()}</p>
              <p>{awardById.get(toast.awardId)?.name}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className={styles.lists} aria-label="All awards by piece">
        {(["w", "b"] as const).map((color) => (
          <div key={color}>
            <h2>{color === "w" ? "White" : "Black"}: {SIDE_LABEL[color]}</h2>
            <ul>
              {awardList(color).map(({ sq, award, type }) => (
                <li key={sq}>
                  <button type="button" onClick={() => { if (mode !== "explore") reset("explore"); setFocus(sq as Square); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                    <PieceIcon type={type} color={color} className={styles.listIcon} />
                    <span className={styles.listName}>{award!.name}</span>
                    <span className={styles.listMeta}>{[award!.organization, award!.year].filter(Boolean).join(" · ")}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </div>
  );
}
