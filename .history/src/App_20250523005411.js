import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Signin from './pages/Signin'; // Signin 컴포넌트 import
import Signup from './pages/Signup'; // Signup 컴포넌트 import
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>

          <Route path="/" element={<Navigate to="/signin" replace />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />
          {/* 추가적인 라우트 예시 */}
          
          <Route path="/home" element={<h2>Home Page</h2>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
