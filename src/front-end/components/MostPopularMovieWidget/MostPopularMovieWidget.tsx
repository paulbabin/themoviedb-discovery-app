import type { Movie } from '../../../back-end/types/MoviesTypes';
import './MostPopularMovieWidget.css';

export type PopularMovieWidgetMovie = Pick<
  Movie,
  'title' | 'poster_path' | 'release_date'
> & {
  popularity: number | null;
};

export type MostPopularMovieWidgetProps =
  | {
      status: 'loading' | 'empty' | 'error';
      movie?: never;
    }
  | {
      status: 'ready';
      movie: PopularMovieWidgetMovie;
    };

function formatPopularity(popularity: number): string {
  const [integerPart, decimalPart] = popularity.toFixed(2).split('.');
  const groupedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${groupedInteger},${decimalPart}`;
}

export default function MostPopularMovieWidget(
  props: MostPopularMovieWidgetProps,
) {
  if (props.status !== 'ready') {
    const message = {
      loading: 'Chargement du film le plus populaire...',
      empty: 'Aucun film populaire disponible.',
      error: 'Impossible de charger le film le plus populaire.',
    }[props.status];

    return (
      <article
        className="popular-movie-widget popular-movie-widget--state"
        aria-label="Film le plus populaire"
      >
        <p className="popular-movie-widget__kicker">Film le plus populaire</p>
        <p className="status-message" role="status">
          {message}
        </p>
      </article>
    );
  }

  const { movie } = props;
  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
    : null;
  const releaseYear = movie.release_date?.slice(0, 4) || null;

  return (
    <article
      className="popular-movie-widget"
      aria-label="Film le plus populaire"
    >
      <p className="popular-movie-widget__kicker">Film le plus populaire</p>
      <div className="popular-movie-widget__content">
        {posterUrl ? (
          <img
            className="popular-movie-widget__poster"
            src={posterUrl}
            alt={`Affiche de ${movie.title}`}
          />
        ) : (
          <div
            className="popular-movie-widget__poster popular-movie-widget__poster--placeholder"
            role="img"
            aria-label={`Affiche absente pour ${movie.title}`}
          />
        )}
        <div className="popular-movie-widget__copy">
          <h2 title={movie.title}>{movie.title}</h2>
          <dl className="popular-movie-widget__meta">
            {releaseYear && (
              <div>
                <dt>Année</dt>
                <dd>{releaseYear}</dd>
              </div>
            )}
            <div>
              <dt>Indice de popularité</dt>
              <dd>
                {movie.popularity == null
                  ? 'Valeur inconnue'
                  : formatPopularity(movie.popularity)}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </article>
  );
}
