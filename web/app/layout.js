import localFont from "next/font/local";
import "./globals.css";

// Self-hosted so the site works on Iranian hosting without Google Fonts.
const vazirmatn = localFont({
  src: "./fonts/Vazirmatn-Variable.woff2",
  variable: "--font-vazirmatn",
  weight: "100 900",
  display: "swap",
});

export const metadata = {
  title: {
    default: "کافه نارنج | منوی دیجیتال",
    template: "%s | کافه نارنج",
  },
  description: "منوی دیجیتال کافه نارنج؛ قهوه‌ی تازه‌دم، صبحانه‌ی خانگی و دسرهای روز.",
};

export const viewport = {
  themeColor: "#fbf6ef",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl" className={`${vazirmatn.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
