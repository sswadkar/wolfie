import type React from "react"
import type { Metadata } from "next"
import ClientLayout from "./ClientLayout"

export const metadata: Metadata = {
  title: "ARC Gen AI",
  description: "ARC Gen AI - Regulatory Document Assistant",
}

export default function RootLayout() {
  return <ClientLayout></ClientLayout>
}
