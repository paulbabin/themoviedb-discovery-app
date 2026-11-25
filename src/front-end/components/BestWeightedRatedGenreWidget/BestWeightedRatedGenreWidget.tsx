import type { BestWeightedRatedGenreWidgetData } from '../../../back-end/types/MoviesTypes';
import './BestWeightedRatedGenreWidget.css';

export type BestWeightedRatedGenreWidgetProps =
  | { state: 'loading' }
  | { state: 'empty' }
  | { state: 'error'; message?: string }
  | { state: 'ready'; data: BestWeightedRatedGenreWidgetData };

const defaultErrorMessage =
  'La meilleure note pondérée par genre est indisponible.';
const frenchRatingFormatter = new Intl.NumberFormat('fr-FR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export default function BestWeightedRatedGenreWidget(
  props: BestWeightedRatedGenreWidgetProps,
) {
  let genreName: string | null = null;
  let ratingLabel: string;
  let description: string;

  switch (props.state) {
    case 'loading':
      ratingLabel = 'Chargement…';
      description =
        'La meilleure note pondérée par genre est en cours de chargement.';
      break;
    case 'empty':
      ratingLabel = 'Aucune note disponible';
      description = 'Aucun genre admissible ne possède de note valide.';
      break;
    case 'error':
      ratingLabel = 'Erreur';
      description = props.message ?? defaultErrorMessage;
      break;
    case 'ready':
      genreName = props.data.genre_name;
      ratingLabel =
        props.data.average_weighted_rating !== null &&
        Number.isFinite(props.data.average_weighted_rating)
          ? `${frenchRatingFormatter.format(props.data.average_weighted_rating)} / 10`
          : 'Note indisponible';
      description = 'Moyenne pondérée des notes valides du genre.';
      break;
  }

  return (
    <article
      className="best-weighted-rated-genre-widget"
      aria-label="Widget Meilleure note pondérée par genre"
    >
      <header className="best-weighted-rated-genre-widget__header">
        <p className="best-weighted-rated-genre-widget__eyebrow">Dashboard</p>
        <h2>Meilleure note pondérée</h2>
      </header>
      <div
        className="best-weighted-rated-genre-widget__content"
        data-state={props.state}
        aria-busy={props.state === 'loading'}
      >
        {props.state === 'loading' ? (
          <p role="status">{description}</p>
        ) : props.state === 'error' ? (
          <p role="alert">{description}</p>
        ) : (
          <>
            <p className="best-weighted-rated-genre-widget__genre">
              {genreName ?? (props.state === 'ready' ? 'Genre inconnu' : '')}
            </p>
            <strong>{ratingLabel}</strong>
            <p>{description}</p>
          </>
        )}
      </div>
    </article>
  );
}
