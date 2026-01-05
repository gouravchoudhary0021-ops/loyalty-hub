
import React, { useState, useEffect } from 'react';
import { User, Vendor, Transaction } from '../types';
import { getVendors, getTransactions, saveVendors } from '../services/store';
import { getAdminInsights } from '../services/geminiService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [insights, setInsights] = useState('Analyzing global node activity...');
  const [isAdding, setIsAdding] = useState(false);
  const [revokingVendor, setRevokingVendor] = useState<Vendor | null>(null);
  const [newVendor, setNewVendor] = useState({ name: '', category: 'Cafe', phone: '' });
  const [isExploding, setIsExploding] = useState(false);

  useEffect(() => {
    const v = getVendors();
    const t = getTransactions();
    setVendors(v);
    setTransactions(t);

    const fetchInsights = async () => {
      const summary = {
        totalVendors: v.length,
        totalTxs: t.length,
        totalPoints: t.reduce((a, c) => a + c.points, 0)
      };
      const text = await getAdminInsights(summary);
      setInsights(text);
    };
    fetchInsights();
  }, []);

  const handleAddVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (newVendor.phone.length < 10) {
      alert('Please enter a valid 10-digit merchant phone number');
      return;
    }

    const v: Vendor = {
      id: 'v' + Date.now(),
      name: newVendor.name,
      category: newVendor.category,
      logo: `https://picsum.photos/seed/${newVendor.name}/200`,
      qrUrl: `https://loyaltyhub.app/v${vendors.length + 1}`,
      pointsPerRupee: 0.1,
      totalScans: 0,
      totalCustomers: 0,
      authorizedPhone: newVendor.phone
    };
    const updated = [...vendors, v];
    setVendors(updated);
    saveVendors(updated);
    setIsAdding(false);
    setNewVendor({ name: '', category: 'Cafe', phone: '' });
  };

  const confirmRevoke = () => {
    if (!revokingVendor) return;
    
    setIsExploding(true);
    setTimeout(() => {
      const updated = vendors.filter(v => v.id !== revokingVendor.id);
      setVendors(updated);
      saveVendors(updated);
      setRevokingVendor(null);
      setIsExploding(false);
    }, 1200);
  };

  // Prepare chart data
  const chartData = [
    { name: 'Mon', scans: 400 },
    { name: 'Tue', scans: 300 },
    { name: 'Wed', scans: 200 },
    { name: 'Thu', scans: 278 },
    { name: 'Fri', scans: 189 },
    { name: 'Sat', scans: 239 },
    { name: 'Sun', scans: 349 },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col lg:flex-row font-['Outfit'] relative overflow-x-hidden">
       {/* Global Spark Effect */}
       {isExploding && (
         <div className="fixed inset-0 z-[300] bg-orange-600/20 backdrop-blur-sm pointer-events-none flex items-center justify-center">
            <div className="h-64 w-64 bg-orange-500 rounded-full animate-ping opacity-50"></div>
            <div className="absolute text-9xl animate-bounce">🔥</div>
         </div>
       )}

       {/* Sidebar */}
       <aside className="w-full lg:w-80 bg-black text-white p-10 border-r border-white/5 shadow-2xl z-20">
          <div className="flex items-center gap-4 mb-16">
            <div className="h-14 w-14 bg-white rounded-[20px] flex items-center justify-center rotate-3 shadow-xl animate-pulse-soft">
              <span className="text-black font-black text-3xl italic">L!</span>
            </div>
            <div className="flex flex-col">
               <span className="font-black text-2xl tracking-tighter">GLOBAL</span>
               <span className="text-[10px] font-black text-[#FFD300] tracking-[4px] uppercase">Control Panel</span>
            </div>
          </div>
          
          <nav className="space-y-4">
             <button className="w-full text-left p-5 rounded-[2rem] bg-white/10 font-black text-white flex items-center gap-4 shadow-lg border border-white/5">
               <div className="h-10 w-10 bg-[#FFD300] rounded-2xl flex items-center justify-center text-black">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011-1v5m-4 0h4"/></svg>
               </div>
               Merchant Registry
             </button>
             <button className="w-full text-left p-5 rounded-[2rem] hover:bg-white/5 font-black text-white/40 flex items-center gap-4 transition-all">
               <div className="h-10 w-10 bg-white/5 rounded-2xl flex items-center justify-center">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
               </div>
               User Wallets
             </button>
             <button onClick={onLogout} className="w-full text-left p-5 rounded-[2rem] hover:bg-red-500/20 font-black text-red-400 mt-20 flex items-center gap-4 border border-transparent hover:border-red-500/30 transition-all">
               <div className="h-10 w-10 bg-red-500/10 rounded-2xl flex items-center justify-center">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
               </div>
               Logout Session
             </button>
          </nav>
       </aside>

       {/* Main Dashboard Area */}
       <main className="flex-1 p-8 lg:p-14 overflow-y-auto max-h-screen">
          <header className="mb-14 flex flex-col md:flex-row md:items-center justify-between gap-8">
             <div>
               <h1 className="text-5xl font-black text-black tracking-tighter italic">System Console.</h1>
               <div className="flex items-center gap-3 mt-2">
                 <span className="h-2 w-2 bg-green-500 rounded-full animate-ping"></span>
                 <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.4em]">Global Node: ACTIVE-ONLINE</p>
               </div>
             </div>
             <button 
                onClick={() => setIsAdding(true)}
                className="bg-black text-[#FFD300] px-10 py-5 rounded-[2.5rem] font-black shadow-[0_20px_50px_rgba(0,0,0,0.2)] hover:scale-105 hover:rotate-2 active:scale-95 transition-all flex items-center gap-4"
             >
                <span className="text-2xl">⚡</span>
                REGISTER NEW MERCHANT
             </button>
          </header>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-10 mb-14">
             {/* AI Insight Header */}
             <div className="xl:col-span-2 p-10 bg-indigo-600 rounded-[50px] shadow-2xl flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group">
                <div className="absolute top-[-50px] left-[-50px] w-64 h-64 bg-white/5 rounded-full blur-[80px] group-hover:scale-150 transition-transform duration-1000" />
                <div className="bg-black/20 p-6 rounded-3xl relative z-10 backdrop-blur-md">
                   <svg className="w-10 h-10 text-[#FFD300] animate-spin-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <div className="relative z-10 text-center md:text-left">
                   <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em] mb-2">Network Pulse Awareness</p>
                   <p className="text-2xl font-black text-white leading-tight italic max-w-3xl drop-shadow-lg">"{insights}"</p>
                </div>
             </div>

             {/* Mini Trend Chart */}
             <div className="bg-white p-8 rounded-[50px] shadow-xl border border-gray-100">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Scan Growth</h3>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FFD300" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#FFD300" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="scans" stroke="#FFD300" fillOpacity={1} fill="url(#colorScans)" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
             </div>
          </div>

          {/* Core Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
             {[
               { label: 'Active Merchants', value: vendors.length, icon: '🏢', color: 'bg-white' },
               { label: 'Platform Scans', value: transactions.length, icon: '⚡', color: 'bg-[#FFD300]' },
               { label: 'Reward Points', value: transactions.reduce((a, c) => a + c.points, 0).toLocaleString(), icon: '💎', color: 'bg-white' },
               { label: 'Global Revenue', value: `₹${transactions.reduce((a, c) => a + c.amount, 0).toLocaleString()}`, icon: '💰', color: 'bg-white' }
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

          {/* High-Fidelity Merchant List */}
          <section className="space-y-8 pb-32">
             <div className="flex justify-between items-end mb-4">
                <div>
                   <h2 className="text-3xl font-black text-black italic tracking-tighter">Merchant Network 🌐</h2>
                   <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Global Node Monitoring</p>
                </div>
                <div className="flex gap-2">
                   <div className="h-2 w-2 bg-black rounded-full"></div>
                   <div className="h-2 w-2 bg-black opacity-20 rounded-full"></div>
                </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {vendors.map(v => (
                  <div key={v.id} className="bg-white p-8 rounded-[48px] border border-gray-100 shadow-xl hover:border-black/5 transition-all group relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-4">
                        <span className="text-[8px] font-black bg-green-50 text-green-500 px-3 py-1 rounded-full border border-green-100 uppercase">Status: Live</span>
                     </div>
                     
                     <div className="flex items-center gap-5 mb-8">
                        <img src={v.logo} className="h-16 w-16 rounded-[24px] object-cover shadow-lg border border-gray-100 group-hover:rotate-6 transition-transform" />
                        <div>
                           <h3 className="text-xl font-black text-black tracking-tight">{v.name}</h3>
                           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{v.category}</p>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-gray-50 p-4 rounded-3xl text-center">
                           <p className="text-2xl font-black text-black">{v.totalScans}</p>
                           <p className="text-[8px] font-bold text-gray-400 uppercase">Scans</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-3xl text-center">
                           <p className="text-2xl font-black text-black">+{v.totalCustomers}</p>
                           <p className="text-[8px] font-bold text-gray-400 uppercase">Growth</p>
                        </div>
                     </div>

                     <div className="flex items-center justify-between mb-8 px-2">
                        <div className="flex flex-col">
                           <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Auth Number</span>
                           <span className="text-sm font-black text-black">+91 {v.authorizedPhone}</span>
                        </div>
                        <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/></svg>
                        </div>
                     </div>

                     <button 
                        onClick={() => setRevokingVendor(v)}
                        className="w-full bg-red-50 text-red-500 py-4 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all border border-red-100"
                     >
                        REVOKE NETWORK ACCESS
                     </button>
                  </div>
                ))}
             </div>
          </section>
       </main>

       {/* Custom Revoke Confirmation Modal */}
       {revokingVendor && (
         <div className="fixed inset-0 z-[400] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 animate-fadeIn">
            <div className="bg-white w-full max-w-sm rounded-[60px] p-12 text-center shadow-2xl relative overflow-hidden">
               <div className="absolute top-[-40px] left-[-40px] w-64 h-64 bg-red-500/10 rounded-full blur-[60px]" />
               
               <div className="h-28 w-28 bg-red-100 text-red-600 rounded-[40px] flex items-center justify-center mx-auto mb-10 shadow-xl border-4 border-white rotate-12">
                  <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
               </div>
               
               <h3 className="text-3xl font-black text-black tracking-tighter mb-4 italic leading-tight">Destroy Node?</h3>
               <p className="text-gray-400 font-bold text-sm leading-relaxed mb-10">
                  Revoking <span className="text-red-600 font-black">{revokingVendor.name}</span> will immediately disconnect their terminal and invalidate their QR codes.
               </p>
               
               <div className="flex flex-col gap-4">
                  <button 
                    onClick={confirmRevoke}
                    className="w-full bg-red-600 text-white py-6 rounded-[2.5rem] font-black text-lg shadow-[0_20px_40px_rgba(220,38,38,0.3)] active:scale-95 transition-all"
                  >
                    CONFIRM REVOKE 🔥
                  </button>
                  <button 
                    onClick={() => setRevokingVendor(null)}
                    className="w-full py-6 rounded-[2.5rem] font-black text-sm uppercase tracking-widest text-gray-300 hover:text-black transition-colors"
                  >
                    Keep Merchant
                  </button>
               </div>
            </div>
         </div>
       )}

       {/* Add Vendor Modal */}
       {isAdding && (
         <div className="fixed inset-0 z-[400] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6 animate-fadeIn">
            <div className="bg-white w-full max-w-md rounded-[60px] p-12 shadow-2xl relative overflow-hidden">
               <div className="absolute top-[-30px] right-[-30px] w-64 h-64 bg-[#FFD300]/10 rounded-full blur-[60px]" />
               
               <div className="flex justify-between items-start mb-12 relative z-10">
                  <div>
                    <h3 className="text-4xl font-black text-black tracking-tighter italic">Onboard.</h3>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mt-1">Network Authorization</p>
                  </div>
                  <button onClick={() => setIsAdding(false)} className="h-12 w-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 hover:text-black transition-colors">
                     <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
               </div>
               
               <form onSubmit={handleAddVendor} className="space-y-8 relative z-10">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] ml-4">Merchant Title</label>
                     <div className="bg-gray-50 p-6 rounded-[32px] border border-gray-100 focus-within:border-[#FFD300] transition-colors">
                        <input 
                           type="text" 
                           required
                           className="bg-transparent w-full text-xl font-black text-black outline-none placeholder:text-gray-200"
                           placeholder="e.g. Starbucks Global"
                           value={newVendor.name}
                           onChange={e => setNewVendor({...newVendor, name: e.target.value})}
                        />
                     </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] ml-4">Category</label>
                        <div className="bg-gray-50 p-6 rounded-[32px] border border-gray-100">
                           <select 
                              className="bg-transparent w-full font-black text-black outline-none appearance-none cursor-pointer"
                              value={newVendor.category}
                              onChange={e => setNewVendor({...newVendor, category: e.target.value})}
                           >
                              <option value="Cafe">Cafe</option>
                              <option value="Restaurant">Food</option>
                              <option value="Retail">Retail</option>
                              <option value="Luxury">Luxury</option>
                           </select>
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] ml-4">Auth Code</label>
                        <div className="bg-black p-6 rounded-[32px] text-center border border-white/10">
                           <span className="text-[#FFD300] font-black text-xl italic">+91</span>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] ml-4">Authorized Phone</label>
                     <div className="bg-gray-50 p-6 rounded-[32px] border border-gray-100">
                        <input 
                           type="tel" 
                           maxLength={10}
                           required
                           className="bg-transparent w-full text-xl font-black text-black outline-none placeholder:text-gray-200"
                           placeholder="00000 00000"
                           value={newVendor.phone}
                           onChange={e => setNewVendor({...newVendor, phone: e.target.value.replace(/\D/g, '')})}
                        />
                     </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-black text-[#FFD300] py-7 rounded-[2.5rem] font-black text-xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] active:scale-95 transition-all mt-4"
                  >
                    AUTHORIZE NODE ⚡
                  </button>
               </form>
            </div>
         </div>
       )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
        .spin-slow { animation: spin-slow 8s linear infinite; }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
