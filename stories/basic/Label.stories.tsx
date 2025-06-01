import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Basic/Label",
  component: Label,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    htmlFor: {
      control: { type: "text" },
    },
  },
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

// 基本ストーリー
export const Default: Story = {
  args: {
    children: "Label",
  },
};

export const Playground: Story = {
  args: {
    children: "Playground Label",
    htmlFor: "playground-input",
  },
};

// 基本的な使用例
export const BasicLabel: Story = {
  render: () => <Label>Basic Label</Label>,
};

export const WithHtmlFor: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="example-input">Email Address</Label>
      <Input id="example-input" type="email" placeholder="Enter your email" />
    </div>
  ),
};

// 必須フィールド
export const Required: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="required-input">
        Full Name
        <span className="text-red-500 ml-1">*</span>
      </Label>
      <Input id="required-input" placeholder="Enter your full name" required />
    </div>
  ),
};

export const RequiredWithAsterisk: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="required-email">
        Email Address <span className="text-destructive">*</span>
      </Label>
      <Input
        id="required-email"
        type="email"
        placeholder="your@email.com"
        required
      />
    </div>
  ),
};

// 説明付きラベル
export const WithDescription: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="password-input">Password</Label>
      <Input id="password-input" type="password" placeholder="Enter password" />
      <p className="text-sm text-muted-foreground">
        Must be at least 8 characters long
      </p>
    </div>
  ),
};

export const WithHelperText: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="username-input">Username</Label>
      <Input id="username-input" placeholder="Enter username" />
      <p className="text-sm text-muted-foreground">
        This will be your public display name
      </p>
    </div>
  ),
};

// チェックボックスとの組み合わせ
export const WithCheckbox: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Checkbox id="terms-checkbox" />
      <Label htmlFor="terms-checkbox">
        I agree to the terms and conditions
      </Label>
    </div>
  ),
};

export const WithCheckboxRequired: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Checkbox id="privacy-checkbox" />
      <Label htmlFor="privacy-checkbox">
        I accept the privacy policy
        <span className="text-red-500 ml-1">*</span>
      </Label>
    </div>
  ),
};

// フォーム例
export const FormLabels: Story = {
  render: () => (
    <form className="space-y-4 w-full max-w-sm">
      <div className="space-y-2">
        <Label htmlFor="first-name">First Name</Label>
        <Input id="first-name" placeholder="John" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="last-name">Last Name</Label>
        <Input id="last-name" placeholder="Doe" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email-form">
          Email Address
          <span className="text-red-500 ml-1">*</span>
        </Label>
        <Input id="email-form" type="email" placeholder="john@example.com" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" />
        <p className="text-sm text-muted-foreground">Optional</p>
      </div>
    </form>
  ),
};

// 異なるスタイル
export const BoldLabel: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="bold-input" className="font-bold">
        Bold Label
      </Label>
      <Input id="bold-input" placeholder="Input with bold label" />
    </div>
  ),
};

export const LargeLabel: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="large-input" className="text-lg">
        Large Label
      </Label>
      <Input id="large-input" placeholder="Input with large label" />
    </div>
  ),
};

export const SmallLabel: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="small-input" className="text-xs">
        Small Label
      </Label>
      <Input id="small-input" placeholder="Input with small label" />
    </div>
  ),
};

// 無効状態
export const DisabledField: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="disabled-input" className="text-muted-foreground">
        Disabled Field
      </Label>
      <Input
        id="disabled-input"
        placeholder="This field is disabled"
        disabled
      />
    </div>
  ),
};

// エラー状態
export const ErrorState: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="error-input" className="text-destructive">
        Email Address
      </Label>
      <Input
        id="error-input"
        type="email"
        placeholder="Enter email"
        className="border-destructive"
      />
      <p className="text-sm text-destructive">
        Please enter a valid email address
      </p>
    </div>
  ),
};

// 成功状態
export const SuccessState: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="success-input" className="text-green-600">
        Username
      </Label>
      <Input
        id="success-input"
        placeholder="Enter username"
        className="border-green-500"
      />
      <p className="text-sm text-green-600">Username is available!</p>
    </div>
  ),
};

// グループ化されたフィールド
export const FieldGroup: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-semibold">Personal Information</Label>
        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="group-first-name">First Name</Label>
            <Input id="group-first-name" placeholder="John" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="group-last-name">Last Name</Label>
            <Input id="group-last-name" placeholder="Doe" />
          </div>
        </div>
      </div>
      <div>
        <Label className="text-base font-semibold">Contact Information</Label>
        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="group-email">Email</Label>
            <Input
              id="group-email"
              type="email"
              placeholder="john@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="group-phone">Phone</Label>
            <Input
              id="group-phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
            />
          </div>
        </div>
      </div>
    </div>
  ),
};

// 全バリエーション表示
export const AllVariations: Story = {
  render: () => (
    <div className="space-y-4 w-full max-w-sm">
      <div className="space-y-2">
        <Label htmlFor="normal">Normal Label</Label>
        <Input id="normal" placeholder="Normal input" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="required-var" className="font-medium">
          Required Label <span className="text-red-500">*</span>
        </Label>
        <Input id="required-var" placeholder="Required input" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="disabled-var" className="text-muted-foreground">
          Disabled Label
        </Label>
        <Input id="disabled-var" placeholder="Disabled input" disabled />
      </div>
      <div className="space-y-2">
        <Label htmlFor="error-var" className="text-destructive">
          Error Label
        </Label>
        <Input
          id="error-var"
          placeholder="Error input"
          className="border-destructive"
        />
      </div>
    </div>
  ),
};
