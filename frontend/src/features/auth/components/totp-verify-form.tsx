import { useState } from 'react';
import type { FormEvent } from 'react';

interface TotpVerifyFormProps {
  onSubmit: (code: string) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function TotpVerifyForm({
  onSubmit,
  onCancel,
  isSubmitting,
}: TotpVerifyFormProps) {
  const [code, setCode] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(code);
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <p className="form-hint">
        Ingresa el código de 6 dígitos de tu aplicación de autenticación.
      </p>

      <label className="field">
        <span className="field-label">Código TOTP</span>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          placeholder="000000"
          value={code}
          onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
          required
        />
      </label>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Volver
        </button>
        <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Verificando...' : 'Verificar'}
        </button>
      </div>
    </form>
  );
}
