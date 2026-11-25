import type { Meta, StoryObj } from 'storybook';
import type { GenresRepresentedWidgetData } from '../../../back-end/types/MoviesTypes';
import GenresRepresentedWidget from './GenresRepresentedWidget';

const exampleData: GenresRepresentedWidgetData = {
  genre_count: 19,
};

const meta = {
  title: 'Dashboard/Genres représentés',
  component: GenresRepresentedWidget,
  tags: ['autodocs'],
} satisfies Meta<typeof GenresRepresentedWidget>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Nominal: Story = {
  args: { state: 'ready', data: exampleData },
};

export const ZeroGenre: Story = {
  args: { state: 'ready', data: { genre_count: 0 } },
};

export const ValeurInconnue: Story = {
  args: { state: 'ready', data: { genre_count: null } },
};

export const Chargement: Story = {
  args: { state: 'loading' },
};

export const Erreur: Story = {
  args: { state: 'error' },
};
