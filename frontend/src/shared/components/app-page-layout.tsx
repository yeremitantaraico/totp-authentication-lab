import type { ReactNode } from 'react';

interface AppPageLayoutProps {
  children: ReactNode;
  size?: 'md' | 'lg';
}

export function AppPageLayout({ children, size = 'md' }: AppPageLayoutProps) {
  return (
    <main className="app-page">
      <div className="app-page__glow app-page__glow--left" aria-hidden="true" />
      <div className="app-page__glow app-page__glow--right" aria-hidden="true" />
      <section className={`app-card app-card--${size}`}>{children}</section>
    </main>
  );
}
