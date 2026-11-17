import { useState } from 'react';
import type { Movie } from '../../../back-end/types/MoviesTypes';
import './TopRatedMovieWidget.css';

export type TopRatedMovieWidgetProps =
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
      movie: Movie;
    };

const defaultErrorMessage = 'Le film le mieux noté est indisponible.';

/**
 * Displays the movie already selected as the catalogue's top-rated title.
 *
 * The widget receives a movie and displays its rating; it does not calculate
 * the best-rated movie from a page of results.
 */
export default function TopRatedMovieWidget(props: TopRatedMovieWidgetProps) {
  const [hasPosterError, setHasPosterError] = useState(false);

  if (props.state !== 'ready') {
    const stateContent = {
      loading: {
        label: 'Chargement',
        message: 'Le film le mieux noté est en cours de chargement.',
      },
      empty: {
        label: 'Aucun film noté',
        message: 'Aucun film noté disponible.',
      },
      error: {
        label: 'Erreur',
        message: props.message ?? defaultErrorMessage,
      },
    }[props.state];

    return (
      <article
        className="top-rated-movie-widget"
        aria-label="Widget Film le mieux noté"
      >
        <header className="top-rated-movie-widget__header">
          <p className="top-rated-movie-widget__eyebrow">Dashboard</p>
          <h2>Film le mieux noté</h2>
        </header>
        <div
          className="top-rated-movie-widget__content"
          data-state={props.state}
        >
          <strong>{stateContent.label}</strong>
          <p>{stateContent.message}</p>
        </div>
      </article>
    );
  }

  const releaseYear = props.movie.release_date
    ? props.movie.release_date.slice(0, 4)
    : 'Année inconnue';
  const posterUrl = props.movie.poster_path
    ? `https://image.tmdb.org/t/p/w300${props.movie.poster_path}`
    : null;
  const showPoster = posterUrl !== null && !hasPosterError;

  return (
    <article
      className="top-rated-movie-widget"
      aria-label="Widget Film le mieux noté"
    >
      <header className="top-rated-movie-widget__header">
        <p className="top-rated-movie-widget__eyebrow">Dashboard</p>
        <h2>Film le mieux noté</h2>
      </header>
      <div className="top-rated-movie-widget__content" data-state="ready">
        {showPoster ? (
          <img
            className="top-rated-movie-widget__poster"
            src={posterUrl}
            alt={`Affiche de ${props.movie.title}`}
            onError={() => setHasPosterError(true)}
          />
        ) : (
          <div
            className="top-rated-movie-widget__poster top-rated-movie-widget__poster--fallback"
            role="img"
            aria-label={`Affiche indisponible pour ${props.movie.title}`}
          >
            Affiche indisponible
          </div>
        )}
        <div className="top-rated-movie-widget__details">
          <h3>{props.movie.title}</h3>
          <p>Année : {releaseYear}</p>
          <p>
            Note : <strong>{props.movie.vote_average.toFixed(1)} / 10</strong>
          </p>
        </div>
      </div>
    </article>
  );
}
