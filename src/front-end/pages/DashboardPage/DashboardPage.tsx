export default function DashboardPage() {
  return (
    <main className="app-shell">
      <header className="app-header">
        <h1>Tableau de bord des films</h1>
        <h2>
          Retrouvez prochainement les informations sur les films, leurs genres
          et leurs pays de production.
        </h2>
      </header>

      <section aria-labelledby="dashboard-widgets-title">
        <h2 id="dashboard-widgets-title">Widgets</h2>
        <p className="status-message">
          Aucun widget n&apos;est configuré pour le moment.
        </p>
      </section>
    </main>
  );
}
