import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { AwardsChessBoard } from "@/components/chess/AwardsChessBoard";

export const metadata: Metadata = {
  title: "Awards & Honors",
  description: "Tanay Mangal's awards and honors, set up as a chess board: better awards sit on more valuable pieces, and you can play against it.",
};

export default function AwardsPage() {
  return (
    <PageShell
      title="Awards & Honors"
      description="I have played chess since I was 6 or 7, so my awards are set up as a board. Better awards sit on more valuable pieces: math, research and STEM are White, and chess, taekwondo and community are Black. Click a piece to read about it, or switch to play and try to win them off the board."
    >
      <AwardsChessBoard />
    </PageShell>
  );
}
