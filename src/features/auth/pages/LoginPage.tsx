import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { UtensilsCrossed, Mail, ArrowLeft, KeyRound } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../../../components/Button'
import { Input } from '../../../components/Input'
import { es } from '../../../i18n/es'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(false)
  const { sendOtp, verifyOtp } = useAuth()
  const navigate = useNavigate()

  async function handleSendEmail(e: FormEvent) {
    e.preventDefault()
    if (!email.trim()) return

    setError(null)
    setSubmitting(true)

    const { error: otpError } = await sendOtp(email.trim())
    setSubmitting(false)

    if (otpError) {
      setError(otpError.message || es.auth.errors.generic)
    } else {
      setStep('otp')
      triggerCooldown()
    }
  }

  async function handleVerifyOtp(e: FormEvent) {
    e.preventDefault()
    if (!token.trim()) return

    setError(null)
    setSubmitting(true)

    const { error: verifyError } = await verifyOtp(email.trim(), token.trim())
    setSubmitting(false)

    if (verifyError) {
      setError(es.auth.errors.invalidOtp)
    } else {
      navigate('/')
    }
  }

  function triggerCooldown() {
    setResendCooldown(true)
    setTimeout(() => {
      setResendCooldown(false)
    }, 30000)
  }

  async function handleResend() {
    if (resendCooldown || submitting) return
    setError(null)
    setSubmitting(true)
    const { error: otpError } = await sendOtp(email.trim())
    setSubmitting(false)
    if (otpError) {
      setError(otpError.message || es.auth.errors.generic)
    } else {
      triggerCooldown()
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center px-4 max-w-sm mx-auto">
      <div className="text-center mb-8 flex flex-col items-center">
        <div className="w-14 h-14 rounded-2xl bg-[#f0f6f2] border border-[#cbe0d3] flex items-center justify-center text-[#2d5a3f] mb-3 shadow-xs">
          {step === 'email' ? (
            <UtensilsCrossed className="w-7 h-7" strokeWidth={2} />
          ) : (
            <KeyRound className="w-7 h-7" strokeWidth={2} />
          )}
        </div>
        <h1 className="text-2xl font-bold text-[#23221e]">
          {step === 'email' ? es.auth.loginTitle : es.auth.otpTitle}
        </h1>
        <p className="text-sm text-[#747065] mt-1">
          {step === 'email' ? (
            es.auth.loginSubtitle
          ) : (
            <>
              {es.auth.otpSubtitle} <strong className="text-foreground">{email}</strong>
            </>
          )}
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200 flex flex-col gap-4">
        {error && (
          <div className="p-3 text-sm rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
            {error}
          </div>
        )}

        {step === 'email' ? (
          <form onSubmit={handleSendEmail} className="flex flex-col gap-4">
            <Input
              type="email"
              label={es.auth.email}
              placeholder="tu@correo.com"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Button type="submit" disabled={submitting} className="w-full mt-1">
              {submitting ? es.errors.loading : es.auth.sendOtp}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
            <div>
              <Input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]*"
                maxLength={8}
                label={es.auth.otpLabel}
                placeholder="123456"
                required
                autoFocus
                className="text-center tracking-widest text-lg font-mono"
                value={token}
                onChange={(e) => setToken(e.target.value.replace(/\s+/g, ''))}
              />
            </div>

            <Button type="submit" disabled={submitting || token.length < 6} className="w-full mt-1">
              {submitting ? es.errors.loading : es.auth.verifyOtp}
            </Button>

            <div className="flex flex-col gap-2 pt-2 border-t border-zinc-100 text-center">
              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown || submitting}
                className="text-xs text-primary font-medium hover:underline disabled:opacity-50 disabled:no-underline"
              >
                {resendCooldown ? 'Esperá 30s para reenviar' : es.auth.resendOtp}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('email')
                  setToken('')
                  setError(null)
                }}
                className="inline-flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mt-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{es.auth.changeEmail}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="text-center mt-6 text-xs text-muted-foreground flex items-center justify-center gap-1.5">
        <Mail className="w-4 h-4 text-primary" />
        <span>Sin contraseñas. Seguro y directo a tu bandeja de entrada.</span>
      </div>
    </div>
  )
}
