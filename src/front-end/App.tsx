import { useEffect, useState } from 'react';
import type { Movie } from '../back-end/schemas/MoviesTypes';
import MovieItem from './components/MovieItem';
import {
  DEFAULT_LANGUAGE,
  DEFAULT_PAGE,
  DEFAULT_REGION,
} from '../back-end/constants';

export default function App() {
  const [movies, setMovies] = useState<Movie[] | null>(null);
  const queryParams = new URLSearchParams(window.location.search);
  const language = queryParams.get('language') || DEFAULT_LANGUAGE;
  const page = queryParams.get('page') || DEFAULT_PAGE;
  const region = queryParams.get('region') || DEFAULT_REGION;

  useEffect(() => {
    fetch(
      `/api/movies/popular?language=${language}&page=${page}&region=${region}`,
    )
      .then((response) => response.json())
      .then((data) => {
        setMovies(data.results);
      });
  }, [language, page, region]);
  return (
    <div>
      <h1>Popular Movies</h1>
      {movies ? (
        <ul>
          {movies.map((movie) => (
            <MovieItem key={movie.id} movie={movie} />
          ))}
        </ul>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
