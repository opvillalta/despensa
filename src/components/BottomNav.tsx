import { NavLink } from 'react-router-dom'
import { Home, Package, ShoppingCart, Settings } from 'lucide-react'
import { es } from '../i18n/es'

export function BottomNav() {
  const links = [
    { to: '/', label: es.nav.home, Icon: Home },
    { to: '/inventario', label: es.nav.inventory, Icon: Package },
    { to: '/compras', label: es.nav.shopping, Icon: ShoppingCart },
    { to: '/ajustes', label: es.nav.settings, Icon: Settings },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/85 backdrop-blur-md border-t border-border px-3 pt-2 pb-safe">
      <div className="max-w-md mx-auto grid grid-cols-4 gap-1.5 p-1 rounded-2xl bg-secondary/60 border border-border shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        {links.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `relative flex flex-col items-center justify-center min-h-[52px] py-1.5 px-1 rounded-xl transition-[transform,background-color,color,box-shadow] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.94] ${
                isActive
                  ? 'bg-card text-emerald-600 font-bold shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-card/50 font-medium'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={`flex items-center justify-center w-7 h-7 rounded-lg mb-0.5 transition-[transform,background-color] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                    isActive ? 'bg-accent scale-105' : 'bg-transparent scale-100'
                  }`}
                >
                  <Icon
                    className="w-4.5 h-4.5"
                    strokeWidth={isActive ? 2.4 : 1.9}
                    aria-hidden="true"
                  />
                </div>
                <span className="text-[11px] leading-tight tracking-tight">{label}</span>
                {isActive && (
                  <span
                    className="absolute -bottom-0.5 w-3 h-0.5 rounded-full bg-primary"
                    aria-hidden="true"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
