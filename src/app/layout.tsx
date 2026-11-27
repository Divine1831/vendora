import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Vendora — Every Business Deserves Its Own Digital World",
  description: "A connected commerce operating system for ambitious businesses."
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
