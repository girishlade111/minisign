import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "v0 minisign - Simple Document Signing",
  description: "Upload PDF → Share link → Get signature. Simple document signing with your X account.",
  keywords: ["document signing", "PDF signature", "electronic signature", "esign", "digital signature"],
  authors: [{ name: "v0.dev" }],
  creator: "v0.dev",
  publisher: "v0.dev",

  // Open Graph
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://v0-minisign.vercel.app/",
    siteName: "v0 minisign",
    title: "v0 minisign - Simple Document Signing",
    description: "Upload PDF → Share link → Get signature. Simple document signing with your X account.",
    images: [
      {
        url: "https://opengraph.b-cdn.net/production/images/cce76c4f-9032-40c7-b175-3dcb0487af13.png?token=SFveD9yxqQOVPKlOlPjckHNeC2vxYki3F5fTW_h0jZE&height=612&width=1200&expires=33286779881",
        width: 1200,
        height: 612,
        alt: "v0 minisign - Simple Document Signing",
        type: "image/png",
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    site: "@vercel",
    creator: "@vercel",
    title: "v0 minisign - Simple Document Signing",
    description: "Upload PDF → Share link → Get signature. Simple document signing with your X account.",
    images: [
      "https://opengraph.b-cdn.net/production/images/cce76c4f-9032-40c7-b175-3dcb0487af13.png?token=SFveD9yxqQOVPKlOlPjckHNeC2vxYki3F5fTW_h0jZE&height=612&width=1200&expires=33286779881",
    ],
  },

  // Additional metadata
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // App metadata
  applicationName: "v0 minisign",
  category: "productivity",

  // Icons
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "any" }],
  },

  // Theme
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],

  // Viewport
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },

  // Google Site Verification
  verification: {
    google: "FW6k-UzSMtUMFD-gJ3PMnYJ9rJotsieu6GSyFfbPy6E",
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Google Site Verification */}
        <meta name="google-site-verification" content="FW6k-UzSMtUMFD-gJ3PMnYJ9rJotsieu6GSyFfbPy6E" />

        {/* Security Meta Tags */}
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="robots" content="index,follow" />
        <meta name="googlebot" content="index,follow" />

        {/* Facebook Meta Tags */}
        <meta property="og:url" content="https://v0-minisign.vercel.app/" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="v0 minisign - Simple Document Signing" />
        <meta
          property="og:description"
          content="Upload PDF → Share link → Get signature. Simple document signing with your X account."
        />
        <meta
          property="og:image"
          content="https://opengraph.b-cdn.net/production/images/cce76c4f-9032-40c7-b175-3dcb0487af13.png?token=SFveD9yxqQOVPKlOlPjckHNeC2vxYki3F5fTW_h0jZE&height=612&width=1200&expires=33286779881"
        />

        {/* Twitter Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content="v0-minisign.vercel.app" />
        <meta property="twitter:url" content="https://v0-minisign.vercel.app/" />
        <meta name="twitter:title" content="v0 minisign - Simple Document Signing" />
        <meta
          name="twitter:description"
          content="Upload PDF → Share link → Get signature. Simple document signing with your X account."
        />
        <meta
          name="twitter:image"
          content="https://opengraph.b-cdn.net/production/images/cce76c4f-9032-40c7-b175-3dcb0487af13.png?token=SFveD9yxqQOVPKlOlPjckHNeC2vxYki3F5fTW_h0jZE&height=612&width=1200&expires=33286779881"
        />

        {/* Additional performance and mobile optimization */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="v0 minisign" />

        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://api.twitter.com" />
        <link rel="dns-prefetch" href="https://vercel-storage.com" />

        {/* Canonical URL */}
        <link rel="canonical" href="https://v0-minisign.vercel.app/" />
      </head>
      <body>
        <noscript>
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "white",
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              padding: "20px",
              textAlign: "center",
            }}
          >
            <h1>JavaScript Required</h1>
            <p>
              This application requires JavaScript to function properly. Please enable JavaScript in your browser
              settings.
            </p>
          </div>
        </noscript>
        {children}
      </body>
    </html>
  )
}
