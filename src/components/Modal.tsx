"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 z-50 m-auto max-h-[90vh] w-[min(32rem,calc(100%-2rem))] max-w-lg overflow-y-auto rounded-xl border border-silver/30 bg-surface-navy p-0 text-text-primary shadow-xl backdrop:bg-bg-deep/80 open:flex open:flex-col"
      onClose={onClose}
      aria-labelledby="modal-title"
    >
      <div className="flex items-center justify-between border-b border-silver/20 px-5 py-4">
        <h2 id="modal-title" className="font-display text-xl font-semibold">
          {title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-2 text-text-muted hover:bg-bg-deep hover:text-text-primary"
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>
      </div>
      <div className="px-5 py-5">{children}</div>
    </dialog>
  );
}
