import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import RoleSelect from './RoleSelect';
import AuthPage from './AuthPage';
import RoleRegistration from './RoleRegistration';
import BuyerHome from './BuyerHome';
import SellerDashboard from './SellerDashboard';
import DeliveryDashboard from './DeliveryDashboard';
import HubDashboard from './HubDashboard';

type UserRole = 'buyer' | 'seller' | 'delivery' | 'hub';

const Index = () => {
  const { user, loading, role, profile } = useApp();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <span className="text-5xl">🛒</span>
          <p className="text-muted-foreground mt-3 text-lg">Loading... / लोड हो रहा है...</p>
        </div>
      </div>
    );
  }

  // Step 1: If not logged in and no role selected → show role selection
  if (!user && !selectedRole) return <RoleSelect onSelectRole={setSelectedRole} />;

  // Step 2: If role selected but not logged in → show role-specific auth
  if (!user && selectedRole) return <AuthPage selectedRole={selectedRole} onBack={() => setSelectedRole(null)} />;

  // Step 3: If logged in but registration not complete → show registration
  const isRegistered = profile?.registration_complete === true;
  if (!isRegistered) return <RoleRegistration />;

  // Step 4: Show role-specific dashboard
  if (role === 'buyer') return <BuyerHome />;
  if (role === 'seller') return <SellerDashboard />;
  if (role === 'delivery') return <DeliveryDashboard />;
  if (role === 'hub') return <HubDashboard />;

  return <RoleSelect onSelectRole={setSelectedRole} />;
};

export default Index;
