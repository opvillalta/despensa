import { useState } from 'react'
import { useAuth } from '../../auth/hooks/useAuth'
import { Button } from '../../../components/Button'
import { Input } from '../../../components/Input'
import { es } from '../../../i18n/es'

export function SettingsPage() {
  const { logout, user } = useAuth()
  const [warningDays, setWarningDays] = useState(3)
  const [saved, setSaved] = useState(false)

  function handleSave() {
    // Persiste temporalmente en localStorage si aún no hay backend
    localStorage.setItem('despensa_warning_days', String(warningDays))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="pt-2">
        <h1 className="text-2xl font-bold text-zinc-900">{es.settings.title}</h1>
      </header>

      {/* Info Cuenta */}
      <section className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs flex flex-col gap-1">
        <span className="text-xs font-semibold text-zinc-400">Sesión actual</span>
        <span className="text-sm font-bold text-zinc-800">{user?.email || 'usuario@despensa.app'}</span>
      </section>

      {/* Parámetros de Alerta */}
      <section className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs flex flex-col gap-3">
        <h2 className="text-sm font-bold text-zinc-800">{es.settings.warningDays}</h2>
        <p className="text-xs text-zinc-500">{es.settings.warningDaysHint}</p>

        <div className="flex items-center gap-3">
          <Input
            type="number"
            min={1}
            max={30}
            value={warningDays}
            onChange={(e) => setWarningDays(Number(e.target.value))}
            className="w-24 text-center font-bold text-lg"
          />
          <span className="text-sm font-medium text-zinc-600">días antes</span>
        </div>

        <Button variant="secondary" onClick={handleSave} className="w-full mt-2">
          {saved ? es.settings.saved : es.actions.save}
        </Button>
      </section>

      {/* Cerrar Sesión */}
      <section className="mt-4">
        <Button variant="danger" onClick={() => logout()} className="w-full">
          🚪 {es.auth.logout}
        </Button>
      </section>
    </div>
  )
}
