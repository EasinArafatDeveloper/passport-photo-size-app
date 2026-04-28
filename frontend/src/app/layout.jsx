import "./globals.css";

export const metadata = {
  title: "PassportAI - Instant Passport Photo Generator",
  description:
    "Generate professional passport photos instantly. AI-powered background removal, face alignment, and high-quality PDF output.",
  keywords:
    "passport photo, passport photo generator, AI photo, background removal, online passport photo",
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
