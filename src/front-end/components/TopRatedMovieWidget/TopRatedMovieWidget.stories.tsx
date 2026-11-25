import type { Meta, StoryObj } from 'storybook';
import type { Movie } from '../../../back-end/types/MoviesTypes';
import TopRatedMovieWidget from './TopRatedMovieWidget';

const meta = {
  title: 'Dashboard/TopRatedMovieWidget',
  component: TopRatedMovieWidget,
  tags: ['autodocs'],
} satisfies Meta<typeof TopRatedMovieWidget>;

export default meta;

type Story = StoryObj<typeof meta>;

const topRatedMovie: Movie = {
  id: 123,
  title: 'The Highest Rated Movie',
  release_date: '2024-05-10',
  vote_average: 9.1,
  poster_path: '/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
} as Movie;

export const Nominal: Story = {
  args: {
    state: 'ready',
    movie: topRatedMovie,
  },
};

export const WithoutPoster: Story = {
  args: {
    state: 'ready',
    movie: { ...topRatedMovie, poster_path: '' },
  },
};

export const Loading: Story = {
  args: {
    state: 'loading',
  },
};

export const WithoutRatedMovie: Story = {
  args: {
    state: 'empty',
  },
};

export const Error: Story = {
  args: {
    state: 'error',
    message: 'Erreur de lecture du film le mieux noté.',
  },
};
