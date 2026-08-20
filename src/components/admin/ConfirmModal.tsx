'use client';

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  warningNotice?: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  warningNotice,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDanger = true,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-emerald-950 border-2 border-emerald-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 text-center relative overflow-hidden">
        
        {/* Top Warning Icon */}
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto ${
          isDanger ? 'bg-red-500/20 border border-red-500/40 text-red-400' : 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
        }`}>
          <AlertTriangle className="w-7 h-7" />
        </div>

        {/* Modal Text Header */}
        <div className="space-y-2">
          <h3 className="text-xl font-black text-emerald-100">{title}</h3>
          <p className="text-xs text-emerald-300/80 leading-relaxed">{message}</p>
        </div>

        {/* Optional Warning Notice Banner */}
        {warningNotice && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs font-semibold text-left flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{warningNotice}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl bg-emerald-900/60 hover:bg-emerald-900 border border-emerald-800 text-emerald-200 text-xs font-bold transition-all"
          >
            {cancelText}
          </button>
          
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 py-3 rounded-2xl font-extrabold text-xs transition-all shadow-lg ${
              isDanger
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/20'
                : 'bg-amber-500 hover:bg-amber-400 text-emerald-950 shadow-amber-500/20'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
