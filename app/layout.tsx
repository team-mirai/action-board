import Navbar from "@/components/navbar";
import { ThemeProvider } from "next-themes";
import { Geist } from "next/font/google";
import Footer from "./footer";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "チームみらい アクションボード",
  description: "チームみらいのアクションボードです。",
  openGraph: {
    title: "チームみらい アクションボード",
    description: "チームみらいのアクションボードです。",
    images: [
      {
        url: "/img/logo.png",
        width: 1200,
        height: 630,
        alt: "チームみらい アクションボード",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "チームみらい アクションボード",
    description: "チームみらいのアクションボードです。",
    images: ["/img/logo.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
    ],
    apple: "/apple-icon.png",
  },
};

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={geistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <main className="md:container md:mx-auto flex flex-col items-center">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
