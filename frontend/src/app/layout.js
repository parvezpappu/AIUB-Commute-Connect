import "leaflet/dist/leaflet.css";
import "./globals.css";

export const metadata = {
  title: "AIUB Commute Connect",
  description: "Smart shared commute platform for AIUB students",
};


export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="h-full antialiased"
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}

