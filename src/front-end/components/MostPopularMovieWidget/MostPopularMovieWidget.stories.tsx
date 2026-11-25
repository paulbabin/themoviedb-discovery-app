import type { Meta, StoryObj } from 'storybook';
import MostPopularMovieWidget from './MostPopularMovieWidget';

const meta = {
  title: 'Dashboard/Film le plus populaire',
  component: MostPopularMovieWidget,
  tags: ['autodocs'],
  args: {
    status: 'ready',
    movie: {
      title: 'Example Movie',
      poster_path: '/example-poster.jpg',
      release_date: '2024-05-10',
      popularity: 1036.49,
    },
  },
} satisfies Meta<typeof MostPopularMovieWidget>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Nominal: Story = {};

export const PosterAbsent: Story = {
  args: {
    status: 'ready',
    movie: {
      title: 'Example Movie',
      poster_path: null,
      release_date: '2024-05-10',
      popularity: 1036.49,
    },
  },
};

export const PopulariteInconnue: Story = {
  args: {
    status: 'ready',
    movie: {
      title: 'Example Movie',
      poster_path: '/example-poster.jpg',
      release_date: '2024-05-10',
      popularity: null,
    },
  },
};

export const Chargement: Story = {
  args: { status: 'loading' },
};

export const Erreur: Story = {
  args: { status: 'error' },
};

export const AucunFilm: Story = {
  args: { status: 'empty' },
};

export const TitreLong: Story = {
  args: {
    status: 'ready',
    movie: {
      title:
        'Le très long titre d’un film remarquable dont le texte doit rester parfaitement lisible dans la carte',
      poster_path: '/example-poster.jpg',
      release_date: '2024-05-10',
      popularity: 1036.49,
    },
  },
};
