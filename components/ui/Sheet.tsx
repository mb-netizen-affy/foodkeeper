"use client";

// Panneau qui monte du bas (mobile) / fenêtre centrée (desktop).

import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
};

export default function Sheet({ open, onClose, title, children }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={title}>
          <motion.button
            type="button"
            aria-label="Fermer"
            className="absolute inset-0 bg-deep/45"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="relative max-h-[88dvh] w-full overflow-y-auto rounded-t-[1.75rem] border-2 border-b-0 border-choco bg-paper p-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] sm:max-w-md sm:rounded-[1.75rem] sm:border-b-2 sm:shadow-brut-lg"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 420, damping: 38 }}
          >
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-choco/25 sm:hidden" />
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="truncate text-xl font-extrabold tracking-tight">{title}</h2>
              <button type="button" onClick={onClose} className="fk-icon-btn" aria-label="Fermer">
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
