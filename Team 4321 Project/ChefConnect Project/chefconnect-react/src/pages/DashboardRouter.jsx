import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardPage     from './DashboardPage';
import ChefDashboardPage from './ChefDashboardPage';

/**
 * DashboardRouter
 * --------------------------------------------------------------
 * Mounted at `/dashboard`. Reads the auth context and renders
 * whichever dashboard matches the signed-in user's role.
 *
 * No real auth wall — if nobody's signed in we fall back to the
 * customer dashboard so the demo still works. When a real backend
 * is in place, swap the fallback for `<Navigate to="/login" />`.
 */
export default function DashboardRouter() {
  const { user, isChef } = useAuth();

  // Demo fallback: no session, show the customer view.
  // Production swap: return <Navigate to="/login" replace />;
  if (!user) return <DashboardPage />;

  if (isChef) return <ChefDashboardPage />;
  return <DashboardPage />;
}
