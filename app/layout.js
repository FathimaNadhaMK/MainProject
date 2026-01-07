import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import Header from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";
import { dark } from "@clerk/themes";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Guidely : AI Career Coach",
  description: "Guidely is an AI-driven career guidance platform that personalizes resume building, mock interviews, skill gap analysis, and career insights to help students become industry-ready.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="icon" href="/logo.png" sizes="any" />
        </head>
        <body className={`${inter.className}`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <Header />
            <main className="min-h-screen">{children}</main>
            <Toaster richColors />

<footer className="bg-gradient-to-t from-gray-900 to-black py-12 border-t border-gray-800">
  <div className="container mx-auto px-4 text-center">
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="flex items-center justify-center space-x-2">
        <div className="h-px w-12 bg-gradient-to-r from-transparent to-pink-500/50"></div>
        <p className="font-mono text-xs tracking-widest text-gray-400 uppercase">
          Crafted with passion
        </p>
        <div className="h-px w-12 bg-gradient-to-l from-transparent to-pink-500/50"></div>
      </div>
      
      <div className="group relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
        <div className="relative">
          <span className="text-xl md:text-2xl font-medium">
            <span className="text-gray-300">Engineered by Team 12</span>
            <span className="text-2xl md:text-3xl font-bold">
            
            </span>
          </span>
        </div>
      </div>
      
      <p className="font-light text-gray-500 text-sm mt-2">
        Innovating one line at a time
      </p>
      
      <div className="mt-6 flex items-center justify-center space-x-4">
        <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></div>
        <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse delay-150"></div>
        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse delay-300"></div>
      </div>
    </div>
  </div>
</footer>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
