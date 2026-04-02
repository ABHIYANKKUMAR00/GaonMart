import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Check, IndianRupee, User } from 'lucide-react';

interface UdhaarTabProps {
  userId: string;
}

const UdhaarTab = ({ userId }: UdhaarTabProps) => {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [newEntry, setNewEntry] = useState({ buyer_name: '', buyer_phone: '', village: '', amount: '', description: '' });

  const { data: records = [] } = useQuery({
    queryKey: ['udhaar-records', userId],
    queryFn: async () => {
      const { data } = await supabase.from('udhaar_records' as any).select('*').eq('seller_id', userId).order('created_at', { ascending: false });
      return (data || []) as any[];
    },
  });

  const unpaidRecords = records.filter((r: any) => !r.is_paid);
  const paidRecords = records.filter((r: any) => r.is_paid);
  const totalUnpaid = unpaidRecords.reduce((sum: number, r: any) => sum + Number(r.amount), 0);
  const totalPaid = paidRecords.reduce((sum: number, r: any) => sum + Number(r.amount), 0);

  const addEntry = async () => {
    if (!newEntry.buyer_name || !newEntry.amount) return;
    await supabase.from('udhaar_records' as any).insert({
      seller_id: userId,
      buyer_name: newEntry.buyer_name,
      buyer_phone: newEntry.buyer_phone,
      village: newEntry.village,
      amount: parseFloat(newEntry.amount),
      description: newEntry.description,
    } as any);
    setNewEntry({ buyer_name: '', buyer_phone: '', village: '', amount: '', description: '' });
    setShowAdd(false);
    queryClient.invalidateQueries({ queryKey: ['udhaar-records'] });
  };

  const markPaid = async (id: string) => {
    await supabase.from('udhaar_records' as any).update({ is_paid: true, paid_at: new Date().toISOString() } as any).eq('id', id);
    queryClient.invalidateQueries({ queryKey: ['udhaar-records'] });
  };

  // Group unpaid by buyer
  const buyerGroups: Record<string, any[]> = unpaidRecords.reduce((acc: Record<string, any[]>, r: any) => {
    const key = r.buyer_name;
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {});

  return (
    <div className="p-3 space-y-3">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-3 text-center">
          <p className="text-xs text-muted-foreground">Pending / बाकी</p>
          <p className="text-xl font-bold text-destructive">₹{totalUnpaid}</p>
          <p className="text-xs text-muted-foreground">{unpaidRecords.length} entries</p>
        </div>
        <div className="bg-success/10 border border-success/30 rounded-xl p-3 text-center">
          <p className="text-xs text-muted-foreground">Collected / वसूली</p>
          <p className="text-xl font-bold text-success">₹{totalPaid}</p>
          <p className="text-xs text-muted-foreground">{paidRecords.length} entries</p>
        </div>
      </div>

      {/* Add new */}
      {!showAdd ? (
        <button onClick={() => setShowAdd(true)} className="w-full border-2 border-dashed border-border rounded-xl p-4 text-muted-foreground flex items-center justify-center gap-2 touch-target">
          <Plus size={20} /> Add Udhaar / उधार जोड़ें
        </button>
      ) : (
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <input placeholder="Customer Name / ग्राहक नाम *" value={newEntry.buyer_name} onChange={e => setNewEntry({ ...newEntry, buyer_name: e.target.value })}
            className="w-full p-3 rounded-xl border border-border bg-background text-foreground text-sm outline-none" />
          <div className="flex gap-2">
            <input placeholder="Phone" value={newEntry.buyer_phone} onChange={e => setNewEntry({ ...newEntry, buyer_phone: e.target.value })}
              className="flex-1 p-3 rounded-xl border border-border bg-background text-foreground text-sm outline-none" />
            <input placeholder="Village / गाँव" value={newEntry.village} onChange={e => setNewEntry({ ...newEntry, village: e.target.value })}
              className="flex-1 p-3 rounded-xl border border-border bg-background text-foreground text-sm outline-none" />
          </div>
          <input placeholder="Amount / रकम ₹ *" value={newEntry.amount} onChange={e => setNewEntry({ ...newEntry, amount: e.target.value })} type="number"
            className="w-full p-3 rounded-xl border border-border bg-background text-foreground text-sm outline-none" />
          <input placeholder="Description / विवरण" value={newEntry.description} onChange={e => setNewEntry({ ...newEntry, description: e.target.value })}
            className="w-full p-3 rounded-xl border border-border bg-background text-foreground text-sm outline-none" />
          <div className="flex gap-2">
            <button onClick={addEntry} className="flex-1 bg-secondary text-secondary-foreground py-3 rounded-xl font-semibold touch-target">Save / सेव करें</button>
            <button onClick={() => setShowAdd(false)} className="flex-1 bg-muted text-muted-foreground py-3 rounded-xl font-semibold touch-target">Cancel</button>
          </div>
        </div>
      )}

      {/* Grouped by buyer */}
      {Object.entries(buyerGroups).map(([name, entries]) => {
        const total = entries.reduce((s: number, e: any) => s + Number(e.amount), 0);
        return (
          <div key={name} className="bg-card border border-border rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <User size={16} className="text-muted-foreground" />
                <span className="font-semibold text-sm">{name}</span>
                {entries[0]?.village && <span className="text-xs text-muted-foreground">· {entries[0].village}</span>}
              </div>
              <span className="font-bold text-destructive">₹{total}</span>
            </div>
            {entries.map((entry: any) => (
              <div key={entry.id} className="flex justify-between items-center text-sm pl-6 border-t border-border pt-1">
                <div>
                  <span className="text-muted-foreground">{new Date(entry.created_at).toLocaleDateString('en-IN')}</span>
                  {entry.description && <span className="text-muted-foreground ml-2">— {entry.description}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">₹{entry.amount}</span>
                  <button onClick={() => markPaid(entry.id)} className="bg-success/20 text-success p-1.5 rounded-lg touch-target" title="Mark paid">
                    <Check size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        );
      })}

      {unpaidRecords.length === 0 && (
        <p className="text-center py-6 text-muted-foreground text-sm">No pending udhaar / कोई बाकी उधार नहीं 🎉</p>
      )}
    </div>
  );
};

export default UdhaarTab;
