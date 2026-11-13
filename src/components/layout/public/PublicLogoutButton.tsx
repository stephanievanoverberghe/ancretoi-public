import { SessionLogoutButton } from '../SessionLogoutButton';

type Props = {
    variant?: 'menu' | 'primary' | 'icon';
};

export default function PublicLogoutButton({ variant = 'menu' }: Props) {
    if (variant === 'icon') {
        return <SessionLogoutButton variant="icon" />;
    }

    return <SessionLogoutButton variant={variant === 'primary' ? 'button' : 'menu'} />;
}
