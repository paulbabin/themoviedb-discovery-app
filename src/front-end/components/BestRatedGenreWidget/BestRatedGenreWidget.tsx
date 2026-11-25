import type { BestRatedGenreWidgetData } from '../../../back-end/types/MoviesTypes';
import './BestRatedGenreWidget.css';

export type BestRatedGenreWidgetProps =
  | { state: 'loading' }
  | { state: 'empty' }
  | { state: 'error'; message?: string }
  | { state: 'ready'; data: BestRatedGenreWidgetData };

const defaultErrorMessage = 'La meilleure note par genre est indisponible.';
const frenchRatingFormatter = new Intl.NumberFormat('fr-FR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export default function BestRatedGenreWidget(props: BestRatedGenreWidgetProps) {
  let genreName: string | null = null;
  let ratingLabel: string;
  let description: string;

  switch (props.state) {
    case 'loading':
      ratingLabel = 'Chargement…';
      description = 'La meilleure note par genre est en cours de chargement.';
      break;
    case 'empty':
      ratingLabel = 'Aucune note disponible';
      description = 'Aucun genre ne possède de note valide.';
      break;
    case 'error':
      ratingLabel = 'Erreur';
      description = props.message ?? defaultErrorMessage;
      break;
    case 'ready':
      genreName = props.data.genre_name;
      ratingLabel =
        props.data.average_simple_rating !== null &&
        Number.isFinite(props.data.average_simple_rating)
          ? `${frenchRatingFormatter.format(props.data.average_simple_rating)} / 10`
          : 'Note indisponible';
      description = 'Moyenne simple des notes valides du genre.';
      break;
  }

  return (
    <article
      className="best-rated-genre-widget"
      aria-label="Widget Meilleure note par genre"
    >
      <header className="best-rated-genre-widget__header">
        <p className="best-rated-genre-widget__eyebrow">Dashboard</p>
        <h2>Meilleure note</h2>
      </header>
      <div
        className="best-rated-genre-widget__content"
        data-state={props.state}
        aria-busy={props.state === 'loading'}
      >
        {props.state === 'loading' ? (
          <p role="status">{description}</p>
        ) : props.state === 'error' ? (
          <p role="alert">{description}</p>
        ) : (
          <>
            <p className="best-rated-genre-widget__genre">
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
