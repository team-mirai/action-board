import { signUpAction } from "@/app/actions";
import { FormMessage, type Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import Link from "next/link";

export default async function Signup(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  const message = searchParams;
  return (
    <>
      <form className="flex flex-col min-w-72 max-w-72 mx-auto">
        <div className="flex justify-center items-center m-4">
          <Image src="/img/logo.png" alt="logo" width={114} height={96} />
        </div>
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
          <Input name="email" placeholder="you@example.com" required />
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            name="password"
            placeholder="Your password"
            minLength={6}
            required
          />
          <SubmitButton formAction={signUpAction} pendingText="Signing up...">
            サインアップ
          </SubmitButton>
          <FormMessage message={searchParams} />
        </div>
      </form>
    </>
  );
}
