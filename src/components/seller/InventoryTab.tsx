import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, AlertTriangle, Package } from 'lucide-react';

interface InventoryTabProps {
  userId: string;
}

const InventoryTab = ({ userId }: InventoryTabProps) => {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', name_hi: '', price: '', unit: '', category: 'atta', image: '📦', stock_quantity: '10', low_stock_threshold: '5' });

  const { data: products = [] } = useQuery({
    queryKey: ['seller-products', userId],
    queryFn: async () => {
      const { data } = await supabase.from('products').select('*').eq('seller_id', userId).order('name');
      return data || [];
    },
  });

  const lowStockProducts = products.filter((p: any) => p.stock_quantity <= p.low_stock_threshold && p.in_stock);

  const toggleStock = async (productId: string, currentStatus: boolean) => {
    await supabase.from('products').update({ in_stock: !currentStatus }).eq('id', productId);
    queryClient.invalidateQueries({ queryKey: ['seller-products'] });
  };

  const updateStockQuantity = async (productId: string, quantity: number) => {
    if (quantity < 0) return;
    await supabase.from('products').update({ stock_quantity: quantity } as any).eq('id', productId);
    queryClient.invalidateQueries({ queryKey: ['seller-products'] });
  };

  const addProduct = async () => {
    if (!newProduct.name || !newProduct.price) return;
    await supabase.from('products').insert({
      seller_id: userId,
      name: newProduct.name,
      name_hi: newProduct.name_hi,
      price: parseFloat(newProduct.price),
      unit: newProduct.unit || '1 unit',
      category: newProduct.category,
      image: newProduct.image,
      stock_quantity: parseInt(newProduct.stock_quantity) || 10,
      low_stock_threshold: parseInt(newProduct.low_stock_threshold) || 5,
    } as any);
    setNewProduct({ name: '', name_hi: '', price: '', unit: '', category: 'atta', image: '📦', stock_quantity: '10', low_stock_threshold: '5' });
    setShowAdd(false);
    queryClient.invalidateQueries({ queryKey: ['seller-products'] });
  };

  return (
    <div className="p-3 space-y-3">
      {/* Low stock alerts */}
      {lowStockProducts.length > 0 && (
        <div className="bg-warning/10 border border-warning/30 rounded-xl p-3 space-y-2">
          <div className="flex items-center gap-2 text-warning font-semibold text-sm">
            <AlertTriangle size={16} /> Low Stock Alert / स्टॉक कम है ({lowStockProducts.length})
          </div>
          {lowStockProducts.map((p: any) => (
            <div key={p.id} className="flex justify-between items-center text-sm">
              <span>{p.image} {p.name}</span>
              <span className="text-warning font-bold">{p.stock_quantity} left</span>
            </div>
          ))}
        </div>
      )}

      {/* Add product */}
      {!showAdd ? (
        <button onClick={() => setShowAdd(true)} className="w-full border-2 border-dashed border-border rounded-xl p-4 text-muted-foreground flex items-center justify-center gap-2 touch-target">
          <Plus size={20} /> Add Product / प्रोडक्ट जोड़ें
        </button>
      ) : (
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <input placeholder="Product Name" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
            className="w-full p-3 rounded-xl border border-border bg-background text-foreground text-sm outline-none" />
          <input placeholder="Hindi Name / हिंदी नाम" value={newProduct.name_hi} onChange={e => setNewProduct({ ...newProduct, name_hi: e.target.value })}
            className="w-full p-3 rounded-xl border border-border bg-background text-foreground text-sm outline-none" />
          <div className="flex gap-2">
            <input placeholder="Price / ₹" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} type="number"
              className="flex-1 p-3 rounded-xl border border-border bg-background text-foreground text-sm outline-none" />
            <input placeholder="Unit (1 kg)" value={newProduct.unit} onChange={e => setNewProduct({ ...newProduct, unit: e.target.value })}
              className="flex-1 p-3 rounded-xl border border-border bg-background text-foreground text-sm outline-none" />
          </div>
          <div className="flex gap-2">
            <input placeholder="Stock Qty" value={newProduct.stock_quantity} onChange={e => setNewProduct({ ...newProduct, stock_quantity: e.target.value })} type="number"
              className="flex-1 p-3 rounded-xl border border-border bg-background text-foreground text-sm outline-none" />
            <input placeholder="Low alert at" value={newProduct.low_stock_threshold} onChange={e => setNewProduct({ ...newProduct, low_stock_threshold: e.target.value })} type="number"
              className="flex-1 p-3 rounded-xl border border-border bg-background text-foreground text-sm outline-none" />
          </div>
          <select value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
            className="w-full p-3 rounded-xl border border-border bg-background text-foreground text-sm">
            <option value="atta">Atta / आटा</option>
            <option value="rice">Rice-Dal / चावल-दाल</option>
            <option value="oil">Oil-Ghee / तेल-घी</option>
            <option value="spices">Spices / मसाले</option>
            <option value="snacks">Snacks / नमकीन</option>
            <option value="soap">Soap / साबुन</option>
            <option value="drinks">Drinks / पेय</option>
            <option value="dairy">Dairy / दूध-दही</option>
          </select>
          <div className="flex gap-2">
            <button onClick={addProduct} className="flex-1 bg-secondary text-secondary-foreground py-3 rounded-xl font-semibold touch-target">Save / सेव करें</button>
            <button onClick={() => setShowAdd(false)} className="flex-1 bg-muted text-muted-foreground py-3 rounded-xl font-semibold touch-target">Cancel</button>
          </div>
        </div>
      )}

      {/* Product list with stock controls */}
      {products.map((p: any) => (
        <div key={p.id} className={`bg-card border rounded-xl p-4 space-y-2 ${!p.in_stock ? 'opacity-50 border-border' : p.stock_quantity <= p.low_stock_threshold ? 'border-warning/50' : 'border-border'}`}>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{p.image}</span>
            <div className="flex-1">
              <p className="font-semibold text-sm">{p.name}</p>
              <p className="text-xs text-muted-foreground">{p.name_hi} · {p.unit}</p>
            </div>
            <span className="font-bold text-primary">₹{p.price}</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-border">
            <div className="flex items-center gap-2">
              <button onClick={() => updateStockQuantity(p.id, p.stock_quantity - 1)} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground font-bold">-</button>
              <span className="text-sm font-semibold w-8 text-center">{p.stock_quantity}</span>
              <button onClick={() => updateStockQuantity(p.id, p.stock_quantity + 1)} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground font-bold">+</button>
              <span className="text-xs text-muted-foreground">in stock</span>
            </div>
            <button onClick={() => toggleStock(p.id, p.in_stock)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${p.in_stock ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}`}>
              {p.in_stock ? '✅ Active' : '❌ Hidden'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default InventoryTab;
