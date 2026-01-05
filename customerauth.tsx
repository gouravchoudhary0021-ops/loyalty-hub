import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { setCurrentUser, verifyAccess } from '../services/store';

interface CustomerAuthProps {
  onLogin: (user: User) => void;
}

const CustomerAuth: React.FC<CustomerAuthProps> = ({ onLogin }) => {
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (phone.length < 10) {
      setError('Enter a valid 10-digit mobile number');
      return;
    }

    setIsLoading(true);
    
    // Simulate OTP / Verification
    setTimeout(() => {
      const user: User = { 
        id: 'cust_' + phone, 
        name: 'Verified User', 
        phone, 
        role: UserRole.CUSTOMER 
      };

      setCurrentUser(user);
      onLogin(user);
      window.location.hash = '#/wallet';
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="flex min-h-screen flex-col bg-white font-['Outfit'] relative overflow-hidden">
      {/* Dynamic Background Elements (Blinkit Style) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Animated Blobs */}
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-[#FFD300]/10 rounded-full blur-[100px] animate-drifting"></div>
        <div className="absolute top-1/2 -right-20 w-96 h-96 bg-blue-100/30 rounded-full blur-[120px] animate-drifting" style={{ animationDelay: '-3s' }}></div>
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-80 h-80 bg-orange-100/20 rounded-full blur-[80px] animate-drifting" style={{ animationDelay: '-5s' }}></div>

        {/* Floating Icons */}
        <div className="absolute top-[10%] left-[10%] text-4xl opacity-20 animate-floating" style={{ animationDelay: '0s' }}>🎁</div>
        <div className="absolute top-[25%] right-[15%] text-3xl opacity-20 animate-floating" style={{ animationDelay: '-1.5s' }}>🍔</div>
        <div className="absolute top-[45%] left-[5%] text-4xl opacity-15 animate-floating" style={{ animationDelay: '-4s' }}>☕</div>
        <div className="absolute bottom-[20%] right-[10%] text-5xl opacity-20 animate-floating" style={{ animationDelay: '-2s' }}>🛍️</div>
        <div className="absolute bottom-[35%] left-[20%] text-3xl opacity-10 animate-floating" style={{ animationDelay: '-3.5s' }}>🍕</div>
        <div className="absolute top-[60%] right-[5%] text-2xl opacity-25 animate-floating" style={{ animationDelay: '-1s' }}>💎</div>
      </div>

      {/* Brand Header */}
      <div className="p-8 pt-12 text-center relative z-10">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-[#FFD300] blur-2xl opacity-20 animate-pulse"></div>
          <div 
            onClick={() => window.location.hash = '#/'}
            className="h-16 w-16 bg-[#FFD300] text-black rounded-3xl flex items-center justify-center rotate-3 mx-auto mb-6 shadow-xl cursor-pointer active:scale-95 transition-transform relative z-10"
          >
            <span className="text-3xl font-black italic">L!</span>
          </div>
        </div>
        <h1 className="text-3xl font-black text-black tracking-tighter">Welcome to LoyaltyHub</h1>
        <p className="text-gray-400 font-bold text-sm mt-2 uppercase tracking-widest">Your rewards await</p>
      </div>

      <div className="px-8 flex-1 flex flex-col relative z-10">
        <div className="bg-white/80 backdrop-blur-xl rounded-[40px] p-8 border border-white shadow-2xl mt-4">
          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] block ml-2">
                Mobile Number
              </label>
              <div className={`flex items-center gap-4 bg-gray-50 p-5 rounded-3xl border transition-all duration-300 ${error ? 'border-red-500 shadow-[0_0_0_4px_rgba(239,68,68,0.1)]' : 'border-gray-100 focus-within:bg-white focus-within:border-[#FFD300] focus-within:shadow-[0_0_0_4px_rgba(255,211,0,0.2)]'}`}>
                <div className="flex items-center gap-2 pr-4 border-r border-gray-100 font-black text-black">
                  <span className="text-xl">🇮🇳</span>
                  <span className="text-lg">+91</span>
                </div>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="00000 00000"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value.replace(/\D/g, ''));
                    setError(null);
                  }}
                  className="bg-transparent text-2xl font-black w-full outline-none placeholder:text-gray-200 tracking-tight"
                />
              </div>
              {error && (
                <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest ml-2 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-[#FFD300] py-6 rounded-[2.5rem] font-black text-xl shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 group overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              {isLoading ? (
                <div className="h-6 w-6 border-4 border-[#FFD300] border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span className="relative z-10">GET REWARDS</span>
              )}
            </button>
          </form>

          <p className="text-center mt-8 text-[10px] font-bold text-gray-400 leading-relaxed uppercase tracking-wider">
            By continuing, you agree to our <span className="text-black underline">Terms</span> & <span className="text-black underline">Privacy</span>
          </p>
        </div>

        {/* Benefits Shelf */}
        <div className="mt-12 grid grid-cols-2 gap-4 pb-12">
           <div className="bg-blue-50/80 backdrop-blur-md p-6 rounded-[32px] text-center border border-blue-100 shadow-sm">
              <span className="text-2xl mb-2 block">🎁</span>
              <p className="text-[10px] font-black uppercase text-blue-600">Exclusive Offers</p>
           </div>
           <div className="bg-orange-50/80 backdrop-blur-md p-6 rounded-[32px] text-center border border-orange-100 shadow-sm">
              <span className="text-2xl mb-2 block">⚡</span>
              <p className="text-[10px] font-black uppercase text-orange-600">Instant Points</p>
           </div>
        </div>
      </div>

      {/* Trust Footer */}
      <div className="bg-gray-50/50 backdrop-blur-xl py-10 px-8 text-center border-t border-gray-100 relative z-10">
         <div className="flex items-center justify-center gap-2 mb-4">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Bank-Grade Encryption</span>
         </div>
         <p className="text-[9px] font-bold text-gray-300 leading-relaxed max-w-xs mx-auto uppercase">
           We never share your data. Your number is only used for loyalty tracking.
         </p>
      </div>
    </div>
  );
};

export default CustomerAuth;