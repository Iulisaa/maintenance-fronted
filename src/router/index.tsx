import { Navigate, createBrowserRouter } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import EquipmentsPage from '../pages/EquipmentsPage';
import MyTasksPage from '../pages/MyTasksPage';
import EngineersPage from '../pages/EngineersPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/my-tasks" replace /> },
      { path: 'my-tasks', element: <MyTasksPage /> },
      { path: 'equipments', element: <EquipmentsPage /> },
     { path: 'engineers', element: <EngineersPage /> }
    ],
  },
]);
