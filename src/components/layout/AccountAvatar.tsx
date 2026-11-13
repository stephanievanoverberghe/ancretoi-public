import Image from 'next/image';

import { cn } from '@/lib/cn';

type AccountAvatarProps = {
  displayName?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  size?: 'sm' | 'md';
  className?: string;
};

function getInitial(displayName?: string | null, email?: string | null) {
  const source = (displayName || email || '').trim();
  return source ? source[0]!.toUpperCase() : 'A';
}

export function AccountAvatar({ displayName, email, avatarUrl, size = 'sm', className }: AccountAvatarProps) {
  const dimension = size === 'md' ? 40 : 32;

  if (avatarUrl) {
    return (
      <span className={cn('inline-flex overflow-hidden rounded-full border border-border bg-surface', className)} style={{ width: dimension, height: dimension }}>
        <Image src={avatarUrl} alt="" width={dimension} height={dimension} className="object-cover" unoptimized />
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow-soft',
        size === 'md' ? 'h-10 w-10 text-base' : 'h-8 w-8 text-sm',
        className,
      )}
    >
      {getInitial(displayName, email)}
    </span>
  );
}
