export default function EmailChangeClient({ current }: { current: string }) {
    return (
        <div className="rounded-2xl border border-border bg-surface-muted p-4 text-sm text-muted-foreground">
            <div className="break-all font-semibold text-foreground">{current}</div>
            <p className="mt-2 leading-relaxed">Le changement d’adresse e-mail sera ajouté dans une prochaine itération. Pour l’instant, cette adresse reste l’identifiant du compte.</p>
        </div>
    );
}
