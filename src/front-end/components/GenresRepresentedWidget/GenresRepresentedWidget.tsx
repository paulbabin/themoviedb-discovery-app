import type { GenresRepresentedWidgetData } from '../../../back-end/types/MoviesTypes';
import './GenresRepresentedWidget.css';

type GenresRepresentedWidgetProps =
  | { state: 'loading' }
  | { state: 'error' }
  | { state: 'ready'; data: GenresRepresentedWidgetData };

const genreCountFormatter = new Intl.NumberFormat('fr-FR', {
  maximumFractionDigits: 0,
});

export default function GenresRepresentedWidget(
  props: GenresRepresentedWidgetProps,
) {
  if (props.state === 'loading') {
    return (
      <article className="genres-represented-widget" aria-busy="true">
        <h2>Genres représentés</h2>
        <p className="genres-represented-widget__description">
          Diversité du catalogue
        </p>
        <p className="genres-represented-widget__status" role="status">
          Chargement du nombre de genres…
        </p>
      </article>
    );
  }

  if (props.state === 'error') {
    return (
      <article className="genres-represented-widget">
        <h2>Genres représentés</h2>
        <p className="genres-represented-widget__description">
          Diversité du catalogue
        </p>
        <p className="genres-represented-widget__status" role="alert">
          Impossible de charger le nombre de genres.
        </p>
      </article>
    );
  }

  const { genre_count: genreCount } = props.data;
  const countLabel =
    genreCount === null
      ? 'Non renseigné'
      : `${genreCountFormatter.format(genreCount)} ${
          genreCount === 1 ? 'genre' : 'genres'
        }`;

  return (
    <article className="genres-represented-widget">
      <h2>Genres représentés</h2>
      <p className="genres-represented-widget__description">
        Diversité du catalogue
      </p>
      <p
        className="genres-represented-widget__count"
        aria-label={`Nombre de genres représentés : ${countLabel}`}
      >
        {countLabel}
      </p>
    </article>
  );
}
