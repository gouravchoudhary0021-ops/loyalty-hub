
import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { setCurrentUser, verifyAccess } from '../services/store';

interface AuthPageProps {
  onLogin: (user: User) => void;
  initialRole?: UserRole;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin, initialRole = UserRole.CUSTOMER }) => {
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>(initialRole);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setRole(initialRole);
    setError(null);
  }, [initialRole]);

  const handleDirectLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (phone.length < 10) {
      setError('Please enter a valid 10-digit number');
      return;
    }

    setIsLoading(true);
    
    // Simulate registry verification delay
    setTimeout(() => {
      const verification = verifyAccess(phone, role);

      if (!verification.authorized) {
        setIsLoading(false);
        setError(`Access Denied. This number is not registered as an authorized ${role.toLowerCase()}.`);
        return;
      }

      let user: User;
      
      if (role === UserRole.ADMIN) {
        user = { id: 'admin_' + phone, name: 'System Administrator', phone, role: UserRole.ADMIN };
      } else if (role === UserRole.VENDOR) {
        user = { id: 'vendor_' + phone, name: 'Verified Merchant', phone, role: UserRole.VENDOR, vendorId: verification.vendorId };
      } else {
        user = { id: 'cust_' + phone, name: 'Verified User', phone, role: UserRole.CUSTOMER };
      }

      setCurrentUser(user);
      onLogin(user);
      
      const targetHash = role === UserRole.CUSTOMER ? '#/wallet' : role === UserRole.VENDOR ? '#/vendor' : '#/admin';
      window.location.hash = targetHash;
      setIsLoading(false);
    }, 1200);
  };

  return (
    <div className="flex min-h-screen flex-col bg-white font-['Outfit']">
      {/* Dynamic Header Theme */}
      <div className={`h-64 transition-all duration-700 ${
        role === UserRole.VENDOR ? 'bg-black text-[#FFD300]' : 
        role === UserRole.ADMIN ? 'bg-indigo-900 text-white' : 
        'bg-[#FFD300] text-black'
      } flex flex-col items-center justify-center rounded-b-[60px] shadow-sm relative overflow-hidden`}>
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
           <div className="absolute top-10 left-10 w-20 h-20 border-4 border-current rounded-full"></div>
           <div className="absolute bottom-10 right-10 w-32 h-32 border-8 border-current rounded-3xl rotate-12"></div>
        </div>
        
        <div className={`h-20 w-20 ${
          role === UserRole.VENDOR ? 'bg-[#FFD300] text-black' : 
          role === UserRole.ADMIN ? 'bg-white text-indigo-900' : 
          'bg-black text-[#FFD300]'
        } rounded-[2rem] flex items-center justify-center rotate-3 mb-4 shadow-2xl relative z-10 scale-110 transition-colors`}>
          <span className="text-4xl font-black italic">L!</span>
        </div>
        <h2 className="text-3xl font-black uppercase tracking-tighter relative z-10">LoyaltyHub</h2>
        <p className="opacity-60 text-[10px] font-black uppercase tracking-[0.3em] mt-1 relative z-10">
          {role === UserRole.VENDOR ? 'SECURE Merchant PORTAL' : role === UserRole.ADMIN ? 'ENCRYPTED ADMIN HUB' : 'CUSTOMER LOYALTY WALLET'}
        </p>
      </div>

      <div className="px-8 -mt-10 relative z-20">
        <div className="bg-white rounded-[40px] shadow-2xl border border-gray-100 p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-2xl font-black text-black leading-tight">
                {role === UserRole.CUSTOMER ? 'Sign In' : 'Registry Check'}
              </h3>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Identity Verification</p>
            </div>
            <button 
              onClick={() => window.location.hash = '#/'}
              className="text-gray-300 hover:text-black transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <form className="space-y-6" onSubmit={handleDirectLogin}>
            {/* Direct Phone Input */}
            <div className={`p-5 rounded-3xl border transition-all duration-300 ${error ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-100 focus-within:border-[#FFD300]'}`}>
              <label htmlFor="phone" className={`block text-[10px] font-black uppercase tracking-widest mb-3 ${error ? 'text-red-400' : 'text-gray-400'}`}>Registered Mobile</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-gray-100">
                  <span className="text-lg font-black text-black">🇮🇳</span>
                  <span className="text-sm font-bold text-gray-400">+91</span>
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="0000000000"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value.replace(/\D/g, ''));
                    setError(null);
                  }}
                  className="bg-transparent text-2xl font-black w-full outline-none placeholder:text-gray-200 tracking-tight"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-2xl border border-red-100">
                 <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                 <p className="text-[10px] font-black uppercase leading-tight">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-5 rounded-[2.5rem] font-black text-xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 ${
                role === UserRole.VENDOR ? 'bg-[#FFD300] text-black' : 
                role === UserRole.ADMIN ? 'bg-indigo-600 text-white' : 
                'bg-black text-[#FFD300]'
              } ${isLoading ? 'opacity-80' : 'animate-pulse-soft'}`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </>
              ) : (
                role === UserRole.CUSTOMER ? 'CONTINUE' : 'VERIFY & ACCESS'
              )}
            </button>
          </form>

          {/* Context Note */}
          <div className="mt-8 text-center bg-gray-50 rounded-[2rem] p-4 border border-dashed border-gray-200">
            <p className="text-[9px] font-black text-gray-400 uppercase leading-relaxed">
              {role === UserRole.CUSTOMER ? 
                'Self-onboarding is enabled for customers. Simply verify your number.' : 
                `Authorized access only. Merchants must be pre-registered via the Global Admin Panel.`
              }
            </p>
          </div>
        </div>
      </div>

      <p className="mt-auto text-center py-10 text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em] px-10">
        System Security Protocol v4.0.2
      </p>
    </div>
  );
};

export default AuthPage;
