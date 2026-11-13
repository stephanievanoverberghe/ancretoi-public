export type AuthUserRole = 'user' | 'admin';
export type AuthUserTheme = 'system' | 'light' | 'dark';
export type AuthUserSource = 'prisma';

export type AuthUser = {
    id: string;
    email: string;
    name?: string | null;
    role: AuthUserRole;
    passwordHash?: string | null;
    passwordChangedAt?: Date | null;
    deletedAt?: Date | null;
    suspendedAt?: Date | null;
    avatarUrl?: string | null;
    theme?: AuthUserTheme;
    marketing?: boolean;
    productUpdates?: boolean;
    maxConcurrentPrograms?: number | null;
    features?: string[];
    source: AuthUserSource;
    prismaId?: string | null;
};

export type RegisterPasswordUserResult =
    | {
          status: 'created';
          user: AuthUser;
      }
    | {
          status: 'email_in_use';
          user?: AuthUser;
      };

export type PasswordResetResult =
    | {
          ok: true;
      }
    | {
          ok: false;
          error: 'invalid_token' | 'weak_password';
          issues?: string[];
      };
