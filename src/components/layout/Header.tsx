'use client'

import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/movimientos': 'Historial de Movimientos',
  '/nuevo': 'Nuevo Movimiento',
  '/configuracion': 'Configuración',
}

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname()
  const title = PAGE_TITLES[pathname] ?? 'Debt Tracker'

  return (
    <header className="h-14 bg-white border-b border-[#E4E4E7] flex items-center px-4 lg:px-6 gap-4 flex-shrink-0">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-1.5 rounded-lg hover:bg-zinc-100 transition-colors"
        aria-label="Abrir menú"
      >
        <Menu className="w-5 h-5 text-[#71717A]" />
      </button>
      <h1 className="font-semibold text-[#09090B] text-base">{title}</h1>
    </header>
  )
}
