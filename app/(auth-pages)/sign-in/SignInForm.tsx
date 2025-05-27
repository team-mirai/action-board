"use client";

import { signInActionWithState } from "@/app/actions";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useActionState } from "react";

export default function SignInForm() {
  const [state, formAction] = useActionState(signInActionWithState, null);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-2 [&>input]:mb-3 mt-8 min-w-72 max-w-72 mx-auto"
    >
      {state?.error && (
        <FormMessage message={{ error: state.error }} className="mb-4" />
      )}

      <Label htmlFor="email">メールアドレス</Label>
      <Input
        name="email"
        placeholder="you@example.com"
        required
        autoComplete="username"
        defaultValue={state?.formData?.email || ""}
      />

      <div className="flex justify-between items-center">
        <Label htmlFor="password">パスワード</Label>
        <Link
          className="text-xs text-foreground underline"
          href="/forgot-password"
        >
          パスワードを忘れた方
        </Link>
      </div>
      <Input
        type="password"
        name="password"
        placeholder="パスワード"
        required
        autoComplete="current-password"
      />

      <SubmitButton pendingText="ログイン中...">ログイン</SubmitButton>
    </form>
  );
}
