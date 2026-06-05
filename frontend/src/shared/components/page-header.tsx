import type { ReactNode } from 'react';

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  badge: string;
  badgeVariant?: 'label' | 'initials';
  action?: ReactNode;
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  badge,
  badgeVariant = 'label',
  action,
}: PageHeaderProps) {
  return (
    <header className="page-header">
      <div className="page-header__main">
        <div
          className={`page-header__badge ${
            badgeVariant === 'initials' ? 'page-header__badge--initials' : ''
          }`}
          aria-hidden="true"
        >
          {badge}
        </div>
        <div>
          <p className="page-header__eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
        </div>
      </div>
      {action}
    </header>
  );
}
