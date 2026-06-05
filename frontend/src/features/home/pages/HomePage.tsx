import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as authApi from '../../auth/api/auth-api';
import { useAuth } from '../../../shared/context/auth-context';
import { AppPageLayout } from '../../../shared/components/app-page-layout';
import { PageHeader } from '../../../shared/components/page-header';
import { usePageTitle } from '../../../shared/hooks/use-page-title';

function getInitials(fullName: string): string {
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function HomePage() {
  usePageTitle('Home');
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const [isDismissing, setIsDismissing] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDismissPrompt = async () => {
    setIsDismissing(true);
    try {
      const result = await authApi.dismissTotpPrompt();
      updateUser(result.user);
    } finally {
      setIsDismissing(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <AppPageLayout size="md">
      <PageHeader
        eyebrow="Sesión activa"
        title={`Bienvenido, ${user.fullName}`}
        subtitle="Has iniciado sesión correctamente en el laboratorio de autenticación TOTP."
        badge={getInitials(user.fullName)}
        badgeVariant="initials"
      />

      <div className="page-body">
        <div className="info-list">
          <article className="info-row">
            <span className="info-row__label">Correo</span>
            <span className="info-row__value">{user.email}</span>
          </article>
          <article className="info-row">
            <span className="info-row__label">Rol</span>
            <span className="info-row__value">{user.role}</span>
          </article>
          <article className="info-row">
            <span className="info-row__label">2FA</span>
            <span
              className={`status-badge ${
                user.totpEnabled ? 'status-badge--on' : 'status-badge--off'
              }`}
            >
              {user.totpEnabled ? 'Habilitado' : 'Deshabilitado'}
            </span>
          </article>
        </div>

        {user.showTotpSetupPrompt && (
          <div className="callout callout--warning">
            <p className="callout__title">Protege tu cuenta</p>
            <p>
              ¿Deseas habilitar la autenticación de dos factores? Puedes
              configurarla ahora o más tarde desde la sección de configuración.
            </p>
            <div className="page-actions">
              <Link className="btn btn-primary" to="/configuration">
                Habilitar 2FA
              </Link>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleDismissPrompt}
                disabled={isDismissing}
              >
                {isDismissing ? 'Guardando...' : 'Ahora no'}
              </button>
            </div>
          </div>
        )}

        <div className="page-actions page-actions--footer">
          <Link className="btn btn-outline" to="/configuration">
            Configuración
          </Link>
          <button className="btn btn-danger" type="button" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </div>
    </AppPageLayout>
  );
}
