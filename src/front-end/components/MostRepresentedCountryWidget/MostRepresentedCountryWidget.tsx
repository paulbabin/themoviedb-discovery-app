import type { Country } from '../../../back-end/types/Country';
import './MostRepresentedCountryWidget.css';

export type MostRepresentedCountryWidgetProps =
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
      country: Country;
      movieCount: number;
    };

const defaultErrorMessage = 'Le pays le plus représenté est indisponible.';

/**
 * Displays the country already identified as most represented in the catalogue.
 *
 * The component receives an aggregated country and count. It does not inspect
 * movie-country associations or recompute the count.
 */
export default function MostRepresentedCountryWidget(
  props: MostRepresentedCountryWidgetProps,
) {
  let content: { label: string; message: string };

  switch (props.state) {
    case 'loading':
      content = {
        label: 'Chargement',
        message: 'Le pays le plus représenté est en cours de chargement.',
      };
      break;
    case 'empty':
      content = {
        label: 'Aucun pays',
        message: 'Aucun pays de production connu.',
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
        label: props.country.name,
        message: `${props.movieCount} film${props.movieCount === 1 ? '' : 's'}`,
      };
      break;
  }

  return (
    <article
      className="most-represented-country-widget"
      aria-label="Widget Pays le plus représenté"
    >
      <header className="most-represented-country-widget__header">
        <p className="most-represented-country-widget__eyebrow">Dashboard</p>
        <h2>Pays le plus représenté</h2>
      </header>
      <div
        className="most-represented-country-widget__content"
        data-state={props.state}
      >
        <strong>{content.label}</strong>
        <p>{content.message}</p>
      </div>
    </article>
  );
}
