import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/context/AppContext";

import Index from "./pages/Index.tsx";
import CartPage from "./pages/CartPage.tsx";
import CheckoutPage from "./pages/CheckoutPage.tsx";
import OrderSuccess from "./pages/OrderSuccess.tsx";
import OrdersPage from "./pages/OrdersPage.tsx";
import ShopPage from "./pages/ShopPage.tsx";
import NotFound from "./pages/NotFound.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import ProfilePage from "./pages/ProfilePage.tsx";
import OtpPage from "./pages/OtpPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>

            {/* MAIN */}
            <Route path="/" element={<Index />} />

            {/* AUTH */}
            <Route path="/otp" element={<OtpPage />} />

            {/* DASHBOARDS */}
            <Route path="/buyer" element={<div>Buyer Dashboard</div>} />
            <Route path="/seller" element={<div>Seller Dashboard</div>} />
            <Route path="/delivery" element={<div>Delivery Dashboard</div>} />
            <Route path="/hub" element={<div>Hub Dashboard</div>} />

            {/* OTHER */}
            <Route path="/shop/:sellerId" element={<ShopPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-success/:orderId" element={<OrderSuccess />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/profile" element={<ProfilePage />} />

            {/* FALLBACK */}
            <Route path="*" element={<NotFound />} />

          </Routes>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;