export type PwIssue = 'too_short' | 'no_lower' | 'no_upper' | 'no_digit' | 'no_symbol' | 'has_space' | 'contains_email' | 'contains_name' | 'repeats' | 'sequence' | 'common';

export type PwAssessment = {
    score: 0 | 1 | 2 | 3 | 4;
    issues: PwIssue[];
    length: number;
};

const COMMON = new Set([
    '123456',
    '123456789',
    '12345678',
    'password',
    'motdepasse',
    'qwerty',
    'azerty',
    'admin',
    'welcome',
    'letmein',
    'iloveyou',
    'dragon',
    'princess',
    'football',
    'abc123',
    'monkey',
    '000000',
    'password1',
    'password1!',
    'p@ssw0rd',
    '1q2w3e4r',
]);

const SEQ_PATTERNS = ['abcdef', 'qwerty', 'azerty', '123456', '654321', 'qwertz', 'poiuy', 'asdfgh', 'zxcvbn'];

function hasSeqLike(p: string): boolean {
    const s = p.toLowerCase();
    for (const pat of SEQ_PATTERNS) {
        if (s.includes(pat)) return true;
    }

    for (let i = 0; i < s.length - 3; i++) {
        const a = s.charCodeAt(i),
            b = s.charCodeAt(i + 1),
            c = s.charCodeAt(i + 2),
            d = s.charCodeAt(i + 3);
        const inc = b === a + 1 && c === b + 1 && d === c + 1;
        const dec = b === a - 1 && c === b - 1 && d === c - 1;
        if (inc || dec) return true;
    }
    return false;
}

function hasRepeats(p: string): boolean {
    return /(.)\1{2,}/.test(p);
}

/**
 * Evalue la robustesse d'un mot de passe sans effet de bord.
 * L'email et le nom servent uniquement a detecter des fragments personnels dans le mot de passe.
 */
export function assessPassword(pw: string, email?: string, name?: string): PwAssessment {
    const issues: PwIssue[] = [];
    const length = pw.length;

    if (length < 12) issues.push('too_short');
    if (!/[a-z]/.test(pw)) issues.push('no_lower');
    if (!/[A-Z]/.test(pw)) issues.push('no_upper');
    if (!/[0-9]/.test(pw)) issues.push('no_digit');
    if (!/[^\w\s]/.test(pw)) issues.push('no_symbol');
    if (/\s/.test(pw)) issues.push('has_space');

    const low = pw.toLowerCase();
    const emailLocal = (email || '').toLowerCase().split('@')[0] || '';
    if (emailLocal && emailLocal.length >= 3 && low.includes(emailLocal)) issues.push('contains_email');

    const nm = (name || '').toLowerCase().trim();
    if (nm && nm.length >= 3) {
        const tokens = nm.split(/\s+/).filter((t) => t.length >= 3);
        if (tokens.some((t) => low.includes(t))) issues.push('contains_name');
    }

    if (hasRepeats(pw)) issues.push('repeats');
    if (hasSeqLike(pw)) issues.push('sequence');

    if (COMMON.has(low)) issues.push('common');

    let score: 0 | 1 | 2 | 3 | 4 = 0;
    const criteria = [length >= 12, /[a-z]/.test(pw), /[A-Z]/.test(pw), /[0-9]/.test(pw), /[^\w\s]/.test(pw)].filter(Boolean).length;

    if (criteria >= 4 && issues.filter((i) => ['common', 'sequence', 'repeats', 'contains_email', 'contains_name'].includes(i)).length === 0) score = 4;
    else if (criteria === 3) score = 3;
    else if (criteria === 2) score = 2;
    else if (criteria === 1) score = 1;
    else score = 0;

    return { score, issues, length };
}

/**
 * Applique la politique mot de passe de l'app pour l'inscription et la reinitialisation.
 * La fonction renvoie les raisons de refus pour permettre une erreur UI exploitable.
 */
export function isPasswordAcceptable(pw: string, email?: string, name?: string): { ok: boolean; issues: PwIssue[] } {
    const a = assessPassword(pw, email, name);
    const mustsOk = a.length >= 12 && /[a-z]/.test(pw) && /[A-Z]/.test(pw) && /[0-9]/.test(pw) && /[^\w\s]/.test(pw) && !/\s/.test(pw);
    const noHighRisk = !a.issues.some((i) => ['common', 'sequence', 'repeats', 'contains_email', 'contains_name'].includes(i));
    return { ok: mustsOk && noHighRisk, issues: a.issues };
}

/**
 * Genere un mot de passe localement sans persistance ni appel serveur.
 * Le resultat contient au moins une minuscule, une majuscule, un chiffre et un symbole.
 */
export function generateStrongPassword(len = 16): string {
    const lowers = 'abcdefghijkmnopqrstuvwxyz';
    const uppers = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const digits = '23456789';
    const symbols = '!@#$%^&*()-_=+[]{}:;,.?/';
    const all = lowers + uppers + digits + symbols;

    function pick(s: string) {
        return s[Math.floor(Math.random() * s.length)]!;
    }

    const base = [pick(lowers), pick(uppers), pick(digits), pick(symbols)];
    const rest = Array.from({ length: Math.max(0, len - base.length) }, () => pick(all));
    const arr = [...base, ...rest];

    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join('');
}
