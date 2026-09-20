import type { Metadata } from "next";
import Navbar from "./components/Navbar"
import "./globals.css";

export const metadata: Metadata = {
  title: "ListForge",
  description: "Create dynamic lists with custom columns",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <Navbar/>
        {children}
        </body>
    </html>
  );
}