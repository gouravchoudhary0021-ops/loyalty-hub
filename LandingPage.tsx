
import React from 'react';
import { User, UserRole } from '../types';

interface LandingPageProps {
  onNavigate: (to: string) => void;
  user?: User | null;
}

const Particle: React.FC<{ delay: string; left: string; size: string }> = ({ delay, left, size }) => (
  <div 
    className="absolute bottom-0 bg-white/40 rounded-full animate-fire-spark"
    style={{ 
      left, 
      width: size, 
      height: size, 
      animationDelay: delay 
    }}
  />
);

const FloatingGift: React.FC<{ top: string; left: string; delay: string; scale: string }> = ({ top, left, delay, scale }) => (
  <div 
    className="absolute z-0 pointer-events-none opacity-20 animate-floating"
    style={{ top, left, animationDelay: delay, transform: `scale(${scale})` }}
  >
    <div className="relative">
      <div className="absolute inset-0 bg-[#FFD300] blur-xl animate-gift-burst" style={{ animationDelay: delay }} />
      <span className="text-6xl relative z-10">🎁</span>
    </div>
  </div>
);

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, user }) => {
  return (
    <div className="bg-[#F8F9FA] min-h-screen font-['Outfit'] overflow-x-hidden">
      {/* Premium Navbar */}
      <nav className="flex items-center justify-between px-6 py-5 sticky top-0 bg-white/90 backdrop-blur-xl z-[100] border-b border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onNavigate('#/')}>
          <div className="h-10 w-10 bg-black rounded-2xl flex items-center justify-center rotate-3 group-hover:rotate-12 transition-transform shadow-xl">
            <span className="text-[#FFD300] text-2xl font-black italic">L!</span>
          </div>
          <span className="text-2xl font-black tracking-tighter text-black">LoyaltyHub</span>
        </div>
        
        <div className="flex items-center gap-4">
          <button onClick={() => {
            const el = document.getElementById('how-it-works');
            el?.scrollIntoView({ behavior: 'smooth' });
          }} className="hidden md:block text-xs font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors px-4">How it Works</button>
          {user ? (
            <button 
              onClick={() => onNavigate(user.role === UserRole.CUSTOMER ? '#/wallet' : user.role === UserRole.VENDOR ? '#/vendor' : '#/admin')}
              className="bg-black text-[#FFD300] px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
            >
              Dashboard
            </button>
          ) : (
            <button 
              onClick={() => onNavigate('#/login')}
              className="bg-black text-[#FFD300] px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
            >
              Sign In
            </button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-12 pb-32 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0 bg-[#FFD300] gradient-glow opacity-90 rounded-b-[80px]" />
        
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Particle left="10%" delay="0s" size="8px" />
          <Particle left="25%" delay="0.5s" size="12px" />
          <Particle left="45%" delay="1.2s" size="6px" />
          <Particle left="70%" delay="0.8s" size="10px" />
          <Particle left="90%" delay="0.3s" size="14px" />
          <FloatingGift top="10%" left="5%" delay="0s" scale="0.8" />
          <FloatingGift top="40%" left="85%" delay="-1.5s" scale="1.2" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col items-center">
          <div className="bg-black/10 backdrop-blur-md px-6 py-2 rounded-full mb-8 border border-white/20 animate-pulse-soft">
             <span className="text-black font-black text-[11px] uppercase tracking-[0.3em]">
               🔥 1.2M+ Rewards Claimed Today
             </span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black text-black leading-[0.85] tracking-tighter mb-8">
            REWARDS <br/>
            <span className="text-white drop-shadow-2xl italic">REIMAGINED.</span>
          </h1>
          
          <p className="text-black/70 font-bold text-xl md:text-2xl max-w-2xl mb-12 leading-tight">
            Stop carrying plastic cards. Scan, earn, and redeem rewards instantly at your favorite local spots.
          </p>
          
          {!user && (
            <div className="flex flex-col sm:flex-row gap-4 relative z-20">
              <button 
                onClick={() => onNavigate('#/login')}
                className="bg-black text-[#FFD300] px-10 py-6 rounded-[2rem] font-black text-xl shadow-2xl hover:scale-105 active:scale-95 transition-all"
              >
                Get Started
              </button>
              <button 
                onClick={() => onNavigate('#/auth/vendor')}
                className="bg-white text-black px-10 py-6 rounded-[2rem] font-black text-xl shadow-xl hover:scale-105 active:scale-95 transition-all border border-gray-100"
              >
                For Businesses
              </button>
            </div>
          )}
        </div>
      </div>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-32 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#FFD300] bg-black px-4 py-2 rounded-full">Simple 3-Step Flow</span>
            <h2 className="text-5xl font-black text-black mt-6 tracking-tighter italic">How it Works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {[
              { step: '01', title: 'Scan QR Code', desc: 'No app download needed. Just scan the merchant QR code at checkout.', icon: '📸' },
              { step: '02', title: 'Earn Points', desc: 'Every purchase adds digital stamps or points to your wallet instantly.', icon: '⚡' },
              { step: '03', title: 'Redeem Perks', desc: 'Use your points to unlock free coffee, discounts, and exclusive gifts.', icon: '🎁' }
            ].map((item, idx) => (
              <div key={idx} className="relative group">
                <div className="text-8xl font-black text-gray-50 absolute -top-10 -left-6 z-0 transition-colors group-hover:text-[#FFD300]/10">{item.step}</div>
                <div className="relative z-10 flex flex-col items-start gap-4">
                  <div className="h-16 w-16 bg-gray-50 rounded-2xl flex items-center justify-center text-3xl group-hover:bg-black group-hover:text-[#FFD300] transition-all">
                    {item.icon}
                  </div>
                  <h3 className="text-2xl font-black text-black">{item.title}</h3>
                  <p className="text-gray-400 font-medium leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Businesses Section */}
      <section className="py-32 px-6 bg-gray-50 rounded-t-[80px]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1">
            <span className="text-xs font-black text-[#FFD300] uppercase tracking-widest bg-black px-4 py-1.5 rounded-full">Business Power</span>
            <h2 className="text-5xl font-black text-black mt-6 leading-[0.9] tracking-tighter">BOOST YOUR <br/> <span className="italic">REPEAT SALES.</span></h2>
            <p className="text-gray-500 text-lg font-medium mt-8 mb-10 leading-relaxed">
              Launch your own branded loyalty program in under 5 minutes. Track customer behavior, automate rewards, and build a community of loyal fans.
            </p>
            <ul className="space-y-4 mb-10">
              {['Smart QR Code Generation', 'AI-Powered Offer Recommendations', 'Real-time Sales Analytics', 'No App Install Required'].map((feat, i) => (
                <li key={i} className="flex items-center gap-3 font-bold text-black">
                  <div className="h-6 w-6 bg-black text-[#FFD300] rounded-full flex items-center justify-center text-[10px]">✓</div>
                  {feat}
                </li>
              ))}
            </ul>
            <button onClick={() => onNavigate('#/auth/vendor')} className="bg-black text-[#FFD300] px-10 py-5 rounded-2xl font-black shadow-xl hover:scale-105 transition-all">
              Register Your Shop
            </button>
          </div>
          <div className="flex-1 relative">
             <div className="bg-black p-1 rounded-[48px] shadow-2xl rotate-3 relative z-10">
                <div className="bg-white p-10 rounded-[44px]">
                   <img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=loyaltyhub-demo&color=000000&bgcolor=ffffff" alt="QR Preview" className="w-full" />
                   <div className="mt-8 text-center">
                      <p className="font-black text-black text-xl">DEMO MERCHANT</p>
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Scan to test flow</p>
                   </div>
                </div>
             </div>
             <div className="absolute -bottom-10 -right-10 h-64 w-64 bg-[#FFD300] rounded-full blur-[80px] -z-10 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Trust & Stats Section */}
      <section className="bg-black py-24 px-8 rounded-t-[80px]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 text-center">
           {[
             { label: 'Active Users', val: '2.5M+', icon: '💎' },
             { label: 'Merchant Network', val: '15,000+', icon: '🏢' },
             { label: 'Points Issued', val: '4.8B+', icon: '⚡' }
           ].map((stat, i) => (
             <div key={i} className="flex flex-col items-center gap-4">
               <div className="text-5xl mb-2">{stat.icon}</div>
               <h4 className="text-[#FFD300] text-5xl font-black tracking-tighter">{stat.val}</h4>
               <p className="text-white/40 font-bold uppercase text-xs tracking-widest">{stat.label}</p>
             </div>
           ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black pt-20 pb-10 px-8 text-white/40 border-t border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-[#FFD300] rounded-xl flex items-center justify-center rotate-3">
              <span className="text-black font-black text-xl italic">L!</span>
            </div>
            <span className="text-xl font-black tracking-tighter text-white">LoyaltyHub</span>
          </div>
          <div className="flex gap-8 font-black uppercase text-[10px] tracking-[0.2em]">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
          <p className="text-[10px] font-bold uppercase">© 2024 LoyaltyHub Global Systems</p>
        </div>
      </footer>

      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
