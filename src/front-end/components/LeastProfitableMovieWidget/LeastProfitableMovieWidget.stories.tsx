import type { Meta, StoryObj } from 'storybook';
import type { LeastProfitableMovieWidgetData } from '../../../back-end/types/MoviesTypes';
import LeastProfitableMovieWidget from './LeastProfitableMovieWidget';

const exampleMovie: LeastProfitableMovieWidgetData = {
  title: 'The Example',
  release_year: 2024,
  poster_path: '/example-poster.jpg',
  roi_percentage: -100,
};

const meta = {
  title: 'Dashboard/Film le moins rentable',
  component: LeastProfitableMovieWidget,
  tags: ['autodocs'],
} satisfies Meta<typeof LeastProfitableMovieWidget>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Nominal: Story = {
  args: { state: 'ready', movie: exampleMovie },
};

export const RoiZero: Story = {
  args: {
    state: 'ready',
    movie: { ...exampleMovie, roi_percentage: 0 },
  },
};

export const RoiInconnu: Story = {
  args: {
    state: 'ready',
    movie: { ...exampleMovie, roi_percentage: null },
  },
};

export const AfficheAbsente: Story = {
  args: {
    state: 'ready',
    movie: { ...exampleMovie, poster_path: null },
  },
};

export const AucunFilmEligible: Story = {
  args: { state: 'empty' },
};

export const Chargement: Story = {
  args: { state: 'loading' },
};

export const Erreur: Story = {
  args: { state: 'error' },
};
