import type { Meta, StoryObj } from 'storybook';
import type { Country } from '../../../back-end/types/Country';
import MostRepresentedCountryWidget from './MostRepresentedCountryWidget';

const meta = {
  title: 'Dashboard/MostRepresentedCountryWidget',
  component: MostRepresentedCountryWidget,
  tags: ['autodocs'],
} satisfies Meta<typeof MostRepresentedCountryWidget>;

export default meta;

type Story = StoryObj<typeof meta>;

const unitedStates: Country = {
  code: 'US',
  name: 'United States of America',
};

export const Nominal: Story = {
  args: {
    state: 'ready',
    country: unitedStates,
    movieCount: 725,
  },
};

export const LongCountryName: Story = {
  args: {
    state: 'ready',
    country: {
      code: 'GB',
      name: 'United Kingdom of Great Britain and Northern Ireland',
    },
    movieCount: 1,
  },
};

export const Loading: Story = {
  args: {
    state: 'loading',
  },
};

export const WithoutKnownCountry: Story = {
  args: {
    state: 'empty',
  },
};

export const Error: Story = {
  args: {
    state: 'error',
    message: 'Erreur de lecture des pays de production.',
  },
};
