"use client";

import { signUpActionWithState } from "@/app/actions";
import { FormMessage, type Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { calculateAge } from "@/lib/utils/utils";
import Link from "next/link";
import { useActionState, useCallback, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

interface SignUpFormProps {
  searchParams: Message;
}

// フォームコンポーネントを分離してuseFormStatusを使用
function SignUpFormContent({
  isTermsAgreed,
  isPrivacyAgreed,
  email,
  password,
  dateOfBirth,
  ageError,
  isFormValid,
  setIsTermsAgreed,
  setIsPrivacyAgreed,
  setEmail,
  setPassword,
  setDateOfBirth,
  handleChangeBirth,
}: {
  isTermsAgreed: boolean;
  isPrivacyAgreed: boolean;
  email: string;
  password: string;
  dateOfBirth: string;
  ageError: string | null;
  isFormValid: boolean;
  setIsTermsAgreed: (value: boolean) => void;
  setIsPrivacyAgreed: (value: boolean) => void;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  setDateOfBirth: (value: string) => void;
  handleChangeBirth: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const { pending } = useFormStatus();

  return (
    <>
      <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
        <Label htmlFor="email">メールアドレス</Label>
        <Input
          name="email"
          placeholder="you@example.com"
          required
          disabled={pending}
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Label htmlFor="password">パスワード</Label>
        <p className="text-xs text-muted-foreground mb-2">
          ※8文字以上で英数を含めてください。英数と一部記号が使えます。
        </p>
        <Input
          type="password"
          name="password"
          placeholder="パスワード"
          minLength={8}
          required
          disabled={pending}
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
          disabled={pending}
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
              disabled={pending}
            />
            <input
              type="hidden"
              name="terms_agreed"
              value={isTermsAgreed ? "true" : "false"}
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
              disabled={pending}
            />
            <input
              type="hidden"
              name="privacy_agreed"
              value={isPrivacyAgreed ? "true" : "false"}
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
          pendingText="サインアップ中..."
          disabled={
            !isTermsAgreed ||
            !isPrivacyAgreed ||
            !email ||
            !password ||
            !dateOfBirth ||
            !isFormValid ||
            pending
          }
        >
          サインアップ
        </SubmitButton>
      </div>
    </>
  );
}

export default function SignUpForm({ searchParams }: SignUpFormProps) {
  // useActionStateを使用してフォームの状態とメッセージを管理
  const [state, formAction] = useActionState(signUpActionWithState, null);

  // フォームの状態管理
  const [isTermsAgreed, setIsTermsAgreed] = useState(false);
  const [isPrivacyAgreed, setIsPrivacyAgreed] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [ageError, setAgeError] = useState<string | null>(null);
  const [isFormValid, setIsFormValid] = useState(true);

  // 年齢チェック関数
  const verifyAge = useCallback((birthdate: string): boolean => {
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
  }, []);

  // サーバーから返されたフォームデータで状態を復元
  useEffect(() => {
    if (state?.formData) {
      setIsTermsAgreed(state.formData.terms_agreed);
      setIsPrivacyAgreed(state.formData.privacy_agreed);
      setEmail(state.formData.email);
      setPassword(state.formData.password);
      setDateOfBirth(state.formData.date_of_birth);

      // 生年月日が設定されている場合は年齢チェックを実行
      if (state.formData.date_of_birth) {
        verifyAge(state.formData.date_of_birth);
      }
    }
  }, [state, verifyAge]);

  const handleChangeBirth = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setDateOfBirth(newValue);
    // 入力値が変更されたタイミングで年齢検証を実行
    if (newValue) {
      verifyAge(newValue);
    }
  };

  return (
    <form
      action={formAction}
      className="flex flex-col min-w-72 max-w-72 mx-auto"
    >
      <h1 className="text-2xl font-medium text-center mb-2">
        チームみらいに参画する
      </h1>
      <p className="text-sm text-foreground text-center">
        すでに参画済みの方は{" "}
        <Link className="text-primary font-medium underline" href="/sign-in">
          こちら
        </Link>
      </p>

      {/* サーバーアクションからのメッセージを表示 */}
      {state && <FormMessage className="mt-8" message={state} />}

      {/* 元のsearchParamsからのメッセージも表示（後方互換性のため） */}
      <FormMessage className="mt-8" message={searchParams} />

      <SignUpFormContent
        isTermsAgreed={isTermsAgreed}
        isPrivacyAgreed={isPrivacyAgreed}
        email={email}
        password={password}
        dateOfBirth={dateOfBirth}
        ageError={ageError}
        isFormValid={isFormValid}
        setIsTermsAgreed={setIsTermsAgreed}
        setIsPrivacyAgreed={setIsPrivacyAgreed}
        setEmail={setEmail}
        setPassword={setPassword}
        setDateOfBirth={setDateOfBirth}
        handleChangeBirth={handleChangeBirth}
      />
    </form>
  );
}
