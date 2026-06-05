import { useState } from 'react';
import type { FormEvent } from 'react';
import * as authApi from '../../auth/api/auth-api';
import type { PublicUser } from '../../auth/types/auth.types';

interface TotpSettingsProps {
  user: PublicUser;
  onUserUpdate: (user: PublicUser) => void;
}

export function TotpSettings({ user, onUserUpdate }: TotpSettingsProps) {
  const [accountName, setAccountName] = useState(user.fullName);
  const [issuerPreview, setIssuerPreview] = useState('TOTP Authentication Lab');
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [manualKey, setManualKey] = useState('');
  const [enableCode, setEnableCode] = useState('');
  const [disablePassword, setDisablePassword] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const trimmedAccountName = accountName.trim();
  const displayPreview = trimmedAccountName
    ? `${issuerPreview} · ${trimmedAccountName}`
    : '';

  const handleSetup = async () => {
    if (!trimmedAccountName) {
      setError('Ingresa un nombre para mostrar en la app de autenticación.');
      return;
    }

    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      const result = await authApi.setupTotp(trimmedAccountName);
      setQrDataUrl(result.qrDataUrl);
      setManualKey(result.manualEntryKey);
      setIssuerPreview(result.issuer);
      setAccountName(result.accountName);
      setMessage(
        `Escanea el código QR. En tu app aparecerá como "${result.issuer} · ${result.accountName}".`,
      );
    } catch (setupError) {
      setError(
        setupError instanceof Error
          ? setupError.message
          : 'No se pudo generar el código QR',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnable = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      const result = await authApi.enableTotp(enableCode);
      onUserUpdate(result.user);
      setQrDataUrl(null);
      setManualKey('');
      setEnableCode('');
      setMessage('Autenticación de dos factores habilitada correctamente.');
    } catch (enableError) {
      setError(
        enableError instanceof Error
          ? enableError.message
          : 'No se pudo habilitar TOTP',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      const result = await authApi.disableTotp(disablePassword, disableCode);
      onUserUpdate(result.user);
      setDisablePassword('');
      setDisableCode('');
      setAccountName(result.user.fullName);
      setMessage('Autenticación de dos factores deshabilitada.');
    } catch (disableError) {
      setError(
        disableError instanceof Error
          ? disableError.message
          : 'No se pudo deshabilitar TOTP',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-body">
      <div className="status-card">
        <div>
          <p className="status-card__label">Estado actual</p>
          <p className="status-card__hint">
            {user.totpEnabled
              ? `Cuenta protegida con 2FA${user.totpAccountName ? ` como "${user.totpAccountName}"` : ''}.`
              : 'Tu cuenta solo usa correo y contraseña por ahora.'}
          </p>
        </div>
        <span
          className={`status-badge ${
            user.totpEnabled ? 'status-badge--on' : 'status-badge--off'
          }`}
        >
          {user.totpEnabled ? 'Habilitado' : 'Deshabilitado'}
        </span>
      </div>

      {message && <p className="alert alert--success">{message}</p>}
      {error && <p className="alert alert--error">{error}</p>}

      {!user.totpEnabled ? (
        <>
          <div className="callout callout--info">
            <p className="callout__title">Cómo habilitar 2FA</p>
            <ol className="steps-list">
              <li>Define el nombre que verás en tu app de autenticación.</li>
              <li>Genera y escanea el código QR.</li>
              <li>Ingresa el código de 6 dígitos para confirmar.</li>
            </ol>
          </div>

          <div className="app-form">
            <label className="field">
              <span className="field-label">Nombre en la app de autenticación</span>
              <input
                type="text"
                placeholder="Ej. Yeremi - Lab TOTP"
                value={accountName}
                onChange={(event) => setAccountName(event.target.value)}
                maxLength={64}
                disabled={isLoading}
              />
            </label>

            {displayPreview && (
              <p className="totp-preview">
                Vista previa: <strong>{displayPreview}</strong>
              </p>
            )}

            <button
              className="btn btn-primary"
              type="button"
              onClick={handleSetup}
              disabled={isLoading || !trimmedAccountName}
            >
              {isLoading ? 'Generando...' : 'Generar código QR'}
            </button>
          </div>

          {qrDataUrl && (
            <div className="qr-panel">
              <div className="qr-panel__image-wrap">
                <img src={qrDataUrl} alt="Código QR para TOTP" />
              </div>

              <div className="manual-key">
                <span className="manual-key__label">Clave manual</span>
                <code>{manualKey}</code>
              </div>

              <form className="app-form" onSubmit={handleEnable}>
                <label className="field">
                  <span className="field-label">Código de verificación</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    placeholder="000000"
                    value={enableCode}
                    onChange={(event) =>
                      setEnableCode(event.target.value.replace(/\D/g, ''))
                    }
                    required
                  />
                </label>
                <button className="btn btn-primary" type="submit" disabled={isLoading}>
                  {isLoading ? 'Habilitando...' : 'Habilitar 2FA'}
                </button>
              </form>
            </div>
          )}
        </>
      ) : (
        <form className="app-form callout callout--danger" onSubmit={handleDisable}>
          <p className="callout__title">Deshabilitar autenticación</p>
          <p>
            Para deshabilitar 2FA confirma tu contraseña y un código TOTP válido.
          </p>

          <label className="field">
            <span className="field-label">Contraseña</span>
            <input
              type="password"
              placeholder="Ingresa tu contraseña"
              value={disablePassword}
              onChange={(event) => setDisablePassword(event.target.value)}
              required
              minLength={8}
            />
          </label>

          <label className="field">
            <span className="field-label">Código TOTP</span>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              placeholder="000000"
              value={disableCode}
              onChange={(event) =>
                setDisableCode(event.target.value.replace(/\D/g, ''))
              }
              required
            />
          </label>

          <button className="btn btn-danger" type="submit" disabled={isLoading}>
            {isLoading ? 'Deshabilitando...' : 'Deshabilitar 2FA'}
          </button>
        </form>
      )}
    </div>
  );
}
