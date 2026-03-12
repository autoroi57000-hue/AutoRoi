"use client"

import Link from "next/link"
import { Search, ArrowLeft, Home } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-ar-dark flex items-center justify-center px-4">
      <div className="text-center max-w-md mx-auto">
        {/* Logo / marque */}
        <div className="mb-8 flex justify-center">
          <div
            className="text-4xl font-black tracking-widest"
            style={{
              background: "linear-gradient(135deg, #C9A84C, #e0c068, #C9A84C)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            AUTO ROI
          </div>
        </div>

        {/* Code 404 */}
        <div
          className="text-[120px] font-black leading-none mb-4 select-none"
          style={{
            background: "linear-gradient(180deg, rgba(201,168,76,0.4) 0%, rgba(201,168,76,0.05) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          404
        </div>

        {/* Message */}
        <h1 className="text-2xl font-bold text-white mb-3">
          Page introuvable
        </h1>
        <p className="text-gray-400 mb-8 text-sm leading-relaxed">
          Cette page n&apos;existe pas ou a été déplacée.<br />
          Le véhicule que vous cherchez est peut-être vendu ou son URL a changé.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/">
            <Button
              className="group relative overflow-hidden bg-gradient-to-r from-ar-gold to-ar-gold-light text-ar-black font-bold shadow-lg shadow-ar-gold/20 hover:shadow-xl hover:shadow-ar-gold/30 hover:-translate-y-0.5 transition-all duration-300 w-full sm:w-auto"
            >
              <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <Home className="relative h-4 w-4 mr-2" />
              <span className="relative">Accueil</span>
            </Button>
          </Link>
          <Link href="/fr/vehicules">
            <Button
              variant="outline"
              className="border-ar-gold/30 text-ar-gold hover:bg-ar-gold/10 hover:border-ar-gold/50 w-full sm:w-auto"
            >
              <Search className="h-4 w-4 mr-2" />
              Voir les annonces
            </Button>
          </Link>
        </div>

        {/* Retour */}
        <button
          onClick={() => window.history.back()}
          className="mt-6 flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-400 transition-colors mx-auto"
        >
          <ArrowLeft className="h-3 w-3" />
          Retour à la page précédente
        </button>
      </div>
    </div>
  )
}
