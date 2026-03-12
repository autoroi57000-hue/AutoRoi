import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface AuthLayoutProps {
  children: ReactNode
  params: { locale: string }
}

export default function AuthLayout({ children, params }: AuthLayoutProps) {
  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-12"
      style={{ background: '#070707' }}
    >
      {/* Orb 1 — top-left gold */}
      <div
        className="pointer-events-none absolute"
        style={{
          top: '-10%',
          left: '-10%',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(201,168,76,0.13) 0%, transparent 70%)',
          animation: 'float-1 8s ease-in-out infinite',
        }}
      />

      {/* Orb 2 — bottom-right dark gold */}
      <div
        className="pointer-events-none absolute"
        style={{
          bottom: '-10%',
          right: '-5%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(184,151,42,0.10) 0%, transparent 70%)',
          animation: 'float-2 12s ease-in-out infinite',
          animationDelay: '-4s',
        }}
      />

      {/* Orb 3 — centre subtle white */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div
          style={{
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.025) 0%, transparent 70%)',
            animation: 'orb-pulse 6s ease-in-out infinite',
          }}
        />
      </div>


      <div className="relative z-10 flex w-full max-w-[420px] flex-col items-center">
        {/* Logo */}
        <Link href={`/${params.locale}`} className="mb-10 block">
          <div className="flex flex-col items-center gap-4">
            <div
              className="anim-logo relative h-20 w-20 overflow-hidden rounded-full"
              style={{
                border: '1.5px solid rgba(201,168,76,0.4)',
                boxShadow: '0 0 30px rgba(201,168,76,0.2), 0 0 60px rgba(201,168,76,0.08)',
                filter: 'drop-shadow(0 0 18px rgba(201,168,76,0.35))',
              }}
            >
              <Image
                src="/logo1.png"
                alt="Auto Roi"
                fill
                className="object-cover"
                priority
              />
            </div>
            <span
              className="anim-title auth-title-shimmer font-display text-3xl font-bold"
              style={{ letterSpacing: '0.35em' }}
            >
              AUTO ROI
            </span>
          </div>
        </Link>

        {children}

        <p
          className="mt-8 text-center text-xs"
          style={{ color: 'rgba(255,255,255,0.2)' }}
        >
          © {new Date().getFullYear()} Auto Roi — Accès réservé aux professionnels
        </p>
      </div>
    </div>
  )
}
