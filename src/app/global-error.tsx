'use client';

import Link from 'next/link';

export default function GlobalError({ reset }: { reset: () => void }) {
    return (
        <html lang="fr">
            <body
                style={{
                    margin: 0,
                    minHeight: '100vh',
                    display: 'grid',
                    placeItems: 'center',
                    padding: '1rem',
                    background: '#fcfaf7',
                    color: '#241b35',
                    fontFamily: 'system-ui, sans-serif',
                }}
            >
                <main style={{ maxWidth: '36rem', textAlign: 'center' }}>
                    <p style={{ color: '#6c4be0', fontWeight: 700 }}>Ancre-toi</p>
                    <h1>Le site rencontre un problème temporaire</h1>
                    <p style={{ lineHeight: 1.6, color: '#625b6c' }}>
                        Tes données ne sont pas supprimées. Réessaie ou reviens à l’accueil.
                    </p>
                    <div
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            justifyContent: 'center',
                            gap: '.75rem',
                            marginTop: '1.5rem',
                        }}
                    >
                        <button
                            type="button"
                            onClick={reset}
                            style={{
                                minHeight: '2.75rem',
                                border: 0,
                                borderRadius: '.75rem',
                                padding: '0 1rem',
                                background: '#6c4be0',
                                color: '#fff',
                                fontWeight: 700,
                                cursor: 'pointer',
                            }}
                        >
                            Réessayer
                        </button>
                        <Link
                            href="/"
                            style={{
                                display: 'inline-flex',
                                minHeight: '2.75rem',
                                alignItems: 'center',
                                border: '1px solid #d9d2df',
                                borderRadius: '.75rem',
                                padding: '0 1rem',
                                color: 'inherit',
                                fontWeight: 700,
                                textDecoration: 'none',
                            }}
                        >
                            Retour à l’accueil
                        </Link>
                    </div>
                </main>
            </body>
        </html>
    );
}
