"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

interface RankingTabsProps {
  children: React.ReactNode;
}

export function RankingTabs({ children }: RankingTabsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "overall";

  const isMissionPage = pathname.includes("ranking-mission");

  return (
    <Tabs defaultValue={isMissionPage ? "mission" : tab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="overall" asChild>
          <Link href="/ranking">全体</Link>
        </TabsTrigger>
        <TabsTrigger value="mission" asChild>
          <Link href="/ranking/ranking-mission">ミッション別</Link>
        </TabsTrigger>
      </TabsList>
      <TabsContent value={isMissionPage ? "mission" : "overall"}>
        {children}
      </TabsContent>
    </Tabs>
  );
}
