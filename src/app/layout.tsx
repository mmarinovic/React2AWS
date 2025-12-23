import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "React2AWS - Infrastructure as React Components",
  description: "Define AWS infrastructure using React components. Generate Terraform.",
  metadataBase: new URL("https://react2aws.com"),
  keywords: [
    "AWS",
    "React",
    "Terraform",
    "Infrastructure as Code",
    "IaC",
    "Cloud",
    "DevOps",
    "VPC",
    "Lambda",
    "RDS",
    "S3",
    "EC2",
  ],
  authors: [{ name: "React2AWS" }],
  creator: "React2AWS",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://react2aws.com",
    siteName: "React2AWS",
    title: "React2AWS - Infrastructure as React Components",
    description:
      "Define AWS infrastructure using React components. Generate Terraform.",
    images: [
      {
        url: "/opengraph-image.svg",
        width: 1200,
        height: 630,
        alt: "React2AWS - Infrastructure as React Components",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "React2AWS - Infrastructure as React Components",
    description:
      "Define AWS infrastructure using React components. Generate Terraform.",
    images: ["/twitter-image.svg"],
    creator: "@react2aws",
  },
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
