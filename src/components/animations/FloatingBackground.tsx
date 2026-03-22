"use client";

import { motion } from "framer-motion";

export default function FloatingBackground() {
  const shapes = [
    { size: "w-64 h-64", color: "bg-blue-500/5", top: "10%", left: "5%", delay: 0 },
    { size: "w-96 h-96", color: "bg-purple-500/5", bottom: "20%", right: "10%", delay: 2 },
    { size: "w-48 h-48", color: "bg-blue-400/5", top: "40%", left: "60%", delay: 1 },
    { size: "w-72 h-72", color: "bg-purple-400/5", top: "15%", right: "25%", delay: 3 },
  ];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {shapes.map((shape, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -30, 0],
            x: [0, 20, 0],
            rotate: [0, 45, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: shape.delay,
          }}
          className={`absolute rounded-[4rem] blur-[100px] ${shape.size} ${shape.color} ${
            shape.top ? `top-[${shape.top}]` : ""
          } ${shape.left ? `left-[${shape.left}]` : ""} ${
            shape.bottom ? `bottom-[${shape.bottom}]` : ""
          } ${shape.right ? `right-[${shape.right}]` : ""}`}
          style={{
            top: shape.top,
            left: shape.left,
            bottom: shape.bottom,
            right: shape.right,
          }}
        />
      ))}
    </div>
  );
}
