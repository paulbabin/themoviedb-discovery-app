import type { Meta, StoryObj } from 'storybook';
import DashboardPage from './DashboardPage';

const meta = {
  title: 'Dashboard/DashboardPage',
  component: DashboardPage,
  tags: ['autodocs'],
} satisfies Meta<typeof DashboardPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithoutWidgets: Story = {};
