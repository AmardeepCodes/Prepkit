import "./globals.css";

export const metadata = {
  title: "PrepKit AI — Precision Interview Intelligence",
  description:
    "Turn any job description into your personal, data-driven interview prep kit.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-background font-body-md text-body-md text-on-surface antialiased min-h-screen selection:bg-primary-fixed selection:text-on-primary-fixed">
        {children}
      </body>
    </html>
  );
}
