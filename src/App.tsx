import { SimulatorPage } from './pages/SimulatorPage';
import { AdminPage } from './pages/AdminPage';

export default function App() {
  return window.location.pathname === '/admin' ? <AdminPage /> : <SimulatorPage />;
}
