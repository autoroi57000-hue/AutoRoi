// Ce layout est un pass-through — la protection et la composition
// sont gérées dans (admin)/admin/layout.tsx
import type { ReactNode } from 'react'

export default function AdminGroupLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
