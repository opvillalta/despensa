import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UtensilsCrossed } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../../../components/Button'
import { Input } from '../../../components/Input'
import { es } from '../../../i18n/es'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const { error } = await login(email, password)
    setSubmitting(false)

    if (error) {
      if (error.message.includes('Email not confirmed')) {
        setError('El correo aún no ha sido confirmado. Revisá tu bandeja de entrada o desactivá "Confirm email" en el dashboard de Supabase.')
      } else {
        setError(error.message || es.auth.errors.invalidCredentials)
      }
    } else {
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center px-4 max-w-sm mx-auto">
      <div className="text-center mb-8 flex flex-col items-center">
        <div className="w-14 h-14 rounded-2xl bg-[#f0f6f2] border border-[#cbe0d3] flex items-center justify-center text-[#2d5a3f] mb-3 shadow-xs">
          <UtensilsCrossed className="w-7 h-7" strokeWidth={2} />
        </div>
        <h1 className="text-2xl font-bold text-[#23221e]">{es.auth.loginTitle}</h1>
        <p className="text-sm text-[#747065] mt-1">{es.auth.loginSubtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
        {error && (
          <div className="p-3 text-sm rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
            {error}
          </div>
        )}

        <Input
          type="email"
          label={es.auth.email}
          placeholder="tu@correo.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          type="password"
          label={es.auth.password}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button type="submit" disabled={submitting} className="w-full mt-2">
          {submitting ? es.errors.loading : es.auth.login}
        </Button>
      </form>

      <p className="text-center text-sm text-zinc-600 mt-6">
        {es.auth.noAccount}{' '}
        <Link to="/registro" className="text-emerald-700 font-semibold hover:underline">
          {es.auth.register}
        </Link>
      </p>
    </div>
  )
}
