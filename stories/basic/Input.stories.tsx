import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Meta, StoryObj } from "@storybook/react";
import { Eye, EyeOff, Search as SearchIcon } from "lucide-react";
import { useState } from "react";

const meta = {
  title: "Basic/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: { type: "select" },
      options: ["text", "email", "password", "number", "tel", "url", "search"],
    },
    placeholder: {
      control: { type: "text" },
    },
    disabled: {
      control: { type: "boolean" },
    },
    required: {
      control: { type: "boolean" },
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

// 基本ストーリー
export const Default: Story = {
  args: {
    placeholder: "Enter text...",
  },
};

export const Playground: Story = {
  args: {
    placeholder: "Playground input",
    type: "text",
  },
};

// タイプ別ストーリー
export const Text: Story = {
  args: {
    type: "text",
    placeholder: "Enter text",
  },
};

export const Email: Story = {
  args: {
    type: "email",
    placeholder: "Enter email",
  },
};

export const Password: Story = {
  args: {
    type: "password",
    placeholder: "Enter password",
  },
};

export const NumberInput: Story = {
  args: {
    type: "number",
    placeholder: "Enter number",
  },
};

export const SearchInput: Story = {
  args: {
    type: "search",
    placeholder: "Search...",
  },
};

export const Tel: Story = {
  args: {
    type: "tel",
    placeholder: "Enter phone number",
  },
};

export const Url: Story = {
  args: {
    type: "url",
    placeholder: "Enter URL",
  },
};

// 状態別ストーリー
export const Disabled: Story = {
  args: {
    placeholder: "Disabled input",
    disabled: true,
  },
};

export const WithValue: Story = {
  args: {
    defaultValue: "This input has a value",
  },
};

export const Required: Story = {
  args: {
    placeholder: "Required field",
    required: true,
  },
};

// ラベル付きストーリー
export const WithLabel: Story = {
  render: (args) => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="email">Email</Label>
      <Input {...args} id="email" type="email" placeholder="Email" />
    </div>
  ),
};

export const WithLabelAndHelperText: Story = {
  render: (args) => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="email-2">Email</Label>
      <Input {...args} id="email-2" type="email" placeholder="Email" />
      <p className="text-sm text-muted-foreground">Enter your email address.</p>
    </div>
  ),
};

// アイコン付きストーリー
export const WithIcon: Story = {
  render: (args) => (
    <div className="relative">
      <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input {...args} placeholder="Search..." className="pl-8" />
    </div>
  ),
};

// パスワード表示切り替え
export const PasswordToggle: Story = {
  render: () => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          placeholder="Enter password"
          className="pr-10"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground hover:text-foreground"
        >
          {showPassword ? <EyeOff /> : <Eye />}
        </button>
      </div>
    );
  },
};

// フォーム例
export const FormExample: Story = {
  render: () => (
    <form className="space-y-4 w-full max-w-sm">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" placeholder="Your name" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email-form">Email</Label>
        <Input id="email-form" type="email" placeholder="your@email.com" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password-form">Password</Label>
        <Input id="password-form" type="password" placeholder="Password" />
      </div>
    </form>
  ),
};

// 全タイプ表示
export const AllTypes: Story = {
  render: () => (
    <div className="space-y-4 w-full max-w-sm">
      <Input type="text" placeholder="Text input" />
      <Input type="email" placeholder="Email input" />
      <Input type="password" placeholder="Password input" />
      <Input type="number" placeholder="Number input" />
      <Input type="search" placeholder="Search input" />
      <Input type="tel" placeholder="Tel input" />
      <Input type="url" placeholder="URL input" />
    </div>
  ),
};
