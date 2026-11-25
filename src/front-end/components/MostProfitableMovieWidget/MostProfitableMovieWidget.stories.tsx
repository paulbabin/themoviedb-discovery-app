import type { Meta, StoryObj } from 'storybook';
import type { MostProfitableMovieWidgetData } from '../../../back-end/types/MoviesTypes';
import MostProfitableMovieWidget from './MostProfitableMovieWidget';

const exampleMovie: MostProfitableMovieWidgetData = {
  title: 'The Example',
  release_year: 2024,
  poster_path: '/example-poster.jpg',
  roi_percentage: 69667.36,
};

const meta = {
  title: 'Dashboard/Film le plus rentable',
  component: MostProfitableMovieWidget,
  tags: ['autodocs'],
} satisfies Meta<typeof MostProfitableMovieWidget>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Nominal: Story = {
  args: { state: 'ready', movie: exampleMovie },
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
