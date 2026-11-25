import type { DominantGenreWidgetData } from '../../../back-end/types/MoviesTypes';
import './DominantGenreWidget.css';

type DominantGenreWidgetProps =
  | { state: 'loading' }
  | { state: 'empty' }
  | { state: 'error' }
  | { state: 'ready'; data: DominantGenreWidgetData };

const movieCountFormatter = new Intl.NumberFormat('fr-FR', {
  maximumFractionDigits: 0,
});

export default function DominantGenreWidget(props: DominantGenreWidgetProps) {
  if (props.state === 'loading') {
    return (
      <article className="dominant-genre-widget" aria-busy="true">
        <h2>Genre dominant</h2>
        <p className="dominant-genre-widget__status" role="status">
          Chargement du genre dominant…
        </p>
      </article>
    );
  }

  if (props.state === 'error') {
    return (
      <article className="dominant-genre-widget">
        <h2>Genre dominant</h2>
        <p className="dominant-genre-widget__status" role="alert">
          Impossible de charger le genre dominant.
        </p>
      </article>
    );
  }

  if (props.state === 'empty') {
    return (
      <article className="dominant-genre-widget">
        <h2>Genre dominant</h2>
        <p className="dominant-genre-widget__status">Aucun genre connu.</p>
      </article>
    );
  }

  const { genre_name: genreName, movie_count: movieCount } = props.data;
  const countLabel =
    movieCount === null
      ? 'Effectif inconnu'
      : `${movieCountFormatter.format(movieCount)} ${
          movieCount === 1 ? 'film' : 'films'
        }`;

  return (
    <article className="dominant-genre-widget">
      <h2>Genre dominant</h2>
      <p className="dominant-genre-widget__name">
        {genreName ?? 'Genre inconnu'}
      </p>
      <p className="dominant-genre-widget__count">{countLabel}</p>
    </article>
  );
}
