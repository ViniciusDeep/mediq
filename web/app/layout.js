import './globals.css';

export const metadata = {
  title: 'Mediq',
  description: 'Agendamento médico simples e confiável.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
