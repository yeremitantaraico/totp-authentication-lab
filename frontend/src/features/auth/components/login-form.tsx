import { useState } from 'react';
import type { FormEvent } from 'react';

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  isSubmitting: boolean;
}

export function LoginForm({ onSubmit, isSubmitting }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(email, password);
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <label className="field">
        <span className="field-label">Correo electrónico</span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          placeholder="tu@correo.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </label>

      <label className="field">
        <span className="field-label">Contraseña</span>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          placeholder="Ingresa tu contraseña"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={8}
        />
      </label>

      <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Ingresando...' : 'Ingresar'}
      </button>
    </form>
  );
}
