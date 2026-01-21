import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Home } from './pages/Home';
import { History } from './pages/History';
import { Statistics } from './pages/Statistics';
import { Settings } from './pages/Settings';
import { initializeSettings } from './services/database';

function App() {
  useEffect(() => {
    // Initialize settings on first load
    initializeSettings();
  }, []);

  return (
    <BrowserRouter basename="/initial-test">
      <div className="min-h-screen bg-slate-900 flex flex-col">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/history" element={<History />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
        <Navigation />
      </div>
    </BrowserRouter>
  );
}

export default App;
