'use client'

import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <title>CampaignForge AI</title>
        <meta name="description" content="Multimedia Campaign Creation Platform" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}