import { ShoppingBag, Store, Truck, Package } from 'lucide-react';

type UserRole = 'buyer' | 'seller' | 'delivery' | 'hub';

interface RoleSelectProps {
  onSelectRole: (role: UserRole) => void;
}

const roles: { role: UserRole; label: string; labelHi: string; icon: React.ReactNode; desc: string }[] = [
  { role: 'buyer', label: 'Buyer', labelHi: 'खरीदार', icon: <ShoppingBag size={36} />, desc: 'सामान खरीदें' },
  { role: 'seller', label: 'Shopkeeper', labelHi: 'दुकानदार', icon: <Store size={36} />, desc: 'अपनी दुकान चलाएं' },
  { role: 'delivery', label: 'Delivery Partner', labelHi: 'डिलीवरी पार्टनर', icon: <Truck size={36} />, desc: 'ऑर्डर डिलीवर करें' },
  { role: 'hub', label: 'Packing Hub', labelHi: 'पैकिंग हब', icon: <Package size={36} />, desc: 'ऑर्डर पैक करें' },
];

const RoleSelect = ({ onSelectRole }: RoleSelectProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary">🛒 GramCart</h1>
          <p className="text-xl text-muted-foreground mt-2">गाँव की अपनी दुकान</p>
          <p className="text-sm text-muted-foreground mt-4">
            आप कौन हैं? / Who are you?
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {roles.map(r => (
            <button
              key={r.role}
              onClick={() => onSelectRole(r.role)}
              className="bg-card border-2 border-border hover:border-primary rounded-2xl p-6 flex flex-col items-center gap-3 transition-all active:scale-95 shadow-sm hover:shadow-md"
            >
              <div className="text-primary">{r.icon}</div>
              <span className="font-bold text-foreground text-sm">{r.label}</span>
              <span className="text-xs text-muted-foreground">{r.labelHi}</span>
              <span className="text-[11px] text-muted-foreground">{r.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoleSelect;
