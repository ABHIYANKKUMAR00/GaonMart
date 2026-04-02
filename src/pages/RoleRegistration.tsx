import { useState, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Camera, FileImage, X } from 'lucide-react';

const RoleRegistration = () => {
  const { user, role, setRole, profile, refreshProfile, signOut } = useApp();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: profile?.name || '',
    phone: profile?.phone || '',
    village: profile?.village || '',
    address: profile?.address || '',
    email: '',
    shop_name: '',
    shop_address: '',
    shop_category: 'kirana',
    bank_details: '',
    aadhaar_number: '',
    vehicle_type: 'bike',
    working_area: '',
    hub_location: '',
    role_type: 'manager',
  });

  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  const [aadhaarPhoto, setAadhaarPhoto] = useState<File | null>(null);
  const [aadhaarPhotoPreview, setAadhaarPhotoPreview] = useState<string | null>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);
  const aadhaarInputRef = useRef<HTMLInputElement>(null);

  const update = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));
  const inputClass = "w-full p-4 rounded-xl border border-border bg-card text-foreground text-base outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground";

  const handleFileSelect = (file: File | undefined, type: 'profile' | 'aadhaar') => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('File too large. Max 5MB / फ़ाइल बहुत बड़ी है। अधिकतम 5MB');
      return;
    }
    const url = URL.createObjectURL(file);
    if (type === 'profile') {
      setProfilePhoto(file);
      setProfilePhotoPreview(url);
    } else {
      setAadhaarPhoto(file);
      setAadhaarPhotoPreview(url);
    }
  };

  const removePhoto = (type: 'profile' | 'aadhaar') => {
    if (type === 'profile') {
      setProfilePhoto(null);
      if (profilePhotoPreview) URL.revokeObjectURL(profilePhotoPreview);
      setProfilePhotoPreview(null);
    } else {
      setAadhaarPhoto(null);
      if (aadhaarPhotoPreview) URL.revokeObjectURL(aadhaarPhotoPreview);
      setAadhaarPhotoPreview(null);
    }
  };

  const uploadFile = async (file: File, path: string): Promise<string | null> => {
    const { error } = await supabase.storage.from('registration-docs').upload(path, file, { upsert: true });
    if (error) { console.error('Upload error:', error); return null; }
    const { data } = supabase.storage.from('registration-docs').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !role) return;
    setLoading(true);

    let photoUrl = profile?.photo_url || '';
    let aadhaarUrl = '';

    // Upload profile photo
    if (profilePhoto) {
      const ext = profilePhoto.name.split('.').pop() || 'jpg';
      const url = await uploadFile(profilePhoto, `${user.id}/profile.${ext}`);
      if (url) photoUrl = url;
    }

    // Upload aadhaar photo
    if (aadhaarPhoto) {
      const ext = aadhaarPhoto.name.split('.').pop() || 'jpg';
      const url = await uploadFile(aadhaarPhoto, `${user.id}/aadhaar.${ext}`);
      if (url) aadhaarUrl = url;
    }

    const updateData: Record<string, any> = {
      name: form.name,
      phone: form.phone,
      village: form.village,
      preferred_role: role,
      registration_complete: true,
      photo_url: photoUrl,
    };

    if (role === 'buyer') {
      updateData.address = form.address;
    } else if (role === 'seller') {
      updateData.email = form.email;
      updateData.shop_name = form.shop_name;
      updateData.shop_address = form.shop_address;
      updateData.shop_category = form.shop_category;
      updateData.bank_details = form.bank_details;
      updateData.aadhaar_number = form.aadhaar_number;
      updateData.address = form.address;
    } else if (role === 'delivery') {
      updateData.email = form.email;
      updateData.vehicle_type = form.vehicle_type;
      updateData.working_area = form.working_area;
      updateData.bank_details = form.bank_details;
      updateData.aadhaar_number = form.aadhaar_number;
      updateData.address = form.address;
    } else if (role === 'hub') {
      updateData.email = form.email;
      updateData.hub_location = form.hub_location;
      updateData.role_type = form.role_type;
      updateData.aadhaar_number = form.aadhaar_number;
    }

    await supabase.from('profiles').update(updateData).eq('user_id', user.id);
    await refreshProfile();
    setLoading(false);
  };

  const shopCategories = [
    { value: 'kirana', label: 'Kirana / किराना' },
    { value: 'dairy', label: 'Dairy / डेयरी' },
    { value: 'vegetables', label: 'Vegetables / सब्जी' },
    { value: 'fruits', label: 'Fruits / फल' },
    { value: 'medical', label: 'Medical / दवाई' },
    { value: 'bakery', label: 'Bakery / बेकरी' },
    { value: 'other', label: 'Other / अन्य' },
  ];

  const vehicleTypes = [
    { value: 'bike', label: '🏍️ Bike / बाइक' },
    { value: 'cycle', label: '🚲 Cycle / साइकिल' },
    { value: 'auto', label: '🛺 Auto / ऑटो' },
    { value: 'tempo', label: '🚛 Tempo / टेम्पो' },
  ];

  const roleInfo: Record<string, { emoji: string; title: string; subtitle: string }> = {
    buyer: { emoji: '🛒', title: 'Buyer Details / खरीदार जानकारी', subtitle: 'अपनी जानकारी भरें' },
    seller: { emoji: '🏪', title: 'Shop Registration / दुकान रजिस्ट्रेशन', subtitle: 'अपनी दुकान की जानकारी भरें' },
    delivery: { emoji: '🚚', title: 'Delivery Partner / डिलीवरी पार्टनर', subtitle: 'अपनी जानकारी भरें' },
    hub: { emoji: '📦', title: 'Hub Manager / हब मैनेजर', subtitle: 'हब की जानकारी भरें' },
  };

  const info = roleInfo[role || 'buyer'];
  const showAadhaar = role === 'seller' || role === 'delivery' || role === 'hub';

  const PhotoUploadCard = ({ label, preview, onSelect, onRemove, inputRef }: {
    label: string;
    preview: string | null;
    onSelect: (f: File | undefined) => void;
    onRemove: () => void;
    inputRef: React.RefObject<HTMLInputElement>;
  }) => (
    <div className="space-y-2">
      <label className="text-xs text-muted-foreground block">{label}</label>
      <input ref={inputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => onSelect(e.target.files?.[0])} />
      {preview ? (
        <div className="relative w-full rounded-xl overflow-hidden border border-border bg-card">
          <img src={preview} alt="Preview" className="w-full h-40 object-cover" />
          <button type="button" onClick={onRemove} className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1.5">
            <X size={14} />
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => inputRef.current?.click()}
          className="w-full flex items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed border-border bg-card hover:border-primary transition-colors text-muted-foreground">
          <Camera size={24} />
          <span className="text-sm font-medium">फोटो लें / Upload Photo</span>
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-4 bg-background">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center justify-between">
          <button onClick={() => setRole(null)} className="flex items-center gap-2 text-muted-foreground text-sm">
            <ArrowLeft size={16} /> वापस / Back
          </button>
          <button onClick={signOut} className="text-destructive text-sm font-medium">
            Logout
          </button>
        </div>

        <div className="text-center space-y-2">
          <span className="text-4xl">{info.emoji}</span>
          <h1 className="text-2xl font-bold text-foreground">{info.title}</h1>
          <p className="text-muted-foreground text-sm">{info.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Profile Photo */}
          <PhotoUploadCard
            label="प्रोफाइल फोटो / Profile Photo"
            preview={profilePhotoPreview}
            onSelect={f => handleFileSelect(f, 'profile')}
            onRemove={() => removePhoto('profile')}
            inputRef={profileInputRef as React.RefObject<HTMLInputElement>}
          />

          {/* Common fields */}
          <input placeholder="नाम / Name *" value={form.name} onChange={e => update('name', e.target.value)} className={inputClass} required />
          <input placeholder="मोबाइल नंबर / Phone *" value={form.phone} onChange={e => update('phone', e.target.value)} className={inputClass} type="tel" required />
          <input placeholder="गाँव / Village *" value={form.village} onChange={e => update('village', e.target.value)} className={inputClass} required />

          {/* === BUYER === */}
          {role === 'buyer' && (
            <input placeholder="पता / Address (optional)" value={form.address} onChange={e => update('address', e.target.value)} className={inputClass} />
          )}

          {/* === SELLER === */}
          {role === 'seller' && (
            <>
              <input placeholder="ईमेल / Email *" type="email" value={form.email} onChange={e => update('email', e.target.value)} className={inputClass} required />
              <input placeholder="दुकान का नाम / Shop Name *" value={form.shop_name} onChange={e => update('shop_name', e.target.value)} className={inputClass} required />
              <input placeholder="दुकान का पता / Shop Address *" value={form.shop_address} onChange={e => update('shop_address', e.target.value)} className={inputClass} required />
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">दुकान का प्रकार / Shop Type</label>
                <select value={form.shop_category} onChange={e => update('shop_category', e.target.value)} className={inputClass}>
                  {shopCategories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <input placeholder="बैंक खाता विवरण / Bank Details" value={form.bank_details} onChange={e => update('bank_details', e.target.value)} className={inputClass} />
              <input placeholder="आधार नंबर / Aadhaar Number" value={form.aadhaar_number} onChange={e => update('aadhaar_number', e.target.value)} className={inputClass} />
              <input placeholder="पता / Address" value={form.address} onChange={e => update('address', e.target.value)} className={inputClass} />
            </>
          )}

          {/* === DELIVERY === */}
          {role === 'delivery' && (
            <>
              <input placeholder="ईमेल / Email *" type="email" value={form.email} onChange={e => update('email', e.target.value)} className={inputClass} required />
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">वाहन का प्रकार / Vehicle Type</label>
                <select value={form.vehicle_type} onChange={e => update('vehicle_type', e.target.value)} className={inputClass}>
                  {vehicleTypes.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
                </select>
              </div>
              <input placeholder="काम का इलाका / Working Area *" value={form.working_area} onChange={e => update('working_area', e.target.value)} className={inputClass} required />
              <input placeholder="बैंक खाता विवरण / Bank Details" value={form.bank_details} onChange={e => update('bank_details', e.target.value)} className={inputClass} />
              <input placeholder="आधार नंबर / Aadhaar Number" value={form.aadhaar_number} onChange={e => update('aadhaar_number', e.target.value)} className={inputClass} />
              <input placeholder="पता / Address" value={form.address} onChange={e => update('address', e.target.value)} className={inputClass} />
            </>
          )}

          {/* === HUB === */}
          {role === 'hub' && (
            <>
              <input placeholder="ईमेल / Email *" type="email" value={form.email} onChange={e => update('email', e.target.value)} className={inputClass} required />
              <input placeholder="हब का पता / Hub Location *" value={form.hub_location} onChange={e => update('hub_location', e.target.value)} className={inputClass} required />
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">भूमिका / Role Type</label>
                <select value={form.role_type} onChange={e => update('role_type', e.target.value)} className={inputClass}>
                  <option value="manager">Manager / मैनेजर</option>
                  <option value="staff">Staff / स्टाफ</option>
                </select>
              </div>
              <input placeholder="आधार नंबर / Aadhaar Number" value={form.aadhaar_number} onChange={e => update('aadhaar_number', e.target.value)} className={inputClass} />
            </>
          )}

          {/* Aadhaar Photo Upload - for seller, delivery, hub */}
          {showAadhaar && (
            <PhotoUploadCard
              label="आधार कार्ड फोटो / Aadhaar Card Photo"
              preview={aadhaarPhotoPreview}
              onSelect={f => handleFileSelect(f, 'aadhaar')}
              onRemove={() => removePhoto('aadhaar')}
              inputRef={aadhaarInputRef as React.RefObject<HTMLInputElement>}
            />
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold text-lg active:scale-[0.98] transition-transform disabled:opacity-50">
            {loading ? (profilePhoto || aadhaarPhoto ? 'अपलोड हो रहा है... / Uploading...' : '...') : 'शुरू करें / Start →'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RoleRegistration;
