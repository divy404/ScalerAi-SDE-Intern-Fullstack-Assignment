import './globals.css';

export const metadata = {
  title: 'Calendly Clone',
  description: 'Scheduling made simple',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
