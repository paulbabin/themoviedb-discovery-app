import type { LeastProfitableMovieWidgetData } from '../../../back-end/types/MoviesTypes';
import './LeastProfitableMovieWidget.css';

type LeastProfitableMovieWidgetProps =
  | { state: 'loading' }
  | { state: 'empty' }
  | { state: 'error' }
  | { state: 'ready'; movie: LeastProfitableMovieWidgetData };

const roiFormatter = new Intl.NumberFormat('fr-FR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export default function LeastProfitableMovieWidget(
  props: LeastProfitableMovieWidgetProps,
) {
  if (props.state === 'loading') {
    return (
      <article className="least-profitable-widget" aria-busy="true">
        <h2>Film le moins rentable</h2>
        <p role="status">Chargement du film le moins rentable…</p>
      </article>
    );
  }

  if (props.state === 'error') {
    return (
      <article className="least-profitable-widget">
        <h2>Film le moins rentable</h2>
        <p role="alert">Impossible de charger le film le moins rentable.</p>
      </article>
    );
  }

  if (props.state === 'empty') {
    return (
      <article className="least-profitable-widget">
        <h2>Film le moins rentable</h2>
        <p>Aucun film éligible.</p>
      </article>
    );
  }

  const { movie } = props;
  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
    : null;
  const roi =
    movie.roi_percentage !== null && Number.isFinite(movie.roi_percentage)
      ? `${roiFormatter.format(movie.roi_percentage)} %`
      : 'Non renseigné';

  return (
    <article className="least-profitable-widget">
      <h2>Film le moins rentable</h2>
      <div className="least-profitable-widget__content">
        {posterUrl ? (
          <img
            className="least-profitable-widget__poster"
            src={posterUrl}
            alt={`Affiche de ${movie.title}`}
          />
        ) : (
          <div
            className="least-profitable-widget__poster least-profitable-widget__poster--empty"
            role="img"
            aria-label="Affiche absente"
          />
        )}
        <div className="least-profitable-widget__details">
          <h3>{movie.title}</h3>
          <p>Année : {movie.release_year ?? 'Inconnue'}</p>
          <p>
            ROI : <strong>{roi}</strong>
          </p>
        </div>
      </div>
    </article>
  );
}
