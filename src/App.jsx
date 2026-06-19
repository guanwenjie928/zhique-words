import { HashRouter, Routes, Route } from 'react-router-dom'
import { StorageProvider } from './context/StorageContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import Practice from './pages/Practice'
import WrongBook from './pages/WrongBook'
import Stats from './pages/Stats'
import Daily from './pages/Daily'

export default function App() {
  return (
    <StorageProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/wrong-book" element={<WrongBook />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/daily" element={<Daily />} />
          </Routes>
        </Layout>
      </HashRouter>
    </StorageProvider>
  )
}
