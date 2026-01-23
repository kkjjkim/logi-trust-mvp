import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppStore } from './services/store';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { PlaceList } from './pages/PlaceList';
import { PlaceDetail } from './pages/PlaceDetail';
import { OpsDashboard } from './pages/OpsDashboard';
import { OpsReport } from './pages/OpsReport';
import { DriverHome } from './pages/DriverHome';
import { DispatchDashboard } from './pages/DispatchDashboard';
import { DispatchAnnounce } from './pages/DispatchAnnounce';

const AppRoutes: React.FC = () => {
    return (
        <Layout>
          <Routes>
            <Route path="/" element={<Login />} />
            
            {/* Driver Routes */}
            <Route path="/driver" element={<DriverHome />} />
            <Route path="/driver/places" element={<PlaceList />} />
            <Route path="/driver/places/:id" element={<PlaceDetail />} />
            
            {/* Dispatch Routes */}
            <Route path="/dispatch" element={<DispatchDashboard />} />
            <Route path="/dispatch/announce" element={<DispatchAnnounce />} />
            
            {/* Ops Routes */}
            <Route path="/ops" element={<OpsDashboard />} />
            <Route path="/ops/report" element={<OpsReport />} />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Layout>
    );
}

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AppProvider>
  );
};

export default App;