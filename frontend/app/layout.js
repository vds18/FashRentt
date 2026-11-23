
import "./globals.css";
import Navbar from "../components/Navbar";

export const metadata = {
  title: "FashRentt | Rent. Rock. Repeat.",
  description:
    "Discover fashion rentals, book your perfect look, and let FashRentt handle the journey from store to door.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}