import { cn, formatCurrency } from '@/lib/utils'
import { TrendingDown, TrendingUp, DollarSign, Building2 } from 'lucide-react'

type CardType = 'personal' | 'negocio' | 'total' | 'balance'

interface BalanceCardProps {
  titulo: string
  monto: string
  moneda: string
  tipo: CardType
}

const CARD_CONFIG: Record<
  CardType,
  {
    icon: React.ElementType
    colorClass: string
    iconBg: string
  }
> = {
  personal: {
    icon: TrendingDown,
    colorClass: 'text-[#DC2626]',
    iconBg: 'bg-red-50',
  },
  negocio: {
    icon: Building2,
    colorClass: 'text-[#DC2626]',
    iconBg: 'bg-red-50',
  },
  total: {
    icon: DollarSign,
    colorClass: 'text-[#2563EB]',
    iconBg: 'bg-blue-50',
  },
  balance: {
    icon: TrendingUp,
    colorClass: 'text-[#16A34A]',
    iconBg: 'bg-green-50',
  },
}

export function BalanceCard({ titulo, monto, moneda, tipo }: BalanceCardProps) {
  const { icon: Icon, colorClass, iconBg } = CARD_CONFIG[tipo]
  const num = parseFloat(monto)

  const displayColor =
    tipo === 'balance'
      ? num >= 0
        ? 'text-[#16A34A]'
        : 'text-[#DC2626]'
      : tipo === 'total' || tipo === 'personal' || tipo === 'negocio'
        ? num > 0
          ? 'text-[#DC2626]'
          : 'text-[#16A34A]'
        : colorClass

  return (
    <div className="bg-white border border-[#E4E4E7] rounded-xl p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#71717A] mb-2">{titulo}</p>
          <p
            className={cn(
              'font-bold text-[28px] leading-tight font-mono truncate',
              displayColor
            )}
          >
            {formatCurrency(monto, moneda)}
          </p>
        </div>
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', iconBg)}>
          <Icon className={cn('w-5 h-5', colorClass)} />
        </div>
      </div>
    </div>
  )
}

export function BalanceCardSkeleton() {
  return (
    <div className="bg-white border border-[#E4E4E7] rounded-xl p-6 shadow-sm animate-pulse">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="h-4 bg-zinc-100 rounded w-32 mb-3" />
          <div className="h-8 bg-zinc-100 rounded w-48" />
        </div>
        <div className="w-10 h-10 bg-zinc-100 rounded-lg flex-shrink-0" />
      </div>
    </div>
  )
}
