import type { MostProfitableMovieWidgetData } from '../../../back-end/types/MoviesTypes';
import './MostProfitableMovieWidget.css';

type MostProfitableMovieWidgetProps =
  | { state: 'loading' }
  | { state: 'empty' }
  | { state: 'error' }
  | { state: 'ready'; movie: MostProfitableMovieWidgetData };

const roiFormatter = new Intl.NumberFormat('fr-FR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export default function MostProfitableMovieWidget(
  props: MostProfitableMovieWidgetProps,
) {
  if (props.state === 'loading') {
    return (
      <article className="most-profitable-widget" aria-busy="true">
        <h2>Film le plus rentable</h2>
        <p role="status">Chargement du film le plus rentable…</p>
      </article>
    );
  }

  if (props.state === 'error') {
    return (
      <article className="most-profitable-widget">
        <h2>Film le plus rentable</h2>
        <p role="alert">Impossible de charger le film le plus rentable.</p>
      </article>
    );
  }

  if (props.state === 'empty') {
    return (
      <article className="most-profitable-widget">
        <h2>Film le plus rentable</h2>
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
    <article className="most-profitable-widget">
      <h2>Film le plus rentable</h2>
      <div className="most-profitable-widget__content">
        {posterUrl ? (
          <img
            className="most-profitable-widget__poster"
            src={posterUrl}
            alt={`Affiche de ${movie.title}`}
          />
        ) : (
          <div
            className="most-profitable-widget__poster most-profitable-widget__poster--empty"
            role="img"
            aria-label="Affiche absente"
          />
        )}
        <div className="most-profitable-widget__details">
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
