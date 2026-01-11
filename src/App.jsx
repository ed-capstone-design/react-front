import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TokenProvider } from './components/Token/TokenProvider';
import Auth from './pages/Auth';
import ToastProvider from './components/Toast/ToastProvider';
import { NotificationProvider } from './components/Notification/contexts/NotificationProvider';
import './App.css';
import { WebSocketProvider } from './components/WebSocket/WebSocketProvider';
import { AuthGate, PrivateShell } from './RoutesComponents';

function App() {
  return (
    <TokenProvider>
      <ToastProvider>
        <WebSocketProvider>
          <NotificationProvider>
            <Router>
              <div className="App">
                <Routes>
                  {/* 공개(비보호) 경로 */}
                  <Route path="/" element={<AuthGate mode="entry" />} />
                  <Route path="/signin" element={<Auth />} />
                  {/* 기타 모든 경로는 보호 쉘로 라우팅 */}
                  <Route path="/*" element={<PrivateShell />} />
                </Routes>
              </div>
            </Router>
          </NotificationProvider>
        </WebSocketProvider>
      </ToastProvider>
    </TokenProvider>
  );
}
export default App;
