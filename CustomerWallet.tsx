
import React, { useState, useEffect, useRef } from 'react';
import { User, Transaction, Vendor, Reward } from '../types';
import { getTransactions, getVendors, getRewards, saveTransaction } from '../services/store';

interface CustomerWalletProps {
  user: User;
  onLogout: () => void;
}

// Visual Confetti Component
const Confetti: React.FC = () => (
  <div className="fixed inset-0 pointer-events-none z-[200] overflow-hidden">
    {[...Array(20)].map((_, i) => (
      <div
        key={i}
        className="absolute w-2 h-2 rounded-full animate-confetti"
        style={{
          left: `${Math.random() * 100}%`,
          backgroundColor: ['#FFD300', '#F97316', '#3B82F6', '#10B981'][Math.floor(Math.random() * 4)],
          animationDelay: `${Math.random() * 2}s`,
          animationDuration: `${2 + Math.random() * 2}s`
        }}
      />
    ))}
    <style>{`
      @keyframes confetti {
        0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
        100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
      }
      .animate-confetti { animation: confetti linear infinite; }
    `}</style>
  </div>
);

const ScannerOverlay: React.FC<{ onClose: () => void; onScanSuccess: (vendor: Vendor) => void }> = ({ onClose, onScanSuccess }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<'INITIALIZING' | 'PERMISSION_DENIED' | 'SCANNING' | 'SUCCESS'>('INITIALIZING');
  
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            setStatus('SCANNING');
            setTimeout(() => {
              const vendors = getVendors();
              const vendor = vendors[Math.floor(Math.random() * vendors.length)];
              setStatus('SUCCESS');
              setTimeout(() => {
                stream.getTracks().forEach(t => t.stop());
                onScanSuccess(vendor);
              }, 800);
            }, 2500);
          };
        }
      } catch (err) { setStatus('PERMISSION_DENIED'); }
    };
    startCamera();
    return () => {
       if (videoRef.current?.srcObject) (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[150] bg-black flex flex-col items-center justify-center font-['Outfit']">
      <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover opacity-50" />
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-between p-10">
        <div className="w-full flex justify-between items-center text-white">
          <h3 className="text-xl font-black italic tracking-tighter">STAMP HUNTER</h3>
          <button onClick={onClose} className="p-3 bg-white/10 rounded-2xl"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg></button>
        </div>
        <div className="w-64 h-64 border-4 border-dashed border-[#FFD300] rounded-[40px] flex items-center justify-center">
           {status === 'SUCCESS' && <div className="h-20 w-20 bg-[#FFD300] rounded-full animate-ping" />}
        </div>
        <p className="text-[#FFD300] font-black text-xs uppercase tracking-widest animate-pulse">{status === 'SCANNING' ? 'Align QR to earn points' : 'Verifying Merchant...'}</p>
      </div>
    </div>
  );
};

const VoucherModal: React.FC<{ tx: Transaction; onClose: () => void }> = ({ tx, onClose }) => (
  <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-fadeIn">
    <div className="bg-white w-full max-w-sm rounded-[48px] overflow-hidden shadow-2xl relative">
      <div className="bg-[#FFD300] p-10 text-center relative">
         <div className="absolute top-4 right-6">
            <button onClick={onClose} className="text-black/40"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M6 18L18 6M6 6l12 12"/></svg></button>
         </div>
         <div className="h-20 w-20 bg-black rounded-3xl mx-auto mb-4 flex items-center justify-center text-4xl shadow-xl">🎁</div>
         <h3 className="text-2xl font-black text-black tracking-tighter">Your Reward Voucher</h3>
         <p className="text-[10px] font-bold uppercase text-black/60 mt-1 tracking-widest">Show this at the counter</p>
      </div>
      <div className="p-8 text-center space-y-6">
         <div className="border-2 border-dashed border-gray-100 rounded-3xl p-6">
            <h4 className="text-xl font-black text-black">{tx.description}</h4>
            <p className="text-xs font-bold text-gray-400 mt-1">ID: {tx.id.toUpperCase()}</p>
            <div className="mt-6 h-32 w-32 bg-gray-50 mx-auto rounded-2xl flex items-center justify-center border border-gray-100">
               <svg className="w-20 h-20 text-black/10" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3zm1 2v1h1V5h-1zm-3 8a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-3zm2 2v-1h1v1h-1z" clipRule="evenodd"/><path d="M11 4a1 1 0 10-2 0v1a1 1 0 002 0V4zM10 7a1 1 0 011 1v1h2a1 1 0 110 2h-3a1 1 0 01-1-1V8a1 1 0 011-1zM16 9a1 1 0 100 2 1 1 0 000-2zM9 13a1 1 0 011-1h1a1 1 0 110 2H10a1 1 0 01-1-1zM7 16a1 1 0 100 2h1a1 1 0 100-2H7zM14 16a1 1 0 100 2h1a1 1 0 100-2h-1z" /></svg>
            </div>
         </div>
         <p className="text-[10px] font-black text-green-500 uppercase tracking-widest flex items-center justify-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
            Security Verified Voucher
         </p>
         <button onClick={onClose} className="w-full bg-black text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest">Close Voucher</button>
      </div>
      <div className="absolute bottom-[-10px] left-0 right-0 h-4 flex justify-around">
         {[...Array(12)].map((_, i) => <div key={i} className="w-6 h-6 bg-[#F3F4F6] rounded-full" />)}
      </div>
    </div>
  </div>
);

const CustomerWallet: React.FC<CustomerWalletProps> = ({ user, onLogout }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [activeTab, setActiveTab] = useState<'HOME' | 'HISTORY' | 'OFFERS' | 'REDEEMED'>('HOME');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [activeVoucher, setActiveVoucher] = useState<Transaction | null>(null);

  useEffect(() => {
    setTransactions(getTransactions().filter(t => t.userId === user.id));
    setVendors(getVendors());
    setRewards(getRewards());
  }, [user.id]);

  const totalPoints = transactions.reduce((acc, curr) => curr.type === 'CREDIT' ? acc + curr.points : acc - curr.points, 0);

  const handleScanSuccess = (vendor: Vendor) => {
    const newTx: Transaction = {
      id: 'tx_s_' + Math.random().toString(36).substr(2, 9),
      userId: user.id, vendorId: vendor.id, amount: 0, points: 20, type: 'CREDIT', status: 'COMPLETED',
      date: new Date().toISOString(), description: `Check-in at ${vendor.name}`
    };
    saveTransaction(newTx);
    setTransactions(prev => [newTx, ...prev]);
    setIsScannerOpen(false);
    triggerCelebration();
  };

  const handleRedeem = (reward: Reward) => {
    if (totalPoints < reward.pointsRequired) {
      alert(`Missing ${reward.pointsRequired - totalPoints} points!`);
      return;
    }
    const newTx: Transaction = {
      id: 'tx_r_' + Math.random().toString(36).substr(2, 9),
      userId: user.id, vendorId: reward.vendorId, amount: 0, points: reward.pointsRequired,
      type: 'DEBIT', status: 'COMPLETED', date: new Date().toISOString(), description: reward.title
    };
    saveTransaction(newTx);
    setTransactions(prev => [newTx, ...prev]);
    setActiveVoucher(newTx);
    triggerCelebration();
  };

  const triggerCelebration = () => {
    setCelebrate(true);
    setTimeout(() => setCelebrate(false), 5000);
  };

  return (
    <div className="bg-[#F9FAFB] min-h-screen pb-32 font-['Outfit'] relative overflow-x-hidden">
      {celebrate && <Confetti />}
      {activeVoucher && <VoucherModal tx={activeVoucher} onClose={() => setActiveVoucher(null)} />}
      {isScannerOpen && <ScannerOverlay onClose={() => setIsScannerOpen(false)} onScanSuccess={handleScanSuccess} />}

      {/* Modern Header Area */}
      <header className="px-6 pt-10 pb-16 bg-[#FFD300] rounded-b-[60px] shadow-2xl relative overflow-hidden">
        <div className="absolute top-[-20px] right-[-20px] w-64 h-64 bg-black/5 rounded-full blur-3xl animate-pulse" />
        <div className="flex justify-between items-start relative z-10">
          <div>
            <span className="text-[10px] font-black uppercase text-black/50 tracking-[0.2em]">Wallet Balance</span>
            <div className="flex items-baseline gap-2">
              <h1 className="text-6xl font-black text-black tracking-tighter">{totalPoints}</h1>
              <span className="text-xl font-black text-black italic">PTS</span>
            </div>
          </div>
          <button onClick={onLogout} className="p-4 bg-black text-[#FFD300] rounded-[2rem] shadow-xl active:scale-90 transition-transform">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
          </button>
        </div>
      </header>

      <main className="px-6 -mt-8 relative z-10">
        {activeTab === 'HOME' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setIsScannerOpen(true)} className="bg-black text-[#FFD300] p-6 rounded-[32px] shadow-xl flex flex-col items-center gap-3 active:scale-95 transition-all">
                <div className="h-12 w-12 bg-[#FFD300]/10 rounded-2xl flex items-center justify-center text-2xl">⚡</div>
                <span className="text-[10px] font-black uppercase tracking-widest">Instant Scan</span>
              </button>
              <button onClick={() => setActiveTab('OFFERS')} className="bg-white text-black p-6 rounded-[32px] border border-gray-100 shadow-xl flex flex-col items-center gap-3 active:scale-95 transition-all">
                <div className="h-12 w-12 bg-gray-50 rounded-2xl flex items-center justify-center text-2xl">🎁</div>
                <span className="text-[10px] font-black uppercase tracking-widest">Browse Deals</span>
              </button>
            </div>

            {/* Stamp Progress Card */}
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-black text-black italic tracking-tight">Stamp Progress</h3>
                  <span className="text-[9px] font-black bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full uppercase">Bronze Tier</span>
               </div>
               <div className="grid grid-cols-5 gap-3">
                  {[...Array(5)].map((_, i) => {
                    const earned = (transactions.filter(t => t.type === 'CREDIT').length % 5) > i;
                    return (
                      <div key={i} className={`h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-700 ${earned ? 'bg-[#FFD300] border-[#FFD300] rotate-6 text-black scale-110 shadow-lg' : 'bg-gray-50 border-gray-100 text-gray-200'}`}>
                         {earned ? <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg> : <span className="text-xs font-black">{i+1}</span>}
                      </div>
                    );
                  })}
               </div>
               <p className="text-[10px] font-bold text-gray-400 mt-6 uppercase tracking-widest text-center">
                  {(transactions.filter(t => t.type === 'CREDIT').length % 5) === 0 ? "You're ready for a bonus!" : `${5 - (transactions.filter(t => t.type === 'CREDIT').length % 5)} stamps until 100 bonus pts`}
               </p>
            </div>

            {/* My Brands */}
            <section>
              <h2 className="text-xl font-black italic mb-4">Your Favorites Spot 🍕</h2>
              <div className="space-y-3">
                 {vendors.slice(0, 3).map(v => (
                   <div key={v.id} className="bg-white p-5 rounded-[32px] flex items-center justify-between border border-gray-100 shadow-sm active:bg-gray-50">
                      <div className="flex items-center gap-4">
                        <img src={v.logo} className="h-12 w-12 rounded-2xl object-cover" />
                        <div>
                          <h4 className="font-black text-black leading-none">{v.name}</h4>
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{v.category}</span>
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"/></svg>
                   </div>
                 ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'OFFERS' && (
          <div className="space-y-6 animate-fadeIn pt-4">
             <div className="bg-indigo-600 p-8 rounded-[48px] text-white relative overflow-hidden mb-8">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10" />
                <h3 className="text-3xl font-black italic leading-tight mb-2">Weekend <br/> Super-Saver!</h3>
                <p className="text-white/60 text-xs font-bold uppercase tracking-widest">3 Exclusive Deals Live</p>
             </div>
             {rewards.map(reward => {
               const canAfford = totalPoints >= reward.pointsRequired;
               return (
                 <div key={reward.id} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-xl flex flex-col gap-5">
                    <div className="flex justify-between items-start">
                       <div className="h-12 w-12 bg-[#FFD300]/10 rounded-2xl flex items-center justify-center text-2xl shadow-inner">💎</div>
                       <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${canAfford ? 'bg-green-100 text-green-600' : 'bg-red-50 text-red-400'}`}>
                         {reward.pointsRequired} PTS
                       </span>
                    </div>
                    <div>
                       <h4 className="text-xl font-black text-black tracking-tight">{reward.title}</h4>
                       <p className="text-xs font-medium text-gray-400 leading-relaxed mt-1">{reward.description}</p>
                    </div>
                    <button 
                      onClick={() => handleRedeem(reward)}
                      disabled={!canAfford}
                      className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${canAfford ? 'bg-black text-[#FFD300] shadow-xl active:scale-95' : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}
                    >
                      {canAfford ? 'UNLOCK REWARD' : 'NEED MORE POINTS'}
                    </button>
                 </div>
               );
             })}
          </div>
        )}

        {(activeTab === 'HISTORY' || activeTab === 'REDEEMED') && (
          <div className="space-y-4 animate-fadeIn pt-4">
             <h2 className="text-2xl font-black italic tracking-tighter mb-6">{activeTab === 'HISTORY' ? 'Activity Log 📜' : 'Redeemed Perks 🏆'}</h2>
             {transactions
               .filter(t => activeTab === 'HISTORY' ? true : t.type === 'DEBIT')
               .map((t, idx) => (
               <div 
                 key={t.id} 
                 onClick={() => t.type === 'DEBIT' && setActiveVoucher(t)}
                 className={`bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center justify-between transition-transform ${t.type === 'DEBIT' ? 'cursor-pointer active:scale-95 border-l-4 border-l-[#FFD300]' : ''}`}
               >
                  <div className="flex items-center gap-4">
                     <div className={`h-10 w-10 rounded-2xl flex items-center justify-center shadow-inner ${t.type === 'CREDIT' ? 'bg-green-50 text-green-500' : 'bg-orange-50 text-orange-500'}`}>
                        {t.type === 'CREDIT' ? '✨' : '🎁'}
                     </div>
                     <div>
                        <h4 className="font-black text-black leading-tight text-sm tracking-tight">{t.description}</h4>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{new Date(t.date).toLocaleDateString()}</p>
                     </div>
                  </div>
                  <div className={`text-xl font-black italic tracking-tighter ${t.type === 'CREDIT' ? 'text-green-500' : 'text-orange-500'}`}>
                     {t.type === 'CREDIT' ? '+' : '-'}{t.points}
                  </div>
               </div>
             ))}
             {transactions.filter(t => activeTab === 'REDEEMED' ? t.type === 'DEBIT' : true).length === 0 && (
                <div className="py-20 text-center text-gray-300 italic font-black text-xs uppercase tracking-[0.2em]">Nothing to show here</div>
             )}
          </div>
        )}
      </main>

      {/* Floating Modern Tab Nav */}
      <nav className="fixed bottom-6 left-6 right-6 h-20 bg-black rounded-[2.5rem] flex items-center justify-around px-2 shadow-2xl z-50 border border-white/10">
        {[
          { id: 'HOME', icon: (active: boolean) => <svg className="w-6 h-6" fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>, label: 'Home' },
          { id: 'HISTORY', icon: (active: boolean) => <svg className="w-6 h-6" fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>, label: 'History' },
          { id: 'OFFERS', icon: (active: boolean) => <svg className="w-6 h-6" fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>, label: 'Offers' },
          { id: 'REDEEMED', icon: (active: boolean) => <svg className="w-6 h-6" fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"/></svg>, label: 'Perks' }
        ].map(item => (
          <button 
            key={item.id} 
            onClick={() => setActiveTab(item.id as any)}
            className={`flex flex-col items-center gap-1.5 transition-all duration-300 relative ${activeTab === item.id ? 'text-[#FFD300] scale-110' : 'text-white/30 hover:text-white/60'}`}
          >
            {item.icon(activeTab === item.id)}
            <span className="text-[7px] font-black uppercase tracking-widest">{item.label}</span>
            {activeTab === item.id && <div className="absolute top-[-10px] w-1 h-1 bg-[#FFD300] rounded-full animate-ping" />}
          </button>
        ))}
      </nav>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default CustomerWallet;
