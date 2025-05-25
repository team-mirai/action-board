import { signInAction } from "@/app/actions";
import { FormMessage, type Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import Link from "next/link";

export default async function Login(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams;
  return (
    <form className="flex-1 flex flex-col min-w-72">
      <div className="flex justify-center items-center m-4">
        <Image src="/img/logo.png" alt="logo" width={114} height={96} />
      </div>
      <h1 className="text-2xl font-medium text-center mb-2">ログイン</h1>
      <p className="text-sm text-foreground text-center">
        まだ参画していない方は{" "}
        <Link className="text-foreground font-medium underline" href="/sign-up">
          こちら
        </Link>
      </p>
      <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
        <Label htmlFor="email">メールアドレス</Label>
        <Input
          name="email"
          placeholder="you@example.com"
          required
          autoComplete="username"
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
        <SubmitButton pendingText="Signing In..." formAction={signInAction}>
          ログイン
        </SubmitButton>
        <FormMessage message={searchParams} />
      </div>
    </form>
  );
}
