"use client";

import { signUpAction } from "@/app/actions";
import { FormMessage, type Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { calculateAge } from "@/lib/utils/utils";
import Link from "next/link";
import { useState } from "react";

interface SignUpFormProps {
  searchParams: Message;
}

export default function SignUpForm({ searchParams }: SignUpFormProps) {
  const [isTermsAgreed, setIsTermsAgreed] = useState(false);
  const [isPrivacyAgreed, setIsPrivacyAgreed] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [ageError, setAgeError] = useState<string | null>(null);
  const [isFormValid, setIsFormValid] = useState(true);

  const isSuccess = "success" in searchParams;

  // 年齢チェック関数
  const verifyAge = (birthdate: string): boolean => {
    if (!birthdate) return false;

    const age = calculateAge(birthdate);
    if (age < 18) {
      const yearsToWait = 18 - age;
      const waitText = yearsToWait > 1 ? `あと${yearsToWait}年で` : "もうすぐ";
      setAgeError(
        `公職選挙法により18歳以上の方のみ選挙運動に参加できます。${waitText}参画できますので、その日を楽しみにお待ちください！`,
      );
      setIsFormValid(false);
      return false;
    }

    setAgeError(null);
    setIsFormValid(true);
    return true;
  };

  const handleChangeBirth = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setDateOfBirth(newValue);
    // 入力値が変更されたタイミングで年齢検証を実行
    if (newValue) {
      verifyAge(newValue);
    }
  };

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
        <Label htmlFor="email">メールアドレス</Label>
        <Input
          name="email"
          placeholder="you@example.com"
          required
          disabled={isSuccess}
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Label htmlFor="password">パスワード</Label>
        <Input
          type="password"
          name="password"
          placeholder="パスワード"
          minLength={6}
          required
          disabled={isSuccess}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Label htmlFor="date_of_birth">
          生年月日（満18歳以上である必要があります）
        </Label>
        <Input
          type="date"
          name="date_of_birth"
          required
          disabled={isSuccess}
          autoComplete="bday"
          value={dateOfBirth}
          onChange={handleChangeBirth}
        />
        {ageError && (
          <p className="text-primary text-sm font-medium mb-2">{ageError}</p>
        )}

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
          disabled={
            !isTermsAgreed ||
            !isPrivacyAgreed ||
            !email ||
            !password ||
            !dateOfBirth ||
            !isFormValid ||
            isSuccess
          }
        >
          サインアップ
        </SubmitButton>
        <FormMessage message={searchParams} />
      </div>
    </form>
  );
}
