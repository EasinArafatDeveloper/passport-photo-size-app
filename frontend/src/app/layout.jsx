import "./globals.css";

export const metadata = {
  title: "Passportify | Free AI Passport Photo Maker & Editor",
  description: "Create biometric-compliant, professional passport, visa, and ID photos in seconds. Automatic AI background removal, precise face alignment, and instant PDF download. 100% Free.",
  keywords: "passport photo maker, AI passport photo generator, biometric photo, visa photo editor, free passport photo online, ID photo creator, remove background passport",
  authors: [{ name: "Easin Arafat", url: "https://passport-size-photo-generate.scaleupweb.xyz/about" }],
  openGraph: {
    title: "Passportify | Free AI Passport Photo Maker",
    description: "Generate professional, biometric-compliant passport and visa photos instantly from your smartphone using AI.",
    url: "https://passport-size-photo-generate.scaleupweb.xyz",
    siteName: "Passportify",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Passportify | Free AI Passport Photo Maker",
    description: "Create biometric-compliant passport photos in seconds with AI. Automatic background removal and face alignment.",
  },
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
