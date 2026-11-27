import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../../../components/Button'
import { Input } from '../../../components/Input'
import { es } from '../../../i18n/es'

export function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError(es.auth.errors.passwordTooShort)
      return
    }

    if (password !== confirmPassword) {
      setError(es.auth.errors.passwordMismatch)
      return
    }

    setSubmitting(true)
    const { data, error } = await register(email, password)
    setSubmitting(false)

    if (error) {
      setError(error.message || es.auth.errors.generic)
    } else if (data?.user && !data.session) {
      // Supabase tiene confirmación de email activada por defecto
      setError('¡Cuenta creada! Por favor revisá tu correo y confirmá el enlace antes de iniciar sesión (o desactivá "Confirm email" en Supabase).')
    } else {
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center px-4 max-w-sm mx-auto">
      <div className="text-center mb-8">
        <span className="text-4xl">📦</span>
        <h1 className="text-2xl font-bold mt-2 text-zinc-900">{es.auth.registerTitle}</h1>
        <p className="text-sm text-zinc-500 mt-1">{es.auth.registerSubtitle}</p>
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

        <Input
          type="password"
          label={es.auth.confirmPassword}
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <Button type="submit" disabled={submitting} className="w-full mt-2">
          {submitting ? es.errors.loading : es.auth.register}
        </Button>
      </form>

      <p className="text-center text-sm text-zinc-600 mt-6">
        {es.auth.hasAccount}{' '}
        <Link to="/login" className="text-emerald-700 font-semibold hover:underline">
          {es.auth.login}
        </Link>
      </p>
    </div>
  )
}
