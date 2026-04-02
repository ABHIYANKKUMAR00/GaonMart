import { useState, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Camera, Save, User, Phone, Mail, MapPin, Building2, CreditCard, FileText, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const ProfilePage = () => {
  const { user, profile, refreshProfile, role, signOut } = useApp();
  const navigate = useNavigate();

  const [name, setName] = useState(profile?.name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [address, setAddress] = useState(profile?.address || '');
  const [village, setVillage] = useState(profile?.village || '');
  const [shopName, setShopName] = useState(profile?.shop_name || '');
  const [shopCategory, setShopCategory] = useState(profile?.shop_category || '');
  const [bankDetails, setBankDetails] = useState(profile?.bank_details || '');
  const [aadhaarNumber, setAadhaarNumber] = useState(profile?.aadhaar_number || '');
  const [vehicleType, setVehicleType] = useState(profile?.vehicle_type || '');
  const [workingArea, setWorkingArea] = useState(profile?.working_area || '');
  const [hubLocation, setHubLocation] = useState(profile?.hub_location || '');
  const [roleType, setRoleType] = useState(profile?.role_type || '');

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState(profile?.photo_url || '');
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Photo must be under 5MB');
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    let photoUrl = profile?.photo_url || '';

    if (photoFile) {
      const ext = photoFile.name.split('.').pop();
      const path = `${user.id}/profile.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('registration-docs')
        .upload(path, photoFile, { upsert: true });
      if (!upErr) {
        const { data: urlData } = supabase.storage.from('registration-docs').getPublicUrl(path);
        photoUrl = urlData.publicUrl;
      }
    }

    const updates: Record<string, string | null> = {
      name, phone, email, address, village, photo_url: photoUrl,
    };

    if (role === 'seller') {
      updates.shop_name = shopName;
      updates.shop_category = shopCategory;
      updates.bank_details = bankDetails;
      updates.aadhaar_number = aadhaarNumber;
    }
    if (role === 'delivery') {
      updates.vehicle_type = vehicleType;
      updates.working_area = workingArea;
      updates.bank_details = bankDetails;
      updates.aadhaar_number = aadhaarNumber;
    }
    if (role === 'hub') {
      updates.hub_location = hubLocation;
      updates.role_type = roleType;
      updates.aadhaar_number = aadhaarNumber;
    }

    const { error } = await supabase.from('profiles').update(updates).eq('user_id', user.id);
    if (error) {
      toast.error('अपडेट नहीं हो पाया / Update failed');
    } else {
      toast.success('प्रोफ़ाइल अपडेट हो गई / Profile updated!');
      await refreshProfile();
    }
    setSaving(false);
  };

  const inputClass = "w-full p-4 rounded-xl border border-border bg-card text-foreground text-base outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground";

  const shopCategories = [
    { value: 'kirana', label: 'किराना / Kirana' },
    { value: 'dairy', label: 'डेयरी / Dairy' },
    { value: 'vegetables', label: 'सब्जी / Vegetables' },
    { value: 'fruits', label: 'फल / Fruits' },
    { value: 'sweets', label: 'मिठाई / Sweets' },
    { value: 'medical', label: 'मेडिकल / Medical' },
    { value: 'hardware', label: 'हार्डवेयर / Hardware' },
    { value: 'other', label: 'अन्य / Other' },
  ];

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="bg-card border-b border-border p-4 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="active:scale-95 transition-transform">
          <ArrowLeft size={22} className="text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground">प्रोफ़ाइल / Profile</h1>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-6">
        {/* Photo */}
        <div className="flex flex-col items-center gap-3">
          <div
            className="relative w-28 h-28 rounded-full bg-muted border-2 border-primary overflow-hidden cursor-pointer"
            onClick={() => fileRef.current?.click()}
          >
            {photoPreview ? (
              <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User size={40} className="text-muted-foreground" />
              </div>
            )}
            <div className="absolute bottom-0 inset-x-0 bg-primary/80 py-1 flex justify-center">
              <Camera size={16} className="text-primary-foreground" />
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoChange} />
          <p className="text-xs text-muted-foreground">फ़ोटो बदलें / Change Photo</p>
        </div>

        {/* Common Fields */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <User size={16} /> व्यक्तिगत जानकारी / Personal Info
          </div>
          <input placeholder="नाम / Name" value={name} onChange={e => setName(e.target.value)} className={inputClass} />
          <div className="flex items-center gap-2">
            <Phone size={16} className="text-muted-foreground shrink-0" />
            <input type="tel" placeholder="मोबाइल / Mobile" value={phone} onChange={e => setPhone(e.target.value)} className={inputClass} />
          </div>
          <div className="flex items-center gap-2">
            <Mail size={16} className="text-muted-foreground shrink-0" />
            <input type="email" placeholder="ईमेल / Email" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} />
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-muted-foreground shrink-0" />
            <input placeholder="पता / Address" value={address} onChange={e => setAddress(e.target.value)} className={inputClass} />
          </div>
          <input placeholder="गांव / Village" value={village} onChange={e => setVillage(e.target.value)} className={inputClass} />
        </div>

        {/* Seller-specific */}
        {role === 'seller' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Building2 size={16} /> दुकान की जानकारी / Shop Info
            </div>
            <input placeholder="दुकान का नाम / Shop Name" value={shopName} onChange={e => setShopName(e.target.value)} className={inputClass} />
            <select value={shopCategory} onChange={e => setShopCategory(e.target.value)} className={inputClass}>
              <option value="">दुकान का प्रकार / Shop Type</option>
              {shopCategories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <div className="flex items-center gap-2">
              <CreditCard size={16} className="text-muted-foreground shrink-0" />
              <input placeholder="बैंक डिटेल्स / Bank Details" value={bankDetails} onChange={e => setBankDetails(e.target.value)} className={inputClass} />
            </div>
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-muted-foreground shrink-0" />
              <input placeholder="आधार नंबर / Aadhaar Number" value={aadhaarNumber} onChange={e => setAadhaarNumber(e.target.value)} className={inputClass} />
            </div>
          </div>
        )}

        {/* Delivery-specific */}
        {role === 'delivery' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              🚚 डिलीवरी जानकारी / Delivery Info
            </div>
            <select value={vehicleType} onChange={e => setVehicleType(e.target.value)} className={inputClass}>
              <option value="">वाहन का प्रकार / Vehicle Type</option>
              <option value="bicycle">साइकिल / Bicycle</option>
              <option value="bike">बाइक / Bike</option>
              <option value="auto">ऑटो / Auto</option>
              <option value="van">वैन / Van</option>
            </select>
            <input placeholder="कार्य क्षेत्र / Working Area" value={workingArea} onChange={e => setWorkingArea(e.target.value)} className={inputClass} />
            <div className="flex items-center gap-2">
              <CreditCard size={16} className="text-muted-foreground shrink-0" />
              <input placeholder="बैंक डिटेल्स / Bank Details" value={bankDetails} onChange={e => setBankDetails(e.target.value)} className={inputClass} />
            </div>
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-muted-foreground shrink-0" />
              <input placeholder="आधार नंबर / Aadhaar Number" value={aadhaarNumber} onChange={e => setAadhaarNumber(e.target.value)} className={inputClass} />
            </div>
          </div>
        )}

        {/* Hub-specific */}
        {role === 'hub' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              📦 हब जानकारी / Hub Info
            </div>
            <input placeholder="हब लोकेशन / Hub Location" value={hubLocation} onChange={e => setHubLocation(e.target.value)} className={inputClass} />
            <select value={roleType} onChange={e => setRoleType(e.target.value)} className={inputClass}>
              <option value="">भूमिका / Role Type</option>
              <option value="manager">मैनेजर / Manager</option>
              <option value="staff">स्टाफ / Staff</option>
            </select>
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-muted-foreground shrink-0" />
              <input placeholder="आधार नंबर / Aadhaar Number" value={aadhaarNumber} onChange={e => setAadhaarNumber(e.target.value)} className={inputClass} />
            </div>
          </div>
        )}

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold text-lg active:scale-[0.98] transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Save size={20} />
          {saving ? 'सेव हो रहा है...' : 'सेव करें / Save'}
        </button>

        <button
          onClick={async () => { await signOut(); navigate('/'); }}
          className="w-full border border-destructive text-destructive py-4 rounded-xl font-bold text-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
        >
          <LogOut size={20} />
          लॉगआउट / Logout
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
