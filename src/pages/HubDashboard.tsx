import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Package, MapPin, CheckSquare, Send, Printer, UserCheck, ClipboardCheck, UserCircle } from 'lucide-react';

const HubDashboard = () => {
  const { setRole } = useApp();
  const queryClient = useQueryClient();
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const { data: orders = [] } = useQuery({
    queryKey: ['hub-orders'],
    queryFn: async () => {
      const { data } = await supabase.from('orders').select('*, order_items(*)').in('status', ['accepted', 'packed']).order('created_at', { ascending: false });
      return data || [];
    },
    refetchInterval: 10000,
  });

  const { data: deliveryPartners = [] } = useQuery({
    queryKey: ['delivery-partners'],
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('*').eq('preferred_role', 'delivery').eq('registration_complete', true);
      return data || [];
    },
  });

  const updateStatus = async (orderId: string, status: string) => {
    await supabase.from('orders').update({ status: status as any }).eq('id', orderId);
    queryClient.invalidateQueries({ queryKey: ['hub-orders'] });
  };

  const assignPartner = async (orderId: string, partnerId: string) => {
    await supabase.from('orders').update({ delivery_partner_id: partnerId } as any).eq('id', orderId);
    queryClient.invalidateQueries({ queryKey: ['hub-orders'] });
  };

  const toggleCheckItem = (itemId: string) => {
    setCheckedItems(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const allItemsChecked = (items: any[]) => items.every((item: any) => checkedItems[item.id]);

  const villages = [...new Set(orders.map((o: any) => o.village))];

  const printLabel = (order: any) => {
    const labelWindow = window.open('', '_blank', 'width=400,height=300');
    if (!labelWindow) return;
    labelWindow.document.write(`
      <html><head><title>Label</title><style>
        body { font-family: sans-serif; padding: 20px; text-align: center; }
        .label { border: 2px dashed #333; padding: 20px; margin: 10px; }
        h2 { margin: 0; } .info { margin: 8px 0; font-size: 14px; }
      </style></head><body>
        <div class="label">
          <h2>📦 GramCart</h2>
          <p class="info"><strong>${order.order_number}</strong></p>
          <p class="info"><strong>To:</strong> ${order.buyer_name}</p>
          <p class="info"><strong>Village:</strong> ${order.village}</p>
          <p class="info"><strong>Phone:</strong> ${order.buyer_phone}</p>
          <p class="info"><strong>Items:</strong> ${order.order_items?.length || 0}</p>
          <p class="info"><strong>Total:</strong> ₹${order.total}</p>
          <p class="info"><strong>Payment:</strong> ${order.payment_method?.toUpperCase()}</p>
        </div>
        <script>window.print();</script>
      </body></html>
    `);
  };

  return (
    <div className="min-h-screen pb-6">
      <div className="bg-foreground text-background p-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => setRole(null)} className="touch-target"><ArrowLeft size={22} /></button>
          <h1 className="text-lg font-bold">📦 Packing Hub / पैकिंग हब</h1>
        </div>
        <a href="/profile" className="touch-target p-2"><UserCircle size={22} /></a>
      </div>

      <div className="p-3 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-primary/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-primary">{orders.filter((o: any) => o.status === 'accepted').length}</p>
            <p className="text-xs text-muted-foreground font-medium">To Pack</p>
          </div>
          <div className="bg-success/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-success">{orders.filter((o: any) => o.status === 'packed').length}</p>
            <p className="text-xs text-muted-foreground font-medium">Packed</p>
          </div>
          <div className="bg-accent/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-accent">{villages.length}</p>
            <p className="text-xs text-muted-foreground font-medium">Villages</p>
          </div>
        </div>

        {/* Village-wise orders */}
        {villages.map((village: string) => {
          const villageOrders = orders.filter((o: any) => o.village === village);
          return (
            <div key={village} className="space-y-2">
              <div className="flex items-center gap-2 font-bold text-foreground bg-muted/50 rounded-lg px-3 py-2">
                <MapPin size={16} className="text-primary" />
                <span>{village}</span>
                <span className="ml-auto text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">{villageOrders.length} orders</span>
              </div>

              {villageOrders.map((order: any) => (
                <div key={order.id} className="bg-card border border-border rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-sm">{order.buyer_name} · {order.order_number}</p>
                      <p className="text-xs text-muted-foreground capitalize">{order.delivery_type} · {order.payment_method} · ₹{order.total}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${order.status === 'accepted' ? 'bg-warning/20 text-warning' : 'bg-success/20 text-success'}`}>
                      {order.status === 'accepted' ? '⏳ To Pack' : '✅ Packed'}
                    </span>
                  </div>

                  {/* Packing Checklist */}
                  <div className="space-y-1 bg-muted/50 rounded-lg p-3">
                    <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                      <ClipboardCheck size={12} /> Packing Checklist
                    </p>
                    {order.order_items?.map((item: any) => (
                      <button
                        key={item.id}
                        onClick={() => toggleCheckItem(item.id)}
                        className={`flex items-center gap-2 text-sm w-full text-left p-1 rounded transition-colors ${checkedItems[item.id] ? 'line-through text-muted-foreground' : ''}`}
                      >
                        <CheckSquare size={14} className={checkedItems[item.id] ? 'text-success' : 'text-muted-foreground'} />
                        <span>{item.product_image} {item.product_name} × {item.quantity}</span>
                      </button>
                    ))}
                  </div>

                  {/* Label */}
                  <div className="bg-accent/20 rounded-lg p-3 border border-dashed border-accent">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-muted-foreground">📋 LABEL</p>
                        <p className="font-bold text-sm">{order.buyer_name} — {order.village}</p>
                        <p className="text-xs text-muted-foreground">{order.buyer_phone} · {order.order_number}</p>
                      </div>
                      <button
                        onClick={() => printLabel(order)}
                        className="bg-foreground text-background p-2 rounded-lg touch-target"
                        title="Print Label"
                      >
                        <Printer size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Assign Delivery Partner (for packed orders) */}
                  {order.status === 'packed' && deliveryPartners.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                        <UserCheck size={12} /> Assign Delivery Partner
                      </p>
                      <div className="flex gap-2 overflow-x-auto no-scrollbar">
                        {deliveryPartners.map((dp: any) => (
                          <button
                            key={dp.id}
                            onClick={() => assignPartner(order.id, dp.user_id)}
                            className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-semibold border transition-colors touch-target ${
                              order.delivery_partner_id === dp.user_id
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-border bg-card text-foreground'
                            }`}
                          >
                            🚚 {dp.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {order.status === 'accepted' && (
                    <button
                      onClick={() => updateStatus(order.id, 'packed')}
                      disabled={!allItemsChecked(order.order_items || [])}
                      className="w-full bg-success text-success-foreground py-3 rounded-xl font-semibold touch-target flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Package size={16} /> Mark Packed / पैक हो गया
                    </button>
                  )}
                  {order.status === 'packed' && (
                    <button onClick={() => updateStatus(order.id, 'out')} className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold touch-target flex items-center justify-center gap-2">
                      <Send size={16} /> Dispatch / भेजें
                    </button>
                  )}
                </div>
              ))}
            </div>
          );
        })}

        {orders.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">No orders to pack / कोई ऑर्डर नहीं</div>
        )}
      </div>
    </div>
  );
};

export default HubDashboard;
