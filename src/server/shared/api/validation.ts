import 'server-only';
import { z, ZodError } from 'zod';
import { apiError, type ApiValidationIssue } from './responses';

type ParseJsonBodyOptions = {
    invalidJsonError?: string;
    validationError?: string;
    status?: number;
    includeIssues?: boolean;
    includeOk?: boolean;
};

export type ParseJsonBodyResult<T> = { ok: true; data: T } | { ok: false; response: Response };

export async function parseJsonBody<T>(request: Request, schema: z.ZodType<T>, options: ParseJsonBodyOptions = {}): Promise<ParseJsonBodyResult<T>> {
    let json: unknown;

    try {
        json = await request.json();
    } catch {
        return {
            ok: false,
            response: apiError(options.invalidJsonError ?? 'INVALID_JSON', options.status ?? 400, { includeOk: options.includeOk }),
        };
    }

    const parsed = schema.safeParse(json);
    if (!parsed.success) {
        return {
            ok: false,
            response: apiError(options.validationError ?? 'INVALID_BODY', options.status ?? 400, {
                issues: options.includeIssues === false ? undefined : formatValidationIssues(parsed.error),
                includeOk: options.includeOk,
            }),
        };
    }

    return { ok: true, data: parsed.data };
}

function formatValidationIssues(error: ZodError): ApiValidationIssue[] {
    return error.issues.map((issue) => ({
        path: issue.path.map(String).join('.') || '(root)',
        message: issue.message,
        code: issue.code,
    }));
}
