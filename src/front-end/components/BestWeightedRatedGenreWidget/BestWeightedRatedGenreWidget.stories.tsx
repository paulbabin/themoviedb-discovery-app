import type { Meta, StoryObj } from 'storybook';
import BestWeightedRatedGenreWidget from './BestWeightedRatedGenreWidget';

const meta = {
  title: 'Dashboard/BestWeightedRatedGenreWidget',
  component: BestWeightedRatedGenreWidget,
  tags: ['autodocs'],
} satisfies Meta<typeof BestWeightedRatedGenreWidget>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Nominal: Story = {
  args: {
    state: 'ready',
    data: {
      genre_name: 'Animation',
      average_weighted_rating: 7.68,
    },
  },
};

export const AucunGenreAdmissible: Story = {
  args: {
    state: 'empty',
  },
};

export const NoteInconnue: Story = {
  args: {
    state: 'ready',
    data: {
      genre_name: 'Animation',
      average_weighted_rating: null,
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
    message: 'Erreur de calcul de la note pondérée par genre.',
  },
};
