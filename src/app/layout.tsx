import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "O Que Fazer — Atividades por Região",
  description: "Descubra atividades e eventos na sua região com ajuda de IA",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
