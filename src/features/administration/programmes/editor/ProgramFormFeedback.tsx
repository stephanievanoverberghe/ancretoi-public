export default function ProgramFormFeedback({ error, toast }: { error: string | null; toast: string | null }) {
    return (
        <>
            {error && (
                <div role="alert" aria-live="assertive" className="rounded-xl border border-danger/25 bg-danger/10 p-3 text-sm text-foreground">
                    {error}
                </div>
            )}
            {toast && (
                <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[9999] flex justify-center px-4">
                    <div role="status" aria-live="polite" className="pointer-events-auto rounded-xl border border-success/25 bg-success/10 px-3 py-2 text-sm text-foreground shadow">
                        {toast}
                    </div>
                </div>
            )}
        </>
    );
}
