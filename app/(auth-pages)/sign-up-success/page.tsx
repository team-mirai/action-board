import { FormMessage } from "@/components/form-message";
import Image from "next/image";
import Link from "next/link";

export default function SignUpSuccess({
  searchParams,
}: {
  searchParams: { message?: string };
}) {
  return (
    <div className="flex-1 flex flex-col min-w-72">
      <div className="flex justify-center items-center m-4">
        <Image src="/img/logo.png" alt="logo" width={114} height={96} />
      </div>
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-2xl font-medium text-center mb-2">
          アカウント作成完了
        </h1>
        <FormMessage
          message={{
            success:
              "ご登録頂きありがとうございます！\n" +
              "認証メールをお送りしました。\n" +
              "メールに記載のURLをクリックして、アカウントを有効化してください。",
          }}
          className="mt-8"
        />
      </div>
    </div>
  );
}
