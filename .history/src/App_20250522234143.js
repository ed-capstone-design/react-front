import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<h2>Home Page</h2>} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;
