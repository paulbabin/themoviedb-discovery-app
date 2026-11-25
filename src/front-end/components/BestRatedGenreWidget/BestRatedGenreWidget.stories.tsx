import type { Meta, StoryObj } from 'storybook';
import BestRatedGenreWidget from './BestRatedGenreWidget';

const meta = {
  title: 'Dashboard/BestRatedGenreWidget',
  component: BestRatedGenreWidget,
  tags: ['autodocs'],
} satisfies Meta<typeof BestRatedGenreWidget>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Nominal: Story = {
  args: {
    state: 'ready',
    data: {
      genre_name: 'Animation',
      average_simple_rating: 7.41,
    },
  },
};

export const GenreSansNote: Story = {
  args: {
    state: 'empty',
  },
};

export const NomLong: Story = {
  args: {
    state: 'ready',
    data: {
      genre_name: 'Science-fiction et aventures intergalactiques',
      average_simple_rating: 7.41,
    },
  },
};

export const Chargement: Story = {
  args: {
    state: 'loading',
  },
};

export const Erreur: Story = {
  args: {
    state: 'error',
    message: 'Erreur de calcul de la meilleure note par genre.',
  },
};
