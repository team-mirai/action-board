import { DifficultyBadge } from "@/components/ui/difficulty-badge";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "DifficultyBadge",
  component: DifficultyBadge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    difficulty: {
      control: { type: "select" },
      options: [1, 2, 3, 4, 5],
      description: "難易度レベル（1-5）",
    },
    showLabel: {
      control: { type: "boolean" },
      description: "ラベルを表示するかどうか",
    },
  },
} satisfies Meta<typeof DifficultyBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    difficulty: 1,
    showLabel: true,
  },
};

export const WithoutLabel: Story = {
  args: {
    difficulty: 3,
    showLabel: false,
  },
};

// 全ての難易度を一覧表示
export const AllDifficulties: Story = {
  args: {
    difficulty: 1,
    showLabel: true,
  },
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 items-center">
        <span className="w-20 text-sm">ラベル付き:</span>
        <DifficultyBadge difficulty={1} />
        <DifficultyBadge difficulty={2} />
        <DifficultyBadge difficulty={3} />
        <DifficultyBadge difficulty={4} />
        <DifficultyBadge difficulty={5} />
      </div>
      <div className="flex gap-2 items-center">
        <span className="w-20 text-sm">ラベルなし:</span>
        <DifficultyBadge difficulty={1} showLabel={false} />
        <DifficultyBadge difficulty={2} showLabel={false} />
        <DifficultyBadge difficulty={3} showLabel={false} />
        <DifficultyBadge difficulty={4} showLabel={false} />
        <DifficultyBadge difficulty={5} showLabel={false} />
      </div>
    </div>
  ),
};
