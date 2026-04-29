"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  size: number;
  delay: number;
  duration: number;
  borderRadius: string;
}

const COLORS = ["#3b82f6", "#8b5cf6", "#06b6d4", "#22c55e", "#f59e0b", "#ec4899", "#ffffff"];

function createPieces(): ConfettiPiece[] {
  return Array.from({ length: 80 }, (_, index) => ({
    id: index,
    x: Math.random() * 100,
    y: -(Math.random() * 20 + 10),
    rotation: Math.random() * 720 - 360,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: Math.random() * 8 + 4,
    delay: Math.random() * 0.5,
    duration: 2.5 + Math.random(),
    borderRadius: Math.random() > 0.5 ? "50%" : "2px",
  }));
}

function ConfettiBurst({ onClose }: { onClose: () => void }) {
  const [pieces] = useState<ConfettiPiece[]>(() => createPieces());

  useEffect(() => {
    const timer = window.setTimeout(onClose, 4000);
    return () => window.clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] pointer-events-none overflow-hidden"
    >
      {pieces.map((piece) => (
        <motion.div
          key={piece.id}
          initial={{
            x: `${piece.x}vw`,
            y: `${piece.y}vh`,
            rotate: 0,
            opacity: 1,
          }}
          animate={{
            y: "110vh",
            rotate: piece.rotation,
            opacity: [1, 1, 0.8, 0],
          }}
          transition={{
            duration: piece.duration,
            delay: piece.delay,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="absolute"
          style={{
            width: piece.size,
            height: piece.size * 1.5,
            backgroundColor: piece.color,
            borderRadius: piece.borderRadius,
          }}
        />
      ))}

      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <div className="bg-black/80 backdrop-blur-xl border border-white/20 rounded-3xl px-12 py-10 text-center shadow-2xl">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-black text-white mb-2">Funds Released!</h2>
          <p className="text-neutral-400">The escrow has been completed successfully.</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ConfettiSuccess({
  show,
  onClose,
}: {
  show: boolean;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {show && <ConfettiBurst onClose={onClose} />}
    </AnimatePresence>
  );
}
