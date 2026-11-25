import './AverageMovieDurationWidget.css';

export type AverageMovieDurationWidgetProps =
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
      averageMinutes: number;
    };

const defaultErrorMessage = 'La durée moyenne n’est pas disponible.';

/**
 * Displays the catalogue's calculated average movie duration.
 *
 * The ready state requires a calculated duration. Missing data must use the
 * empty state instead of being represented as zero minutes.
 */
export default function AverageMovieDurationWidget(
  props: AverageMovieDurationWidgetProps,
) {
  let content: { label: string; message: string };

  switch (props.state) {
    case 'loading':
      content = {
        label: 'Chargement',
        message: 'La durée moyenne est en cours de chargement.',
      };
      break;
    case 'empty':
      content = {
        label: 'Aucune donnée',
        message: 'Aucune durée de film disponible.',
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
        label: `${props.averageMinutes} min`,
        message: 'Durée moyenne calculée sur les films du catalogue.',
      };
      break;
  }

  return (
    <article
      className="average-movie-duration-widget"
      aria-label="Widget Durée moyenne"
    >
      <header className="average-movie-duration-widget__header">
        <p className="average-movie-duration-widget__eyebrow">Dashboard</p>
        <h2>Durée moyenne</h2>
      </header>
      <div
        className="average-movie-duration-widget__content"
        data-state={props.state}
      >
        <strong>{content.label}</strong>
        <p>{content.message}</p>
      </div>
    </article>
  );
}
