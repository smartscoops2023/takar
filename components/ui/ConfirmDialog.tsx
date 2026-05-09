"use client";

import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Hapus",
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
        onClick={onCancel}
        aria-hidden="true"
      />
      <div
        role="alertdialog"
        aria-modal="true"
        className="fixed z-50 bg-white rounded-2xl shadow-2xl p-5 w-[calc(100%-2rem)] max-w-sm
          left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={20} className="text-red-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-stone-800">{title}</h3>
            <p className="text-sm text-stone-500 mt-1 leading-relaxed">{message}</p>
          </div>
          <button
            onClick={onCancel}
            className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 hover:bg-stone-200 flex-shrink-0"
            aria-label="Tutup"
          >
            <X size={14} />
          </button>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" fullWidth onClick={onCancel} disabled={loading}>
            Batal
          </Button>
          <Button variant="danger" fullWidth onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </>
  );
}
