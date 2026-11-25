import type { Meta, StoryObj } from 'storybook';
import AverageMovieDurationWidget from './AverageMovieDurationWidget';

const meta = {
  title: 'Dashboard/AverageMovieDurationWidget',
  component: AverageMovieDurationWidget,
  tags: ['autodocs'],
} satisfies Meta<typeof AverageMovieDurationWidget>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Nominal: Story = {
  args: {
    state: 'ready',
    averageMinutes: 107,
  },
};

export const Loading: Story = {
  args: {
    state: 'loading',
  },
};

export const WithoutData: Story = {
  args: {
    state: 'empty',
  },
};

export const Error: Story = {
  args: {
    state: 'error',
    message: 'Erreur de calcul de la durée moyenne.',
  },
};
