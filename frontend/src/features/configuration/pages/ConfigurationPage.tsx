import { Link } from 'react-router-dom';
import { useAuth } from '../../../shared/context/auth-context';
import { AppPageLayout } from '../../../shared/components/app-page-layout';
import { PageHeader } from '../../../shared/components/page-header';
import { TotpSettings } from '../components/totp-settings';
import { usePageTitle } from '../../../shared/hooks/use-page-title';

export function ConfigurationPage() {
  usePageTitle('Configuration');
  const { user, updateUser } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <AppPageLayout size="lg">
      <PageHeader
        eyebrow="Seguridad de la cuenta"
        title="Configuración"
        subtitle="Gestiona la autenticación de dos factores (TOTP)."
        badge="2FA"
        action={
          <Link className="btn btn-outline" to="/home">
            Volver al inicio
          </Link>
        }
      />

      <TotpSettings user={user} onUserUpdate={updateUser} />
    </AppPageLayout>
  );
}
