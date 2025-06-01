import { forgotPasswordAction } from "@/app/actions";
import { FormMessage, type Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";

export default async function ForgotPassword(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  return (
    <>
      <form className="flex-1 flex flex-col w-full gap-2 text-foreground [&>input]:mb-6 min-w-72 max-w-72 mx-auto">
        <div className="flex justify-center items-center m-4">
          <Image src="/img/logo.png" alt="logo" width={114} height={96} />
        </div>
        <h1 className="text-2xl font-medium">パスワードを忘れた方</h1>
        <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
          <Label htmlFor="email">メールアドレス</Label>
          <Input
            name="email"
            placeholder="you@example.com"
            required
            autoComplete="username"
          />
          <SubmitButton formAction={forgotPasswordAction}>
            パスワードリセットメールを送信
          </SubmitButton>
          <FormMessage message={searchParams} />
        </div>
      </form>
    </>
  );
}
