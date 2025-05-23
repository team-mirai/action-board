"use client";

import { signUpAction } from "@/app/actions";
import { FormMessage, type Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState } from "react";

interface SignUpFormProps {
  searchParams: Message;
}

export default function SignUpForm({ searchParams }: SignUpFormProps) {
  const [isTermsAgreed, setIsTermsAgreed] = useState(false);
  const [isPrivacyAgreed, setIsPrivacyAgreed] = useState(false);

  const isSuccess = "success" in searchParams;

  return (
    <form className="flex flex-col min-w-72 max-w-72 mx-auto">
      <h1 className="text-2xl font-medium text-center mb-2">
        チームみらいに参画する
      </h1>
      <p className="text-sm text-foreground text-center">
        すでに参画済みの方は{" "}
        <Link className="text-primary font-medium underline" href="/sign-in">
          こちら
        </Link>
      </p>
      <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
        <Label htmlFor="email">Email</Label>
        <Input
          name="email"
          placeholder="you@example.com"
          required
          disabled={isSuccess}
          autoComplete="username"
        />
        <Label htmlFor="password">Password</Label>
        <Input
          type="password"
          name="password"
          placeholder="Your password"
          minLength={6}
          required
          disabled={isSuccess}
          autoComplete="new-password"
        />

        <div className="flex flex-col gap-3 mb-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={isTermsAgreed}
              onCheckedChange={(checked) => setIsTermsAgreed(checked === true)}
            />
            <Label
              htmlFor="terms"
              className="text-sm font-normal cursor-pointer"
            >
              <Link
                href="/terms"
                className="text-primary underline hover:no-underline"
                target="_blank"
              >
                利用規約
              </Link>
              に同意する
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="privacy"
              checked={isPrivacyAgreed}
              onCheckedChange={(checked) =>
                setIsPrivacyAgreed(checked === true)
              }
            />
            <Label
              htmlFor="privacy"
              className="text-sm font-normal cursor-pointer"
            >
              <Link
                href="/privacy"
                className="text-primary underline hover:no-underline"
                target="_blank"
              >
                プライバシーポリシー
              </Link>
              に同意する
            </Label>
          </div>
        </div>

        <SubmitButton
          formAction={signUpAction}
          pendingText="Signing up..."
          disabled={!isTermsAgreed || !isPrivacyAgreed || isSuccess}
        >
          サインアップ
        </SubmitButton>
        <FormMessage message={searchParams} />
      </div>
    </form>
  );
}
