
import React, { useState, useEffect } from 'react';
import { User, Vendor, Transaction, Reward } from '../types';
import { getVendors, getTransactions, saveTransaction, getRewards, addReward } from '../services/store';
import { generateRewardIdeas } from '../services/geminiService';

interface VendorDashboardProps {
  user: User;
  onLogout: () => void;
}

const QRModal: React.FC<{ vendor: Vendor; onClose: () => void }> = ({ vendor, onClose }) => {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=loyaltyhub://vendor/${vendor.id}&color=000000&bgcolor=ffffff&margin=10`;

  return (
    <div className="fixed inset-0 z-[250] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6 animate-fadeIn">
      {/* Background Fire Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-yellow-400/10 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '-2s' }}></div>
      </div>

      <div className="relative w-full max-w-sm flex flex-col items-center">
        {/* Header */}
        <div className="w-full flex justify-between items-center mb-8 text-white relative z-10">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-[#FFD300] uppercase tracking-[0.4em]">Merchant Terminal</span>
            <h3 className="text-2xl font-black italic tracking-tighter">REDEMPTION NODE</h3>
          </div>
          <button onClick={onClose} className="p-4 bg-white/10 rounded-3xl hover:bg-white/20 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        {/* QR Frame */}
        <div className="relative group">
          {/* Animated Scanning Line */}
          <div className="absolute inset-0 z-20 pointer-events-none rounded-[60px] overflow-hidden">
            <div className="w-full h-1 bg-[#FFD300] shadow-[0_0_20px_#FFD300] absolute top-0 animate-[qr-scan_3s_infinite_ease-in-out]"></div>
          </div>
          
          {/* Outer Border Glow */}
          <div className="absolute -inset-4 bg-gradient-to-tr from-[#FFD300] to-orange-600 rounded-[70px] opacity-20 blur-xl group-hover:opacity-40 transition-opacity"></div>
          
          <div className="bg-white p-10 rounded-[60px] shadow-2xl relative z-10 border-8 border-black">
             <img src={qrUrl} alt="Vendor QR" className="w-64 h-64 rounded-xl" />
          </div>
        </div>

        {/* Merchant Info Card */}
        <div className="mt-12 w-full bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-[40px] text-center">
           <div className="flex items-center justify-center gap-4 mb-4">
              <img src={vendor.logo} className="h-12 w-12 rounded-2xl object-cover border-2 border-[#FFD300]" alt="" />
              <div className="text-left">
                 <h4 className="text-white font-black text-xl leading-tight">{vendor.name}</h4>
                 <p className="text-[#FFD300] text-[9px] font-black uppercase tracking-widest">{vendor.category} • {vendor.id}</p>
              </div>
           </div>
           <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
             Direct customers to scan this code <br/> during checkout to earn instant points
           </p>
        </div>

        <button 
          onClick={() => window.print()}
          className="mt-8 w-full bg-[#FFD300] text-black py-6 rounded-[2.5rem] font-black text-lg shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2-2v4"/></svg>
          PRINT MERCHANT KIT
        </button>
      </div>

      <style>{`
        @keyframes qr-scan {
          0% { top: 0%; opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

const VendorDashboard: React.FC<VendorDashboardProps> = ({ user, onLogout }) => {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [amount, setAmount] = useState('');
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [isSuccessBlast, setIsSuccessBlast] = useState(false);

  useEffect(() => {
    const v = getVendors().find(v => v.id === user.vendorId);
    if (v) setVendor(v);
    setTransactions(getTransactions().filter(t => t.vendorId === user.vendorId));
    setRewards(getRewards(user.vendorId));
  }, [user.vendorId]);

  const handleCredit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendor || !amount) return;
    
    const points = Math.floor(parseFloat(amount) * vendor.pointsPerRupee);
    const tx: Transaction = {
      id: 'tx_' + Date.now(),
      userId: 'mock_user_1',
      vendorId: vendor.id,
      amount: parseFloat(amount),
      points,
      type: 'CREDIT',
      status: 'COMPLETED',
      date: new Date().toISOString(),
      description: `Billing at ${vendor.name}`
    };

    saveTransaction(tx);
    setTransactions([...transactions, tx]);
    setAmount('');
    setIsSuccessBlast(true);
    setTimeout(() => setIsSuccessBlast(false), 2000);
  };

  const handleSuggestRewards = async () => {
    if (!vendor) return;
    setIsGenerating(true);
    const ideas = await generateRewardIdeas(vendor.name, vendor.category);
    if (ideas && ideas.length > 0) {
      const newReward: Reward = {
        id: 'r_' + Date.now(),
        vendorId: vendor.id,
        ...ideas[0]
      };
      addReward(newReward);
      setRewards([...rewards, newReward]);
    }
    setIsGenerating(false);
  };

  if (!vendor) return <div className="p-10 font-black">Loading Merchant Terminal...</div>;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#F3F4F6] font-['Outfit'] relative overflow-x-hidden">
      {/* Success Blast Overlay */}
      {isSuccessBlast && (
        <div className="fixed inset-0 z-[300] bg-[#FFD300]/10 pointer-events-none flex items-center justify-center">
           <div className="h-64 w-64 bg-[#FFD300] rounded-full animate-ping opacity-30"></div>
           <div className="absolute text-9xl animate-bounce">🔥</div>
        </div>
      )}

      {showQR && <QRModal vendor={vendor} onClose={() => setShowQR(false)} />}

      {/* Black Sidebar */}
      <aside className="w-full lg:w-80 bg-black text-white lg:min-h-screen p-10 shadow-2xl flex flex-col border-r border-white/5">
        <div className="flex items-center gap-4 mb-16">
           <div className="h-14 w-14 bg-[#FFD300] rounded-[24px] flex items-center justify-center rotate-3 shadow-2xl animate-pulse-soft">
              <span className="text-black font-black text-3xl italic">L!</span>
            </div>
            <div className="flex flex-col">
               <span className="font-black text-2xl tracking-tighter">MERCHANT</span>
               <span className="text-[10px] font-bold text-[#FFD300] tracking-[4px] uppercase">Terminal v2.0</span>
            </div>
        </div>
        
        <nav className="space-y-4 flex-1">
          <button className="w-full text-left p-5 rounded-[2rem] bg-white/10 font-black text-[#FFD300] flex items-center gap-4 shadow-lg border border-white/5">
            <div className="h-10 w-10 bg-[#FFD300]/10 rounded-2xl flex items-center justify-center">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
            </div>
            Overview
          </button>
          <button className="w-full text-left p-5 rounded-[2rem] hover:bg-white/5 font-black text-white/40 flex items-center gap-4 transition-all">
            <div className="h-10 w-10 bg-white/5 rounded-2xl flex items-center justify-center">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            </div>
            Performance
          </button>
          <button className="w-full text-left p-5 rounded-[2rem] hover:bg-white/5 font-black text-white/40 flex items-center gap-4 transition-all">
             <div className="h-10 w-10 bg-white/5 rounded-2xl flex items-center justify-center">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
             </div>
             Loyalty Chain
          </button>
        </nav>

        <button onClick={onLogout} className="w-full text-left p-5 rounded-[2rem] hover:bg-red-500/20 font-black text-red-400 mt-12 flex items-center gap-4 border border-transparent hover:border-red-500/30 transition-all">
           <div className="h-10 w-10 bg-red-500/10 rounded-2xl flex items-center justify-center">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
           </div>
           Logout Terminal
        </button>
      </aside>

      {/* Main Panel */}
      <main className="flex-1 p-8 lg:p-14 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
          <div>
            <h1 className="text-5xl font-black text-black tracking-tighter italic">Hello, {vendor.name}! 👋</h1>
            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.4em] mt-2">Node Authorized • {vendor.category} Global</p>
          </div>
          <button 
            onClick={() => setShowQR(true)}
            className="bg-black text-[#FFD300] px-10 py-6 rounded-[2.5rem] font-black shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center gap-4 hover:scale-105 hover:rotate-2 active:scale-95 transition-all group overflow-hidden relative"
          >
             <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-0 transition-transform skew-x-12 duration-500"></div>
             <svg className="w-7 h-7 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/></svg>
             <span className="relative z-10">DISPLAY TERMINAL QR</span>
          </button>
        </header>

        {/* Real-time Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
           {[
             { label: 'Network Scans', value: vendor.totalScans, icon: '🔥', color: 'bg-white' },
             { label: 'Authorized Users', value: vendor.totalCustomers, icon: '🛡️', color: 'bg-white' },
             { label: 'Global Points Out', value: transactions.filter(t => t.type === 'CREDIT').reduce((a, c) => a + c.points, 0).toLocaleString(), icon: '⚡', color: 'bg-[#FFD300]' }
           ].map((stat, i) => (
             <div key={i} className={`${stat.color} p-10 rounded-[48px] shadow-sm border border-gray-100 flex flex-col gap-4 group hover:shadow-2xl hover:-translate-y-2 transition-all`}>
                <div className="text-4xl group-hover:scale-125 transition-transform">{stat.icon}</div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className="text-4xl font-black text-black tracking-tighter">{stat.value}</p>
                </div>
             </div>
           ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-10">
           {/* Terminal Action: Issue Points */}
           <div className="xl:col-span-2 bg-black text-[#FFD300] p-10 rounded-[60px] shadow-[0_30px_70px_rgba(0,0,0,0.3)] relative overflow-hidden group">
              <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-white/5 rounded-full blur-[80px] group-hover:scale-150 transition-transform duration-1000" />
              <h2 className="text-3xl font-black mb-10 italic tracking-tighter relative z-10">Stamp Node ⚡</h2>
              <form onSubmit={handleCredit} className="space-y-8 relative z-10">
                 <div className="space-y-4">
                   <label className="text-[10px] font-black uppercase tracking-[0.3em] block ml-6 text-white/40">Total Bill Value (₹)</label>
                   <div className="bg-white/10 rounded-[2.5rem] p-8 focus-within:bg-white/20 transition-all border border-white/5">
                      <input 
                        type="number" 
                        required
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-transparent border-none text-5xl font-black text-white outline-none placeholder:text-white/10 tracking-tighter"
                        placeholder="0.00"
                      />
                   </div>
                 </div>
                 <div className="flex justify-between items-center p-8 bg-white/5 rounded-[2.5rem] border border-white/5">
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Rewards to Node:</span>
                    <span className="text-5xl font-black text-white italic tracking-tighter">{amount ? Math.floor(parseFloat(amount) * vendor.pointsPerRupee) : 0} <span className="text-sm font-black text-[#FFD300]">PTS</span></span>
                 </div>
                 <button className="w-full bg-[#FFD300] text-black py-7 rounded-[2.5rem] font-black text-xl shadow-2xl hover:bg-yellow-400 hover:scale-[1.02] active:scale-95 transition-all">
                    AUTHORIZE POINTS
                 </button>
              </form>
           </div>

           {/* Reward Matrix Management */}
           <div className="xl:col-span-3 bg-white p-10 rounded-[60px] border border-gray-100 shadow-xl overflow-hidden relative">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                 <div>
                    <h2 className="text-3xl font-black text-black italic tracking-tighter">Offer Grid 🎁</h2>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Authorized Rewards Live</p>
                 </div>
                 <button 
                   onClick={handleSuggestRewards}
                   disabled={isGenerating}
                   className="bg-indigo-600 text-white px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center gap-2"
                 >
                   {isGenerating ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : '⚡ AI IDEAS'}
                 </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
                 {rewards.map(reward => (
                   <div key={reward.id} className="p-8 rounded-[40px] bg-gray-50 border border-gray-100 group hover:border-[#FFD300] hover:shadow-2xl transition-all relative overflow-hidden">
                      <div className="flex justify-between items-start mb-6">
                         <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-gray-100 group-hover:scale-110 transition-transform">🎁</div>
                         <span className="bg-black text-[#FFD300] text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg">{reward.pointsRequired}P</span>
                      </div>
                      <h4 className="font-black text-black text-xl leading-tight mb-2 tracking-tight">{reward.title}</h4>
                      <p className="text-xs font-medium text-gray-400 leading-relaxed mb-6 line-clamp-2">{reward.description}</p>
                      <button className="text-[10px] font-black text-red-400 hover:text-red-600 uppercase tracking-[0.2em] flex items-center gap-2">
                         <div className="h-1.5 w-1.5 bg-red-400 rounded-full"></div>
                         Revoke Offer
                      </button>
                   </div>
                 ))}
                 
                 <button className="p-8 border-4 border-dashed border-gray-100 rounded-[40px] flex flex-col items-center justify-center text-gray-300 hover:text-black hover:border-[#FFD300] hover:bg-[#FFD300]/5 transition-all group h-full min-h-[220px]">
                    <div className="h-14 w-14 bg-gray-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                       <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"/></svg>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Add New Reward Node</span>
                 </button>
              </div>
           </div>
        </div>
      </main>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default VendorDashboard;
