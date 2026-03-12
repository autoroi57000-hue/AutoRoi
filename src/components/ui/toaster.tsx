"use client"

import { useToast } from "@/hooks/use-toast"
import { X, CheckCircle, AlertCircle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

export function Toaster() {
  const { toasts, dismiss } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 w-full max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "flex items-start gap-3 rounded-xl border p-4 shadow-2xl backdrop-blur-xl animate-in slide-in-from-right-5 duration-300",
            toast.variant === "destructive"
              ? "bg-red-950/90 border-red-500/40 text-red-200"
              : toast.variant === "success"
              ? "bg-green-950/90 border-green-500/40 text-green-200"
              : "bg-ar-gray/95 border-ar-gold/20 text-white"
          )}
        >
          <div className="shrink-0 mt-0.5">
            {toast.variant === "destructive" ? (
              <AlertCircle className="h-5 w-5 text-red-400" />
            ) : toast.variant === "success" ? (
              <CheckCircle className="h-5 w-5 text-green-400" />
            ) : (
              <Info className="h-5 w-5 text-ar-gold" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            {toast.title && (
              <p className="font-semibold text-sm">{toast.title}</p>
            )}
            {toast.description && (
              <p className="text-sm opacity-80 mt-0.5">{toast.description}</p>
            )}
          </div>
          <button
            onClick={() => dismiss(toast.id)}
            className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
