import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const HomeLanding = () => <div style={{ padding: '2rem' }}><h1>🏠 Findr Landing Page & Feed Coming Soon</h1></div>;
const Login = () => <div style={{ padding: '2rem' }}><h1>🔑 Login Screen Coming Soon</h1></div>;
const Register = () => <div style={{ padding: '2rem' }}><h1>📝 Register Screen Coming Soon</h1></div>;
const Dashboard = () => <div style={{ padding: '2rem' }}><h1>📊 User Dashboard Coming Soon</h1></div>;

function App() {
  return (
    <Router>
      {/* Universal layout wrappers like your Nav Bar will sit right here */}
      
      <Routes>
        {/* Your Action-First Landing Page Feed */}
        <Route path="/" element={<HomeLanding />} />
        
        {/* Authentication Tracks */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Personal Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;