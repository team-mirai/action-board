import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Basic/Checkbox",
  component: Checkbox,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    checked: {
      control: { type: "boolean" },
    },
    disabled: {
      control: { type: "boolean" },
    },
    required: {
      control: { type: "boolean" },
    },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

// 基本ストーリー
export const Default: Story = {
  args: {},
};

export const Playground: Story = {
  args: {
    checked: false,
    disabled: false,
  },
};

// 状態別ストーリー
export const Unchecked: Story = {
  args: {
    checked: false,
  },
};

export const Checked: Story = {
  args: {
    checked: true,
  },
};

export const Indeterminate: Story = {
  args: {
    checked: "indeterminate",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const DisabledChecked: Story = {
  args: {
    checked: true,
    disabled: true,
  },
};

// ラベル付きストーリー
export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Checkbox id="terms" />
      <Label htmlFor="terms">Accept terms and conditions</Label>
    </div>
  ),
};

export const WithLabelChecked: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Checkbox id="terms-checked" defaultChecked />
      <Label htmlFor="terms-checked">Accept terms and conditions</Label>
    </div>
  ),
};

export const WithLabelDisabled: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Checkbox id="terms-disabled" disabled />
      <Label htmlFor="terms-disabled" className="text-muted-foreground">
        Accept terms and conditions (disabled)
      </Label>
    </div>
  ),
};

// 複数選択例
export const MultipleOptions: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox id="option1" />
        <Label htmlFor="option1">Option 1</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="option2" defaultChecked />
        <Label htmlFor="option2">Option 2</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="option3" />
        <Label htmlFor="option3">Option 3</Label>
      </div>
    </div>
  ),
};

// フォーム例
export const FormExample: Story = {
  render: () => (
    <form className="space-y-4">
      <div className="space-y-3">
        <Label className="text-base font-medium">Preferences</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="email-notifications" defaultChecked />
            <Label htmlFor="email-notifications">Email notifications</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="sms-notifications" />
            <Label htmlFor="sms-notifications">SMS notifications</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="push-notifications" defaultChecked />
            <Label htmlFor="push-notifications">Push notifications</Label>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <Label className="text-base font-medium">Privacy</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="analytics" />
            <Label htmlFor="analytics">Allow analytics</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="marketing" />
            <Label htmlFor="marketing">Marketing emails</Label>
          </div>
        </div>
      </div>
    </form>
  ),
};

// 全選択/部分選択例
export const SelectAll: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox id="select-all" checked="indeterminate" />
        <Label htmlFor="select-all" className="font-medium">
          Select all
        </Label>
      </div>
      <div className="ml-6 space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox id="item1" defaultChecked />
          <Label htmlFor="item1">Item 1</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="item2" defaultChecked />
          <Label htmlFor="item2">Item 2</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="item3" />
          <Label htmlFor="item3">Item 3</Label>
        </div>
      </div>
    </div>
  ),
};

// 説明付きオプション
export const WithDescription: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-start space-x-2">
        <Checkbox id="feature1" className="mt-1" />
        <div className="space-y-1">
          <Label htmlFor="feature1">Enable feature 1</Label>
          <p className="text-sm text-muted-foreground">
            This feature will improve your experience by providing additional
            functionality.
          </p>
        </div>
      </div>
      <div className="flex items-start space-x-2">
        <Checkbox id="feature2" className="mt-1" defaultChecked />
        <div className="space-y-1">
          <Label htmlFor="feature2">Enable feature 2</Label>
          <p className="text-sm text-muted-foreground">
            This feature is recommended for most users and is enabled by
            default.
          </p>
        </div>
      </div>
    </div>
  ),
};

// 必須フィールド
export const Required: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Checkbox id="required-terms" required />
      <Label htmlFor="required-terms">
        I agree to the terms and conditions
        <span className="text-red-500 ml-1">*</span>
      </Label>
    </div>
  ),
};

// 全状態表示
export const AllStates: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox checked={false} />
        <Label>Unchecked</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox checked={true} />
        <Label>Checked</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox checked="indeterminate" />
        <Label>Indeterminate</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox disabled />
        <Label className="text-muted-foreground">Disabled unchecked</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox checked disabled />
        <Label className="text-muted-foreground">Disabled checked</Label>
      </div>
    </div>
  ),
};
