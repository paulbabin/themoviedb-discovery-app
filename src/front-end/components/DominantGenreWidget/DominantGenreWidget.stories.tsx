import type { Meta, StoryObj } from 'storybook';
import type { DominantGenreWidgetData } from '../../../back-end/types/MoviesTypes';
import DominantGenreWidget from './DominantGenreWidget';

const exampleData: DominantGenreWidgetData = {
  genre_name: 'Drame',
  movie_count: 322,
};

const meta = {
  title: 'Dashboard/Genre dominant',
  component: DominantGenreWidget,
  tags: ['autodocs'],
} satisfies Meta<typeof DominantGenreWidget>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Nominal: Story = {
  args: { state: 'ready', data: exampleData },
};

export const AucunGenreConnu: Story = {
  args: { state: 'empty' },
};

export const EffectifInconnu: Story = {
  args: {
    state: 'ready',
    data: { genre_name: 'Drame', movie_count: null },
  },
};

export const Chargement: Story = {
  args: { state: 'loading' },
};

export const Erreur: Story = {
  args: { state: 'error' },
};
