import { Badge } from "@/components/ui/badge";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Basic/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["default", "secondary", "destructive", "outline"],
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

// 基本ストーリー
export const Default: Story = {
  args: {
    children: "Badge",
  },
};

export const Playground: Story = {
  args: {
    children: "Playground Badge",
    variant: "default",
  },
};

// バリアント別ストーリー
export const Primary: Story = {
  args: {
    children: "Primary",
    variant: "default",
  },
};

export const Secondary: Story = {
  args: {
    children: "Secondary",
    variant: "secondary",
  },
};

export const Destructive: Story = {
  args: {
    children: "Destructive",
    variant: "destructive",
  },
};

export const Outline: Story = {
  args: {
    children: "Outline",
    variant: "outline",
  },
};

// 異なるテキスト長
export const ShortText: Story = {
  args: {
    children: "New",
  },
};

export const LongText: Story = {
  args: {
    children: "This is a longer badge text",
  },
};

export const WithNumber: Story = {
  args: {
    children: "99+",
  },
};

export const WithEmoji: Story = {
  args: {
    children: "🎉 Celebration",
  },
};

// 全バリアント表示
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),
};

// 実用例
export const StatusBadges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">Active</Badge>
      <Badge variant="secondary">Pending</Badge>
      <Badge variant="destructive">Error</Badge>
      <Badge variant="outline">Draft</Badge>
    </div>
  ),
};

export const NotificationBadges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="destructive">3</Badge>
      <Badge variant="default">12</Badge>
      <Badge variant="secondary">99+</Badge>
    </div>
  ),
};

export const CategoryBadges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="outline">React</Badge>
      <Badge variant="outline">TypeScript</Badge>
      <Badge variant="outline">Storybook</Badge>
      <Badge variant="outline">TailwindCSS</Badge>
    </div>
  ),
};

// サイズ比較
export const DifferentSizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge>S</Badge>
      <Badge>Medium</Badge>
      <Badge>This is a longer badge</Badge>
    </div>
  ),
};
