import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Navbar } from "@/components/navbar"
import type React from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AWS Quiz",
  description: "Test your AWS Solutions Architect knowledge"
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-white`}>
        <Navbar />
        <main className="container mx-auto py-8 px-4">{children}</main>
      </body>
    </html>
  )
}