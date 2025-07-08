'use client'

import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-inter'
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <title>RodgersDigital</title>
        <meta name="description" content="Intelligent Campaign Creation Platform" />
      </head>
      <body className="font-inter antialiased bg-white text-black">
        {children}
      </body>
    </html>
  )
}