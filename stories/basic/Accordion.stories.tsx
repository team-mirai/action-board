import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
  title: "Basic/Accordion",
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

// 基本ストーリー
export const Default: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-full max-w-md">
      <AccordionItem value="item-1">
        <AccordionTrigger>Is it accessible?</AccordionTrigger>
        <AccordionContent>
          Yes. It adheres to the WAI-ARIA design pattern.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Is it styled?</AccordionTrigger>
        <AccordionContent>
          Yes. It comes with default styles that matches the other components'
          aesthetic.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Is it animated?</AccordionTrigger>
        <AccordionContent>
          Yes. It's animated by default, but you can disable it if you prefer.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const Playground: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-full max-w-md">
      <AccordionItem value="playground-1">
        <AccordionTrigger>Playground Item 1</AccordionTrigger>
        <AccordionContent>
          This is the content for the first playground item.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="playground-2">
        <AccordionTrigger>Playground Item 2</AccordionTrigger>
        <AccordionContent>
          This is the content for the second playground item.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

// 単一展開（デフォルト）
export const SingleExpansion: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-full max-w-md">
      <AccordionItem value="item-1">
        <AccordionTrigger>What is React?</AccordionTrigger>
        <AccordionContent>
          React is a JavaScript library for building user interfaces,
          particularly web applications.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>What is TypeScript?</AccordionTrigger>
        <AccordionContent>
          TypeScript is a programming language developed by Microsoft that
          builds on JavaScript by adding static type definitions.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>What is Tailwind CSS?</AccordionTrigger>
        <AccordionContent>
          Tailwind CSS is a utility-first CSS framework for rapidly building
          custom user interfaces.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

// 複数展開
export const MultipleExpansion: Story = {
  render: () => (
    <Accordion type="multiple" className="w-full max-w-md">
      <AccordionItem value="item-1">
        <AccordionTrigger>Frontend Technologies</AccordionTrigger>
        <AccordionContent>
          <ul className="list-disc list-inside space-y-1">
            <li>React</li>
            <li>Vue.js</li>
            <li>Angular</li>
            <li>Svelte</li>
          </ul>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Backend Technologies</AccordionTrigger>
        <AccordionContent>
          <ul className="list-disc list-inside space-y-1">
            <li>Node.js</li>
            <li>Python</li>
            <li>Java</li>
            <li>Go</li>
          </ul>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Database Technologies</AccordionTrigger>
        <AccordionContent>
          <ul className="list-disc list-inside space-y-1">
            <li>PostgreSQL</li>
            <li>MongoDB</li>
            <li>Redis</li>
            <li>MySQL</li>
          </ul>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

// デフォルト展開状態
export const DefaultOpen: Story = {
  render: () => (
    <Accordion
      type="single"
      collapsible
      defaultValue="item-1"
      className="w-full max-w-md"
    >
      <AccordionItem value="item-1">
        <AccordionTrigger>This item is open by default</AccordionTrigger>
        <AccordionContent>
          This accordion item is expanded by default when the component loads.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>This item is closed by default</AccordionTrigger>
        <AccordionContent>
          This accordion item is collapsed by default.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

// 複数デフォルト展開
export const MultipleDefaultOpen: Story = {
  render: () => (
    <Accordion
      type="multiple"
      defaultValue={["item-1", "item-3"]}
      className="w-full max-w-md"
    >
      <AccordionItem value="item-1">
        <AccordionTrigger>Open by default</AccordionTrigger>
        <AccordionContent>This item is open by default.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Closed by default</AccordionTrigger>
        <AccordionContent>This item is closed by default.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Also open by default</AccordionTrigger>
        <AccordionContent>This item is also open by default.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

// FAQ例
export const FAQ: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-full max-w-lg">
      <AccordionItem value="faq-1">
        <AccordionTrigger>How do I reset my password?</AccordionTrigger>
        <AccordionContent>
          To reset your password, click on the "Forgot Password" link on the
          login page. Enter your email address and we'll send you instructions
          to reset your password.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="faq-2">
        <AccordionTrigger>How can I contact support?</AccordionTrigger>
        <AccordionContent>
          You can contact our support team through:
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Email: support@example.com</li>
            <li>Phone: +1 (555) 123-4567</li>
            <li>Live chat (available 9 AM - 5 PM EST)</li>
          </ul>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="faq-3">
        <AccordionTrigger>What payment methods do you accept?</AccordionTrigger>
        <AccordionContent>
          We accept all major credit cards (Visa, MasterCard, American Express),
          PayPal, and bank transfers for enterprise customers.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="faq-4">
        <AccordionTrigger>Is there a free trial available?</AccordionTrigger>
        <AccordionContent>
          Yes! We offer a 14-day free trial with full access to all features. No
          credit card required to start your trial.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

// リッチコンテンツ
export const WithRichContent: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-full max-w-md">
      <AccordionItem value="item-1">
        <AccordionTrigger>Getting Started</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-3">
            <p>Follow these steps to get started:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Install the dependencies</li>
              <li>Configure your environment</li>
              <li>Run the development server</li>
            </ol>
            <div className="bg-muted p-3 rounded-md">
              <code className="text-sm">npm install && npm run dev</code>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>API Reference</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-3">
            <h4 className="font-semibold">Available Methods:</h4>
            <div className="space-y-2">
              <div className="border rounded p-2">
                <code className="text-sm font-mono">getData()</code>
                <p className="text-sm text-muted-foreground mt-1">
                  Fetches data from the API
                </p>
              </div>
              <div className="border rounded p-2">
                <code className="text-sm font-mono">updateData(data)</code>
                <p className="text-sm text-muted-foreground mt-1">
                  Updates existing data
                </p>
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};
