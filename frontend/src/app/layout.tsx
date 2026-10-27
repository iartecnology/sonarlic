import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SonarLIC | Radar de Licitaciones Inteligente para PYMEs',
  description: 'Búsqueda inteligente, semáforos de cumplimiento y alertas automatizadas para SECOP I y II.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-slate-50 antialiased">{children}</body>
    </html>
  );
}
