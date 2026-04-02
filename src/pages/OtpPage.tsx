import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const OtpPage = () => {
  const [otp, setOtp] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // phone URL se lo
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const p = params.get("phone") || "";
    setPhone(p);
  }, []);

  const verifyOtp = async () => {
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.verifyOtp({
      phone: phone,
      token: otp,
      type: "sms",
    });

    if (error) {
      setMessage("❌ गलत OTP");
      setLoading(false);
      return;
    }

    // 👉 USER FETCH
    const { data: { user } } = await supabase.auth.getUser();

    const role = user?.user_metadata?.role;

    // 👉 ROLE BASED REDIRECT
    if (role === "buyer") {
      window.location.href = "/buyer";
    } else if (role === "seller") {
      window.location.href = "/seller";
    } else if (role === "delivery") {
      window.location.href = "/delivery";
    } else if (role === "hub") {
      window.location.href = "/hub";
    } else {
      window.location.href = "/";
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="space-y-4 w-full max-w-sm">

        <h2 className="text-xl font-bold text-center">
          OTP डालें / Enter OTP
        </h2>

        <input
          type="text"
          placeholder="OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full p-4 border rounded-xl"
        />

        <button
          onClick={verifyOtp}
          className="w-full bg-green-600 text-white py-3 rounded-xl"
        >
          {loading ? "..." : "Verify OTP"}
        </button>

        {message && <p className="text-center">{message}</p>}
      </div>
    </div>
  );
};

export default OtpPage;