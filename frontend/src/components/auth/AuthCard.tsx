"use client";

import Link from "next/link";
import { Boxes } from "lucide-react";

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: { text: string; linkText: string; href: string };
}

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-[420px] animate-fade-in-up">
        <div className="rounded-2xl p-8 bg-card border border-border/70 shadow-xl shadow-black/5">
          {/* Logo */}
          <div className="mb-7">
            <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center mb-5 shadow-md shadow-primary/20">
              <Boxes className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-1">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>

          {/* Content */}
          {children}

          {/* Footer */}
          {footer && (
            <p className="text-center mt-5 text-xs text-muted-foreground">
              {footer.text}{" "}
              <Link
                href={footer.href}
                className="font-semibold text-primary hover:text-primary-dark transition-colors"
              >
                {footer.linkText}
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
