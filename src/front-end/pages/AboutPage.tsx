import './AboutPage.css';

const foundations = [
  ['TypeScript', 'Typage et fiabilité'],
  ['React', 'Interface composable'],
  ['Node.js + Express', 'API légère'],
  ['Vite', 'Développement rapide'],
];

export default function AboutPage() {
  return (
    <main className="about-page">
      <header style={{ marginBottom: 40 }}>
        <div
          style={{
            color: '#176b78',
            fontSize: '0.8rem',
            fontWeight: 800,
            letterSpacing: '0.12em',
            marginBottom: 8,
          }}
        >
          TMDB DISCOVERY
        </div>

        <h1>À propos de l'application</h1>

        <p>
          Une application de découverte de films, pensée comme une expérience
          web claire, rapide et maintenable.
        </p>
      </header>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(220px, 0.8fr) 1.2fr',
          gap: 32,
          borderTop: '2px solid #72b8c5',
          borderBottom: '1px solid #b8d8de',
          padding: '30px 0',
          marginBottom: 28,
        }}
      >
        <div>
          <div
            style={{
              color: '#176b78',
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '0.12em',
              marginBottom: 10,
            }}
          >
            LE PROJET
          </div>
          <h2 style={{ margin: 0, color: '#173f5f', fontSize: '1.35rem' }}>
            Découvrir, comparer, choisir
          </h2>
        </div>

        <p style={{ margin: 0 }}>
          Cette application utilise l'API de <b>T</b>he <b>M</b>ovie <b>D</b>ata
          <b>B</b>ase pour rendre les films populaires faciles à explorer. Elle
          démontre la construction d'une application complète, du front-end à
          l'API.
        </p>
      </section>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(220px, 0.8fr) 1.2fr',
          gap: 32,
          marginBottom: 32,
        }}
      >
        <div>
          <div
            style={{
              color: '#176b78',
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '0.12em',
              marginBottom: 10,
            }}
          >
            FONDATIONS TECHNIQUES
          </div>
          <h2 style={{ margin: 0, color: '#173f5f', fontSize: '1.35rem' }}>
            Une stack volontairement simple
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 10,
          }}
        >
          {foundations.map(([title, description]) => (
            <article
              key={title}
              style={{
                border: '1px solid #b8d8de',
                borderRadius: 7,
                padding: '15px 14px',
                background: 'rgba(255, 255, 255, 0.45)',
              }}
            >
              <strong style={{ display: 'block', color: '#173f5f' }}>
                {title}
              </strong>
              <span style={{ color: '#61728c', fontSize: '0.9rem' }}>
                {description}
              </span>
            </article>
          ))}
        </div>
      </section>

      <aside
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
          borderRadius: 7,
          padding: '25px 26px',
          color: '#fff',
          background: '#174a68',
        }}
      >
        <div>
          <div
            style={{
              color: '#a9d8df',
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '0.12em',
              marginBottom: 8,
            }}
          >
            CODE SOURCE
          </div>
          <h2 style={{ margin: 0, fontSize: '1.35rem' }}>
            Voir la réalisation du projet
          </h2>
        </div>

        <a
          href="https://github.com/paulbabin/themoviedb-discovery-app/"
          target="_blank"
          rel="noreferrer"
          style={{
            padding: '11px 14px',
            border: '2px solid #b9e0e5',
            borderRadius: 6,
            color: '#fff',
            fontWeight: 800,
            textDecoration: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          Ouvrir le dépôt GitHub
        </a>
      </aside>
    </main>
  );
}
