'use client';

import { LogOut } from 'lucide-react';
import { useTransition } from 'react';

import { Button } from '@/components/ui';
import { publicHeaderContent } from '@/content/layout';
import { cn } from '@/lib/cn';

type SessionLogoutButtonProps = {
  variant?: 'menu' | 'button' | 'icon';
  className?: string;
};

export function SessionLogoutButton({ variant = 'menu', className }: SessionLogoutButtonProps) {
  const [pending, start] = useTransition();

  function handleClick() {
    start(async () => {
      await fetch('/api/auth/logout', { method: 'POST' });
      location.href = '/';
    });
  }

  if (variant === 'button') {
    return (
      <Button type="button" variant="secondary" loading={pending} loadingLabel={publicHeaderContent.auth.logoutLoadingLabel} className={className} onClick={handleClick}>
        {publicHeaderContent.auth.logout}
      </Button>
    );
  }

  if (variant === 'icon') {
    return (
      <Button type="button" variant="ghost" size="icon" loading={pending} loadingLabel={publicHeaderContent.auth.logoutLoadingLabel} className={className} aria-label={publicHeaderContent.auth.logout} onClick={handleClick}>
        <LogOut aria-hidden="true" className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <button
      type="button"
      disabled={pending}
      aria-busy={pending}
      className={cn(
        'block w-full cursor-pointer rounded-md px-3 py-2 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60',
        className,
      )}
      onClick={handleClick}
    >
      {pending ? publicHeaderContent.auth.logoutPending : publicHeaderContent.auth.logout}
    </button>
  );
}
