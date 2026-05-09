import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'PalAbroad',
  description: '留学分享与社交平台',
}

export default function RootLayout({ children }) {
  return (
    <html lang="zh">
      <body>
        <Navbar />
        <main className="container">
          {children}
        </main>
      </body>
    </html>
  )
}
