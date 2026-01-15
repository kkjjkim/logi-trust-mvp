import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './services/store';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { PlaceList } from './pages/PlaceList';
import { PlaceDetail } from './pages/PlaceDetail';
import { OpsDashboard } from './pages/OpsDashboard';
import { OpsReport } from './pages/OpsReport';

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/places" element={<PlaceList />} />
            <Route path="/places/:id" element={<PlaceDetail />} />
            <Route path="/ops" element={<OpsDashboard />} />
            <Route path="/ops/report" element={<OpsReport />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Layout>
      </Router>
    </AppProvider>
  );
};

export default App;