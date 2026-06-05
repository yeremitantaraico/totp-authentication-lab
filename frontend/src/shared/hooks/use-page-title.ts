import { useEffect } from 'react';
import { formatPageTitle } from '../config/app';

export function usePageTitle(pageTitle: string): void {
  useEffect(() => {
    document.title = formatPageTitle(pageTitle);
  }, [pageTitle]);
}
