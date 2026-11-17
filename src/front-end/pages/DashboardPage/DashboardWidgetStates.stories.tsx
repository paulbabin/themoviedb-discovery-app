import type { Meta, StoryObj } from 'storybook';

type WidgetState = 'loading' | 'empty' | 'error' | 'ready';

type WidgetStatePreviewProps = {
  state: WidgetState;
};

const widgetStateContent: Record<
  WidgetState,
  { label: string; message: string }
> = {
  loading: {
    label: 'Chargement',
    message: 'Les données du widget sont en cours de chargement.',
  },
  empty: {
    label: 'Vide',
    message: 'Aucune donnée à afficher pour le moment.',
  },
  error: {
    label: 'Erreur',
    message: 'Les données du widget ne sont pas disponibles.',
  },
  ready: {
    label: 'Prêt',
    message: 'Les données du widget sont disponibles.',
  },
};

function WidgetStatePreview({ state }: WidgetStatePreviewProps) {
  const content = widgetStateContent[state];

  return (
    <article aria-label={`État de widget : ${content.label}`}>
      <h2>{content.label}</h2>
      <p>{content.message}</p>
    </article>
  );
}

const meta = {
  title: 'Dashboard/Future widget states',
  component: WidgetStatePreview,
  tags: ['autodocs'],
  args: {
    state: 'ready',
  },
  argTypes: {
    state: {
      control: 'select',
      options: ['loading', 'empty', 'error', 'ready'],
    },
  },
} satisfies Meta<typeof WidgetStatePreview>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Loading: Story = {
  args: { state: 'loading' },
};

export const Empty: Story = {
  args: { state: 'empty' },
};

export const Error: Story = {
  args: { state: 'error' },
};

export const Ready: Story = {
  args: { state: 'ready' },
};
