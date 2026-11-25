import type { Meta, StoryObj } from 'storybook';
import MoviesInDatabaseWidget from './MoviesInDatabaseWidget';

const meta = {
  title: 'Dashboard/MoviesInDatabaseWidget',
  component: MoviesInDatabaseWidget,
  tags: ['autodocs'],
} satisfies Meta<typeof MoviesInDatabaseWidget>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Loading: Story = {
  args: {
    state: 'loading',
  },
};

export const Empty: Story = {
  args: {
    state: 'empty',
  },
};

export const Error: Story = {
  args: {
    state: 'error',
    message: 'Erreur de connexion à la base.',
  },
};

export const Ready: Story = {
  args: {
    state: 'ready',
    count: 42,
  },
};
