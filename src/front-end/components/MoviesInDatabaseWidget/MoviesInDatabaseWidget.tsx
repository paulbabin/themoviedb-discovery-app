import './MoviesInDatabaseWidget.css';

type MoviesInDatabaseWidgetProps =
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
      count: number;
    };

const defaultErrorMessage = 'Les films en base ne sont pas disponibles.';

export default function MoviesInDatabaseWidget(
  props: MoviesInDatabaseWidgetProps,
) {
  let content: { label: string; message: string };

  switch (props.state) {
    case 'loading':
      content = {
        label: 'Chargement',
        message: 'Le nombre de films en base est en cours de chargement.',
      };
      break;
    case 'empty':
      content = {
        label: 'Aucun film',
        message: 'Aucun film n’est disponible en base.',
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
        label: 'Films en base',
        message: `${props.count} film${props.count === 1 ? '' : 's'} disponible${props.count === 1 ? '' : 's'} en base.`,
      };
      break;
  }

  return (
    <article
      className="movies-in-database-widget"
      aria-label="Widget Films en base"
    >
      <header className="movies-in-database-widget__header">
        <p className="movies-in-database-widget__eyebrow">Dashboard</p>
        <h2>Films en base</h2>
      </header>
      <div
        className="movies-in-database-widget__content"
        data-state={props.state}
      >
        <strong>{content.label}</strong>
        <p>{content.message}</p>
      </div>
    </article>
  );
}
