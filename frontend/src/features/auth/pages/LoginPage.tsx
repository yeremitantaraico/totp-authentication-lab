import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/context/auth-context';
import { usePageTitle } from '../../../shared/hooks/use-page-title';
import { LoginForm } from '../components/login-form';
import { TotpVerifyForm } from '../components/totp-verify-form';
import './login.css';

export function LoginPage() {
  usePageTitle('Login');
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, login, verifyTotp } = useAuth();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tempToken, setTempToken] = useState<string | null>(null);

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  const handleLogin = async (email: string, password: string) => {
    setError('');
    setIsSubmitting(true);

    try {
      const result = await login(email, password);

      if (result.requiresTotp && result.tempToken) {
        setTempToken(result.tempToken);
        return;
      }

      navigate('/home');
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : 'No se pudo iniciar sesión',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyTotp = async (code: string) => {
    if (!tempToken) {
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await verifyTotp(tempToken, code);
      navigate('/home');
    } catch (verifyError) {
      setError(
        verifyError instanceof Error
          ? verifyError.message
          : 'Código TOTP inválido',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-page__glow login-page__glow--left" aria-hidden="true" />
      <div className="login-page__glow login-page__glow--right" aria-hidden="true" />

      <section className="login-card">
        <header className="login-card__header">
          <div className="login-card__badge" aria-hidden="true">
            TOTP
          </div>
          <div>
            <h1>Iniciar sesión</h1>
            <p className="login-subtitle">TOTP Authentication Lab</p>
          </div>
        </header>

        {error && <p className="form-error">{error}</p>}

        {tempToken ? (
          <TotpVerifyForm
            onSubmit={handleVerifyTotp}
            onCancel={() => {
              setTempToken(null);
              setError('');
            }}
            isSubmitting={isSubmitting}
          />
        ) : (
          <LoginForm onSubmit={handleLogin} isSubmitting={isSubmitting} />
        )}
      </section>
    </main>
  );
}
