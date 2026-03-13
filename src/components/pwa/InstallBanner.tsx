"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { X, Share, Download, Plus } from "lucide-react";

const STORAGE_KEY = "autoroi-pwa-install";
const COOLDOWN_DAYS = 7;
const MAX_DISMISSALS = 3;
const SCROLL_THRESHOLD = 300;

interface DeferredPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function getInstallState(): { dismissCount: number; lastDismissed: number } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return { dismissCount: 0, lastDismissed: 0 };
}

function saveInstallState(dismissCount: number) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ dismissCount, lastDismissed: Date.now() })
    );
  } catch {
    // ignore
  }
}

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && (navigator as unknown as { standalone: boolean }).standalone === true)
  );
}

export function InstallBanner() {
  const [visible, setVisible] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const deferredPrompt = useRef<DeferredPromptEvent | null>(null);
  const triggered = useRef(false);

  const tryShow = useCallback(() => {
    if (triggered.current) return;
    if (isStandalone()) return;

    const state = getInstallState();
    if (state.dismissCount >= MAX_DISMISSALS) return;
    if (
      state.lastDismissed &&
      Date.now() - state.lastDismissed < COOLDOWN_DAYS * 24 * 60 * 60 * 1000
    )
      return;

    // Only show if we have a deferred prompt (Android) or iOS
    if (!deferredPrompt.current && !isIOS()) return;

    triggered.current = true;
    setVisible(true);
  }, []);

  useEffect(() => {
    if (isStandalone()) return;

    // Listen for beforeinstallprompt (Android / Chrome)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e as DeferredPromptEvent;
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // Trigger banner after scroll threshold
    const handleScroll = () => {
      if (window.scrollY > SCROLL_THRESHOLD) {
        tryShow();
        window.removeEventListener("scroll", handleScroll);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    // Also trigger after 2 page views
    try {
      const views = parseInt(sessionStorage.getItem("autoroi-pv") || "0") + 1;
      sessionStorage.setItem("autoroi-pv", String(views));
      if (views >= 2) tryShow();
    } catch {
      // ignore
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [tryShow]);

  const handleInstall = async () => {
    if (deferredPrompt.current) {
      await deferredPrompt.current.prompt();
      const result = await deferredPrompt.current.userChoice;
      if (result.outcome === "accepted") {
        setVisible(false);
      }
      deferredPrompt.current = null;
    } else if (isIOS()) {
      setShowIOSGuide(true);
    }
  };

  const handleDismiss = () => {
    const state = getInstallState();
    saveInstallState(state.dismissCount + 1);
    setVisible(false);
    setShowIOSGuide(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-[9999] p-3 sm:p-4"
      style={{ pointerEvents: "none" }}
    >
      <div
        className="mx-auto max-w-md rounded-2xl p-4 shadow-2xl"
        style={{
          background: "rgba(20, 20, 20, 0.97)",
          border: "1px solid rgba(212, 175, 55, 0.3)",
          backdropFilter: "blur(20px)",
          pointerEvents: "auto",
        }}
      >
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute right-3 top-3 rounded-full p-1.5 transition-colors"
          style={{ color: "rgba(255,255,255,0.4)" }}
          aria-label="Fermer"
        >
          <X className="h-4 w-4" />
        </button>

        {showIOSGuide ? (
          /* iOS Guide */
          <div className="pr-6">
            <p className="mb-3 text-sm font-semibold text-white">
              Installer Auto Roi sur iOS
            </p>
            <ol className="space-y-2 text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
              <li className="flex items-start gap-2">
                <span
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                  style={{ background: "rgba(212,175,55,0.2)", color: "#D4AF37" }}
                >
                  1
                </span>
                <span>
                  Appuyez sur{" "}
                  <Share className="inline h-4 w-4" style={{ color: "#D4AF37" }} />{" "}
                  en bas de Safari
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                  style={{ background: "rgba(212,175,55,0.2)", color: "#D4AF37" }}
                >
                  2
                </span>
                <span>
                  Faites défiler et choisissez{" "}
                  <strong className="text-white">
                    <Plus className="inline h-3.5 w-3.5" /> Sur l&apos;écran d&apos;accueil
                  </strong>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                  style={{ background: "rgba(212,175,55,0.2)", color: "#D4AF37" }}
                >
                  3
                </span>
                <span>
                  Confirmez en appuyant sur <strong className="text-white">Ajouter</strong>
                </span>
              </li>
            </ol>
            <button
              onClick={handleDismiss}
              className="mt-3 w-full rounded-lg py-2.5 text-sm font-medium transition-colors"
              style={{
                background: "rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.6)",
              }}
            >
              Compris
            </button>
          </div>
        ) : (
          /* Default banner */
          <div className="flex items-start gap-3 pr-6">
            <img
              src="/icons/icon-96.png"
              alt="Auto Roi"
              className="h-12 w-12 shrink-0 rounded-xl"
            />
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">
                Installer Auto Roi
              </p>
              <p className="mt-0.5 text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                Accédez rapidement depuis votre écran d&apos;accueil
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={handleInstall}
                  className="flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-colors"
                  style={{ background: "#D4AF37", color: "#0a0a0a" }}
                >
                  <Download className="h-3.5 w-3.5" />
                  Installer
                </button>
                <button
                  onClick={handleDismiss}
                  className="rounded-full px-4 py-2 text-xs font-medium transition-colors"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.6)",
                  }}
                >
                  Plus tard
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
