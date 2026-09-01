import './globals.css';

export const metadata = {
  title: 'Dados pessoais | Mediq',
  description: 'Complete seus dados pessoais para configurar sua conta Mediq.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
