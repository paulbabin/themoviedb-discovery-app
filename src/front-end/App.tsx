import { Navigate, Route, Routes } from 'react-router';
import './app.css';
import NavBar from './components/NavBar';
import MovieDetailPage from './pages/MovieDetailPage';
import MoviesListPage from './pages/MoviesListPage';
import NotFoundPage from './pages/NotFoundPage';
import AboutPage from './pages/AboutPage';

export default function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<Navigate to="/movies" replace />} />
        <Route path="/movies" element={<MoviesListPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/movies/:id" element={<MovieDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}
