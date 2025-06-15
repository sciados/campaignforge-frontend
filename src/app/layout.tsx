import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '../lib/hooks/useAuth'
import { UserTierProvider } from '../lib/hooks/useUserTier'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CampaignForge AI',
  description: 'Multimedia Campaign Creation Platform - Transform any content into complete marketing campaigns',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <UserTierProvider>
            {children}
          </UserTierProvider>
        </AuthProvider>
      </body>
    </html>
  )
}