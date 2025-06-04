import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1>Welcome to React Router</h1>
        </header>
        <Routes>
          <Route path="/" element={<h2>Home Page</h2>} />
          <Route path="/about" element={<h2>About Page</h2>} />
          <Route path="/contact" element={<h2>Contact Page</h2>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
