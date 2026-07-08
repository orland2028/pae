import Link from 'next/link'

export default function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
          <div className="flex flex-1 items-center gap-2 sm:gap-3 min-w-0">
            <img
              src="/pepsico-logo.png"
              alt="PepsiCo logo"
              className="h-8 w-auto object-contain flex-shrink-0 sm:h-9"
            />
            <div className="min-w-0">
              <div className="text-xs sm:text-sm font-semibold tracking-wide truncate">
                InspectorLS
              </div>
              <div className="text-xs text-muted-foreground hidden sm:block">
                Industrial Print Validation
              </div>
            </div>
          </div>
          <Link
            href="/scanner"
            className="rounded-md bg-primary px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-primary-foreground transition hover:opacity-90 flex-shrink-0 whitespace-nowrap"
          >
            Abrir Scanner
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
        <section className="max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-2 sm:px-3 py-1 text-xs uppercase tracking-widest text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
            <span className="truncate">MVP — Scanner + OCR + Validação</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-balance">
            Valide data de validade, código juliano e EA direto pela câmera.
          </h1>
          <p className="mt-4 text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed">
            O sistema abre a câmera traseira, executa OCR restrito ao domínio
            da impressão industrial e valida contra as tabelas oficiais{' '}
            <span className="font-mono text-primary">CodigoJuliano</span>,{' '}
            <span className="font-mono text-primary">ShelfLifeWeekly</span> e{' '}
            <span className="font-mono text-primary">materialsData</span>.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Link
              href="/scanner"
              className="rounded-md bg-primary px-4 sm:px-6 py-2 sm:py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 text-center"
            >
              Iniciar inspeção
            </Link>
            <a
              href="#pipeline"
              className="rounded-md border border-border bg-card px-4 sm:px-6 py-2 sm:py-3 text-sm font-semibold transition hover:bg-accent text-center"
            >
              Ver pipeline
            </a>
          </div>
        </section>

        <section
          id="pipeline"
          className="mt-16 sm:mt-20 grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        >
          {[
            {
              n: '01',
              t: 'Captura contínua',
              d: 'Câmera traseira, autofocus, sem botão de foto.',
            },
            {
              n: '02',
              t: 'Qualidade do frame',
              d: 'Variance of Laplacian — só executa OCR com nitidez suficiente.',
            },
            {
              n: '03',
              t: 'OCR restrito',
              d: 'Whitelist 0-9 / : L S. Parser tolerante a ruído.',
            },
            {
              n: '04',
              t: 'Validação oficial',
              d: 'Consulta getJulianCodeForDate() e ShelfLifeWeekly.',
            },
          ].map((s) => (
            <div
              key={s.n}
              className="rounded-lg border border-border bg-card p-3 sm:p-4 lg:p-5 h-full flex flex-col"
            >
              <div className="font-mono text-xs lg:text-sm text-primary font-semibold">{s.n}</div>
              <div className="mt-2 font-semibold text-sm lg:text-base">{s.t}</div>
              <div className="mt-1 text-xs sm:text-sm text-muted-foreground flex-grow">{s.d}</div>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-border mt-12 sm:mt-16">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 text-xs sm:text-sm text-muted-foreground text-center">
          InspectorLS · MVP scanner cliente · Sem backend
        </div>
      </footer>
    </div>
  )
}
