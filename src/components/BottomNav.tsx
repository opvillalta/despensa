import { NavLink } from 'react-router-dom'
import { es } from '../i18n/es'

export function BottomNav() {
  const links = [
    { to: '/', label: es.nav.home, icon: '🏠' },
    { to: '/inventario', label: es.nav.inventory, icon: '📦' },
    { to: '/compras', label: es.nav.shopping, icon: '🛒' },
    { to: '/ajustes', label: es.nav.settings, icon: '⚙️' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-zinc-200 px-4 py-1 pb-safe">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center min-w-[56px] min-h-[50px] rounded-lg transition-colors text-xs font-medium ${
                isActive
                  ? 'text-emerald-700 font-bold'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`
            }
          >
            <span className="text-xl mb-0.5" aria-hidden="true">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
