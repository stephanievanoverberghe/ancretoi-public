import 'server-only';
import { NextResponse } from 'next/server';

export type ApiValidationIssue = {
    path: string;
    message: string;
    code: string;
};

type ApiErrorOptions = {
    issues?: ApiValidationIssue[];
    includeOk?: boolean;
};

export function apiError(error: string, status = 400, options: ApiErrorOptions = {}) {
    const body: { ok?: false; error: string; issues?: ApiValidationIssue[] } = {
        ok: false,
        error,
    };

    if (options.includeOk === false) {
        delete body.ok;
    }

    if (options.issues?.length) {
        body.issues = options.issues;
    }

    return NextResponse.json(body, { status });
}
