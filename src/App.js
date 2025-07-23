import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Signin from './pages/Signin';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Drivers from './pages/Drivers';
import OperatingSchedule from './pages/OperatingSchedule';
import Insight from './pages/Insight';
import UserDetailPage from './pages/UserDetailPage';
import DriveDetail from './pages/DriveDetail';
import Layout from './components/Layout/Layout';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/signin" replace />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
          <Route path="/drivers" element={<Layout><Drivers /></Layout>} />
          <Route path="/operating-schedule" element={<Layout><OperatingSchedule /></Layout>} />
          <Route path="/insight" element={<Layout><Insight /></Layout>} />
          <Route path="/userdetailpage" element={<Layout><UserDetailPage /></Layout>} />
          <Route path="/drivedetail/:id" element={<Layout><DriveDetail /></Layout>} />
        </Routes>
      </div>
    </Router>
  );
}
export default App;
