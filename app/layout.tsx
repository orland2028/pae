import type { Metadata, Viewport } from 'next'
import './globals.css'

import { Providers } from '@/components/providers'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'InspectorLS — Validação de impressão industrial',
  description: 'Scanner contínuo para validação de data de validade, código juliano e inspeção de qualidade em embalagens industriais.',
  openGraph: {
    title: 'InspectorLS — Validação de impressão industrial',
    description: 'Scanner industrial de validade, código juliano LS e inspeção de qualidade.',
    type: 'website',
    images: [
      {
        url: '/pepsico-logo.png',
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InspectorLS — Validação de impressão industrial',
    description: 'Scanner contínuo para validação de data de validade, código juliano e inspeção de qualidade em embalagens industriais.',
    images: ['/pepsico-logo.png'],
  },
  icons: {
    icon: '/pepsico-logo.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className="bg-background text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
