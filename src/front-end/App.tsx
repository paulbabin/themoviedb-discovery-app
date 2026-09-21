import { useEffect, useState } from 'react';
import type { Movie } from '../back-end/schemas/MoviesTypes';
import MovieItem from './components/MovieItem';

export default function App() {
  const [movies, setMovies] = useState<Movie[] | null>(null);
  useEffect(() => {
    // fetch data from an API /api/movies/popular
    fetch('/api/movies/popular')
      .then((response) => response.json())
      .then((data) => {
        console.log('Fetched movies data:', data); // Log the fetched data for debugging
        setMovies(data.results); // Update the state with the fetched movies data
      });
  }, []);
  return (
    <main>
      <header>
        <h1>Films populaires</h1>
        <h2>
          Films tendances en France, d'après les données de{' '}
          <b>The Movie Database</b>
        </h2>
      </header>
      <section>
        {movies ? (
          <ul>
            {movies.map((movie) => (
              <li key={movie.id}>
                <article>
                  <MovieItem movie={movie} />
                </article>
              </li>
            ))}
          </ul>
        ) : (
          <p>Loading...</p>
        )}
      </section>
    </main>
  );
}
