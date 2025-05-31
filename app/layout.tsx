import Navbar from "@/components/navbar";
import { ThemeProvider } from "next-themes";
import { Geist } from "next/font/google";
import Footer from "./footer";
import "./globals.css";
import Script from "next/script";
import { generateRootMetadata } from "@/lib/metadata";


const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

//metadata.tsxでmetadataを管理
export const generateMetadata = generateRootMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={geistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="gtag-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
            </Script>
          </>
        )}
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
