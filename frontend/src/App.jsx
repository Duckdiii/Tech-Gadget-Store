import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import AppRoutes from './routes'
import ChatWidget from './features/chatbot/components/ChatWidget'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <ChatWidget />
      </BrowserRouter>
    </AuthProvider>
  )
}
