import HeaderAuth from "@/components/header-auth";
import Image from "next/image";
import Link from "next/link";

export default async function Navbar() {
  return (
    <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
      <div className="w-full flex justify-between items-center px-4 lg:px-6 text-sm">
        <div className="flex gap-5 items-center font-semibold">
          <Link href="/">
            <Image src="/img/logo.png" alt="logo" width={57} height={48} />
          </Link>
        </div>
        <div className="flex gap-6 items-center font-semibold">
          <Link href="/">ダッシュボード</Link>
          <Link href="/missions">ミッション</Link>
        </div>
        <HeaderAuth />
      </div>
    </nav>
  );
}
