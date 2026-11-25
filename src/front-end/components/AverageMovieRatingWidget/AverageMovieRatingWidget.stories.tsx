import type { Meta, StoryObj } from 'storybook';
import AverageMovieRatingWidget from './AverageMovieRatingWidget';

const meta = {
  title: 'Dashboard/AverageMovieRatingWidget',
  component: AverageMovieRatingWidget,
  tags: ['autodocs'],
} satisfies Meta<typeof AverageMovieRatingWidget>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Nominal: Story = {
  args: {
    state: 'ready',
    averageRating: 6.78,
    calculation: 'simple',
  },
};

export const WeightedAverage: Story = {
  args: {
    state: 'ready',
    averageRating: 6.78,
    calculation: 'weighted',
  },
};

export const Loading: Story = {
  args: {
    state: 'loading',
  },
};

export const WithoutRatings: Story = {
  args: {
    state: 'empty',
  },
};

export const Error: Story = {
  args: {
    state: 'error',
    message: 'Erreur de calcul de la note moyenne.',
  },
};
