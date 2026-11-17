import './AverageMovieRatingWidget.css';

export type AverageMovieRatingWidgetProps =
  | {
      state: 'loading';
    }
  | {
      state: 'empty';
    }
  | {
      state: 'error';
      message?: string;
    }
  | {
      state: 'ready';
      averageRating: number;
      calculation: 'simple' | 'weighted';
    };

const defaultErrorMessage = 'La note moyenne n’est pas disponible.';
const frenchRatingFormatter = new Intl.NumberFormat('fr-FR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Displays a pre-calculated catalogue rating average.
 *
 * The component receives the aggregate and its calculation method. It does
 * not calculate an average from a page of movies.
 */
export default function AverageMovieRatingWidget(
  props: AverageMovieRatingWidgetProps,
) {
  let content: { label: string; message: string };

  switch (props.state) {
    case 'loading':
      content = {
        label: 'Chargement',
        message: 'La note moyenne est en cours de chargement.',
      };
      break;
    case 'empty':
      content = {
        label: 'Aucune note',
        message: 'Aucune note disponible pour le catalogue.',
      };
      break;
    case 'error':
      content = {
        label: 'Erreur',
        message: props.message ?? defaultErrorMessage,
      };
      break;
    case 'ready':
      content = {
        label: `${frenchRatingFormatter.format(props.averageRating)} / 10`,
        message:
          props.calculation === 'simple'
            ? 'Moyenne simple calculée sur le catalogue.'
            : 'Moyenne pondérée calculée sur le catalogue.',
      };
      break;
  }

  return (
    <article
      className="average-movie-rating-widget"
      aria-label="Widget Note moyenne"
    >
      <header className="average-movie-rating-widget__header">
        <p className="average-movie-rating-widget__eyebrow">Dashboard</p>
        <h2>Note moyenne</h2>
      </header>
      <div
        className="average-movie-rating-widget__content"
        data-state={props.state}
      >
        <strong>{content.label}</strong>
        <p>{content.message}</p>
      </div>
    </article>
  );
}
