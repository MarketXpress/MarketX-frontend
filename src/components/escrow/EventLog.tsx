"use client";

import { motion } from "framer-motion";
import { EscrowEvent } from "@/lib/escrowData";
import { User, Bot, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

interface EventLogProps {
  events: EscrowEvent[];
}

export default function EventLog({ events }: EventLogProps) {
  const actorIcon = (actor: EscrowEvent["actor"]) => {
    switch (actor) {
      case "buyer": return <User className="w-4 h-4" />;
      case "seller": return <ShoppingBag className="w-4 h-4" />;
      case "system": return <Bot className="w-4 h-4" />;
    }
  };

  const actorColor = (actor: EscrowEvent["actor"]) => {
    switch (actor) {
      case "buyer": return "text-cyan-400 bg-cyan-500/10 border-cyan-500/20";
      case "seller": return "text-purple-400 bg-purple-500/10 border-purple-500/20";
      case "system": return "text-neutral-400 bg-white/5 border-white/10";
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-black text-neutral-500 uppercase tracking-widest">Transaction Log</h3>
      <div className="space-y-3">
        {events.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            className="flex gap-4 items-start"
          >
            <div className={cn(
              "w-8 h-8 rounded-full border flex items-center justify-center shrink-0",
              actorColor(event.actor)
            )}>
              {actorIcon(event.actor)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-white">{event.label}</span>
                <span className="text-[10px] text-neutral-600 font-mono whitespace-nowrap">
                  {new Date(event.timestamp).toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">{event.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
