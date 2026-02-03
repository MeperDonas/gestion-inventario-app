"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
}

const sizes = {
  sm: "max-w-md",
  md: "max-w-2xl",
  lg: "max-w-4xl",
  xl: "max-w-6xl",
  "2xl": "max-w-7xl",
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`
          relative bg-card rounded-2xl shadow-2xl w-full
          ${sizes[size]}
          border border-border
        `}
      >
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-border">
            {title && (
              <h2 className="text-xl font-semibold text-foreground">{title}</h2>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-terracotta/10 transition-colors"
            >
              <X className="w-5 h-5 text-foreground" />
            </button>
          </div>
        )}
        <div className="p-6 max-h-[70vh] overflow-y-auto scrollbar-hide">
          {children}
        </div>
      </div>
    </div>
  );
}
