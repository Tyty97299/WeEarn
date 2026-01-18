import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { Coins, Wallet, Lock, X, CheckCircle, AlertCircle, Zap, TrendingUp, TrendingDown, Minus, Clock, MousePointerClick, Bell, ShoppingBag, Building2, Ticket, Backpack, Bot, Play, Timer } from "lucide-react";

// Fonction pseudo-aléatoire déterministe basée sur une graine (seed)
const pseudoRandom = (seed: number) => {
    let x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
};

// Configuration du marché
const MARKET_UPDATE_INTERVAL = 5 * 1000; // 5 secondes pour le taux du clic
const STORE_UPDATE_INTERVAL = 60 * 1000; // 1 minute pour les prix de la boutique

const App = () => {
  const [balance, setBalance] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  
  // Modals States
  const [isCashoutOpen, setIsCashoutOpen] = useState(false);
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [isBackpackOpen, setIsBackpackOpen] = useState(false);
  
  const [adminCode, setAdminCode] = useState("");
  const [cashoutState, setCashoutState] = useState<'idle' | 'success' | 'error'>('idle');
  const [backpackMessage, setBackpackMessage] = useState(""); 
  
  const [clickEffect, setClickEffect] = useState(false);
  const [rippleKey, setRippleKey] = useState(0); 
  
  // Market State
  const [currentRate, setCurrentRate] = useState(0.5);
  const [marketStatus, setMarketStatus] = useState({ name: 'Stable', color: 'text-yellow-400', icon: Minus });
  const [timeLeft, setTimeLeft] = useState("");

  // Store Items State
  const [hotelPrice, setHotelPrice] = useState(300);
  const [autoClickerPrice, setAutoClickerPrice] = useState(1200);
  
  // Inventory State
  const [voucherCount, setVoucherCount] = useState(0);
  const [autoClickerCount, setAutoClickerCount] = useState(0);
  const [storeMessage, setStoreMessage] = useState("");

  // Auto Clicker Active State
  const [autoClickerEndTime, setAutoClickerEndTime] = useState(0);

  // Notifications State
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const lastNotifiedBlock = useRef(0);

  // Load saved data
  useEffect(() => {
    const savedBalance = localStorage.getItem('weearn_balance');
    if (savedBalance) setBalance(parseFloat(savedBalance));

    const savedClicks = localStorage.getItem('weearn_total_clicks');
    if (savedClicks) setTotalClicks(parseInt(savedClicks, 10));

    const savedNotify = localStorage.getItem('weearn_notifications');
    if (savedNotify === 'true') setNotificationsEnabled(true);

    const savedVouchers = localStorage.getItem('weearn_vouchers');
    if (savedVouchers) setVoucherCount(parseInt(savedVouchers, 10));

    const savedAutoClickers = localStorage.getItem('weearn_autoclickers');
    if (savedAutoClickers) setAutoClickerCount(parseInt(savedAutoClickers, 10));

    const savedEndTime = localStorage.getItem('weearn_autoclicker_endtime');
    if (savedEndTime) setAutoClickerEndTime(parseInt(savedEndTime, 10));
  }, []);

  // Save data on change
  useEffect(() => { localStorage.setItem('weearn_balance', balance.toString()); }, [balance]);
  useEffect(() => { localStorage.setItem('weearn_total_clicks', totalClicks.toString()); }, [totalClicks]);
  useEffect(() => { localStorage.setItem('weearn_vouchers', voucherCount.toString()); }, [voucherCount]);
  useEffect(() => { localStorage.setItem('weearn_autoclickers', autoClickerCount.toString()); }, [autoClickerCount]);
  useEffect(() => { localStorage.setItem('weearn_autoclicker_endtime', autoClickerEndTime.toString()); }, [autoClickerEndTime]);

  // Reset inputs when opening modals
  useEffect(() => {
      if (isBackpackOpen || isCashoutOpen) {
          setAdminCode("");
          setBackpackMessage("");
          setCashoutState('idle');
      }
  }, [isBackpackOpen, isCashoutOpen]);

  // --- Logic for Store Price Fluctuation (Every 1 minute) ---
  useEffect(() => {
      const updateStorePrices = () => {
          // Prix Hôtel : entre 250 et 500, biais vers le haut
          const hotelBias = Math.max(Math.random(), Math.random());
          setHotelPrice(Math.floor(250 + (hotelBias * 250)));

          // Prix Auto Clicker : entre 500 et 2000, biais vers le milieu (courbe en cloche)
          // Moyenne de 2 nombres aléatoires tend vers 0.5
          const autoClickerBias = (Math.random() + Math.random()) / 2;
          // 500 + (0..1 * 1500) -> 500 à 2000
          setAutoClickerPrice(Math.floor(500 + (autoClickerBias * 1500)));
      };

      // Initial update
      updateStorePrices();

      const interval = setInterval(updateStorePrices, STORE_UPDATE_INTERVAL);
      return () => clearInterval(interval);
  }, []);

  // --- Auto Clicker Logic ---
  useEffect(() => {
    if (autoClickerEndTime > Date.now()) {
        const interval = setInterval(() => {
            if (Date.now() > autoClickerEndTime) {
                setAutoClickerEndTime(0); // Finished
            } else {
                // Auto click adds current rate
                setBalance(prev => parseFloat((prev + currentRate).toFixed(2)));
                setTotalClicks(prev => prev + 1);
                // Optional: small visual feedback without full ripple
            }
        }, 1000); // 1 click per second
        return () => clearInterval(interval);
    }
  }, [autoClickerEndTime, currentRate]);


  // Handle buying Hotel Vouchers
  const handleBuyVoucher = () => {
      if (balance >= hotelPrice) {
          setBalance(prev => prev - hotelPrice);
          setVoucherCount(prev => prev + 1);
          setStoreMessage("Ticket acheté ! 🏨");
          setTimeout(() => setStoreMessage(""), 2000);
      } else {
          setStoreMessage("Fonds insuffisants !");
          setTimeout(() => setStoreMessage(""), 2000);
      }
  };

  // Handle buying Auto Clicker
  const handleBuyAutoClicker = () => {
      if (balance >= autoClickerPrice) {
          setBalance(prev => prev - autoClickerPrice);
          setAutoClickerCount(prev => prev + 1);
          setStoreMessage("Auto-Clicker acquis ! 🤖");
          setTimeout(() => setStoreMessage(""), 2000);
      } else {
          setStoreMessage("Fonds insuffisants !");
          setTimeout(() => setStoreMessage(""), 2000);
      }
  };

  // Handle using items (Backpack)
  const handleUseVoucher = () => {
      if (adminCode === "121519") {
          if (voucherCount > 0) {
              setVoucherCount(prev => prev - 1);
              setBackpackMessage("Bon utilisé ! Réservation confirmée ✔️");
              setAdminCode("");
              setTimeout(() => setBackpackMessage(""), 3000);
          } else {
              setBackpackMessage("Erreur: Aucun bon disponible.");
          }
      } else {
          setBackpackMessage("Code incorrect ❌");
      }
  };

  const handleActivateAutoClicker = () => {
      if (autoClickerCount > 0) {
          if (autoClickerEndTime > Date.now()) {
             setBackpackMessage("Déjà actif ! Attendez la fin.");
             return;
          }
          setAutoClickerCount(prev => prev - 1);
          // Add 5 minutes (5 * 60 * 1000)
          setAutoClickerEndTime(Date.now() + (5 * 60 * 1000));
          setBackpackMessage("Auto-Clicker activé pour 5 min ! ⚡");
          setTimeout(() => {
              setBackpackMessage("");
              setIsBackpackOpen(false); // Close backpack to show game
          }, 1500);
      }
  };

  // Handle buying notifications
  const handleBuyNotifications = async () => {
      if (!("Notification" in window)) {
          alert("Votre navigateur ne supporte pas les notifications.");
          return;
      }

      if (balance < 100) {
          alert("Fonds insuffisants ! Il vous faut 100 $WE pour activer les notifications.");
          return;
      }

      const confirmPurchase = window.confirm("Êtes-vous sûr de consommer 100 $WE pour activer les notifications ?");
      if (!confirmPurchase) return;

      const permission = await Notification.requestPermission();
      if (permission === "granted") {
          setBalance(prev => prev - 100);
          setNotificationsEnabled(true);
          localStorage.setItem('weearn_notifications', 'true');
          new Notification("WeEarn", { body: "Alertes activées ! Vous serez notifié des hausses." });
      } else {
          alert("Permission refusée. Impossible d'activer les alertes.");
      }
  };

  // Market Logic Loop & Notification Trigger
  useEffect(() => {
    const updateMarket = () => {
        const now = Date.now();
        const timeBlock = Math.floor(now / MARKET_UPDATE_INTERVAL);
        const rand = pseudoRandom(timeBlock);
        
        let newRate = 0.5;
        let newStatus = { name: 'Stable', color: 'text-yellow-400', icon: Minus };

        if (rand < 0.20) {
            newRate = 0.1;
            newStatus = { name: 'Bear Market', color: 'text-red-500', icon: TrendingDown };
        } else if (rand < 0.70) {
            newRate = 0.5;
            newStatus = { name: 'Stable', color: 'text-yellow-400', icon: Minus };
        } else if (rand < 0.90) {
            newRate = 1.0;
            newStatus = { name: 'Bull Run', color: 'text-green-400', icon: TrendingUp };
        } else {
            newRate = 2.0;
            newStatus = { name: 'MOON 🚀', color: 'text-purple-400', icon: Zap };
        }

        setCurrentRate(newRate);
        setMarketStatus(newStatus);

        const isBullish = rand >= 0.70;
        
        if (isBullish && notificationsEnabled && lastNotifiedBlock.current !== timeBlock) {
             new Notification("WeEarn 🚀", { 
                body: `Le marché explose ! Taux actuel : ${newRate} $WE/clic`,
             });
             lastNotifiedBlock.current = timeBlock;
        }

        const nextTime = (timeBlock + 1) * MARKET_UPDATE_INTERVAL;
        const diff = nextTime - now;
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
    };

    updateMarket();
    const interval = setInterval(updateMarket, 1000);
    return () => clearInterval(interval);
  }, [notificationsEnabled]);

  // Load Adsterra Native Banner Script
  useEffect(() => {
    const timer = setTimeout(() => {
        const script = document.createElement('script');
        script.src = "https://pl28510872.effectivegatecpm.com/5bdd33c6e14b7c8011cb830f512409c6/invoke.js";
        script.async = true;
        script.dataset.cfasync = "false";
        document.body.appendChild(script);
    }, 100);

    return () => {
        clearTimeout(timer);
        const script = document.querySelector('script[src*="effectivegatecpm.com"]');
        if (script) {
            try {
                document.body.removeChild(script);
            } catch(e) {}
        }
    }
  }, []);

  const handleClick = () => {
    setBalance(prev => parseFloat((prev + currentRate).toFixed(2)));
    setTotalClicks(prev => prev + 1);
    setClickEffect(true);
    setRippleKey(prev => prev + 1);
    setTimeout(() => setClickEffect(false), 100);
  };

  const handleCashoutOpen = () => {
    setIsCashoutOpen(true);
    setCashoutState('idle');
    setAdminCode("");
  };

  const handleVerifyCashout = () => {
    if (adminCode === "121519") {
      setCashoutState('success');
      setTimeout(() => {
        setBalance(0);
        setIsCashoutOpen(false);
        setCashoutState('idle');
      }, 2000);
    } else {
      setCashoutState('error');
    }
  };

  const StatusIcon = marketStatus.icon;

  // Auto clicker active check
  const isAutoClickerRunning = autoClickerEndTime > Date.now();

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans flex flex-col items-center relative overflow-x-hidden selection:bg-yellow-500 selection:text-slate-900">
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
         <div className="absolute -top-24 -right-24 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-pulse"></div>
         <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      {/* Top Ad Banner */}
      <div className="w-full flex flex-col items-center justify-center py-2 z-20 bg-slate-900/50 backdrop-blur-sm border-b border-white/5 shadow-lg">
          <div className="text-[10px] text-slate-500 mb-1 uppercase tracking-widest font-semibold">Publicité</div>
          <div id="container-5bdd33c6e14b7c8011cb830f512409c6" className="min-h-[50px] w-full flex justify-center items-center"></div>
      </div>

      {/* Main Game Container */}
      <div className="z-10 w-full max-w-md px-6 flex flex-col flex-1 py-6 justify-center">
        {/* Header */}
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-yellow-400 to-orange-600 p-2 rounded-xl shadow-lg shadow-orange-500/20">
                <Coins className="text-white w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black italic tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              WeEarn
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {isAutoClickerRunning && (
                <div className="flex items-center gap-1 bg-green-500/20 border border-green-500/50 px-2 py-1 rounded-full text-xs font-bold text-green-400 animate-pulse">
                    <Bot className="w-3 h-3" />
                    <span>Actif</span>
                </div>
            )}
            <button
                onClick={() => setIsBackpackOpen(true)}
                className="bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 p-2 rounded-full transition-all group relative"
                title="Mon Sac à dos"
            >
                <Backpack className="w-4 h-4 text-slate-200 group-hover:scale-110 transition-transform" />
            </button>

            <button
                onClick={() => setIsStoreOpen(true)}
                className="bg-indigo-600/50 hover:bg-indigo-600 border border-indigo-500/50 p-2 rounded-full transition-all group relative"
                title="Boutique"
            >
                <ShoppingBag className="w-4 h-4 text-indigo-200 group-hover:scale-110 transition-transform" />
                {/* Notification badge if inventory has items */}
                {(voucherCount > 0 || autoClickerCount > 0) && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                  </span>
                )}
            </button>
            <button
                onClick={handleCashoutOpen}
                className="flex items-center gap-2 bg-slate-800/50 hover:bg-slate-800 backdrop-blur-md border border-slate-700 hover:border-slate-600 transition-all px-4 py-2 rounded-full text-sm font-medium group"
            >
                <Wallet className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span>Retrait</span>
            </button>
          </div>
        </header>

        {/* Main Display */}
        <main className="flex-1 flex flex-col items-center justify-center gap-8 pb-12">
            
            {/* Balance Counter */}
            <div className="flex flex-col items-center gap-1">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">Solde Actuel</span>
                <div className="text-6xl font-black tabular-nums tracking-tighter text-white drop-shadow-2xl flex items-baseline gap-2">
                    {balance.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                    <span className="text-2xl text-yellow-500 font-bold">$WE</span>
                </div>
            </div>

            {/* Market Info Card */}
            <div className="w-full bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 backdrop-blur-md flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-500">
                <div className="flex flex-row justify-between items-center w-full">
                    <div className="flex flex-col">
                        <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Marché Actuel</span>
                        <div className={`flex items-center gap-2 font-bold text-lg ${marketStatus.color}`}>
                            <StatusIcon className="w-5 h-5" />
                            <span>{marketStatus.name}</span>
                        </div>
                    </div>
                    
                    <div className="h-8 w-px bg-slate-700"></div>

                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1.5 text-slate-300 text-xs font-mono mb-1">
                            <Clock className="w-3 h-3" />
                            <span>{timeLeft}</span>
                        </div>
                        <div className="text-white font-bold text-lg">
                            1 Clic = <span className={marketStatus.color}>{currentRate} $WE</span>
                        </div>
                    </div>
                </div>

                {/* Notification Button */}
                <button 
                    onClick={handleBuyNotifications}
                    disabled={notificationsEnabled}
                    className={`
                        w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all
                        ${notificationsEnabled 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default' 
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 active:scale-95'}
                    `}
                >
                    {notificationsEnabled ? (
                        <>
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Alertes actives</span>
                        </>
                    ) : (
                        <>
                            <Bell className="w-3.5 h-3.5" />
                            <span>M'alerter quand ça monte (100 $WE)</span>
                        </>
                    )}
                </button>
            </div>

            {/* The Big Button */}
            <div className="relative mt-4 flex flex-col items-center gap-8">
                {/* Button Wrapper */}
                <div className="relative">
                    {/* Glow effect */}
                    <div className={`absolute inset-0 bg-yellow-500/30 rounded-full blur-2xl transition-all duration-100 ${clickEffect || isAutoClickerRunning ? 'scale-110 opacity-100' : 'scale-100 opacity-50'}`}></div>
                    
                    {/* Ripple Effect */}
                    <div key={rippleKey} className="absolute inset-0 rounded-full border-2 border-white/50 animate-ripple opacity-0 pointer-events-none"></div>

                    <button
                        onClick={handleClick}
                        className={`
                            relative group
                            w-64 h-64 rounded-full
                            bg-gradient-to-br from-yellow-300 via-yellow-500 to-orange-600
                            shadow-[0_10px_40px_-10px_rgba(234,179,8,0.5),inset_0_4px_4px_rgba(255,255,255,0.4),inset_0_-4px_8px_rgba(0,0,0,0.2)]
                            border-[6px] border-yellow-200/20
                            transition-all duration-75 ease-out
                            flex flex-col items-center justify-center
                            active:scale-95 active:translate-y-1
                            hover:scale-105 hover:-translate-y-1
                            z-10
                            overflow-hidden
                        `}
                    >
                        {/* Shine effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                        
                        <Zap className={`w-20 h-20 text-yellow-900 mb-2 drop-shadow-sm transition-transform duration-75 ${clickEffect || isAutoClickerRunning ? 'scale-110' : 'scale-100'}`} fill="currentColor" />
                        <span className="text-yellow-950 font-black text-3xl uppercase tracking-widest drop-shadow-sm select-none">
                            +{currentRate}
                        </span>
                    </button>
                </div>

                {/* Total Clicks Counter */}
                <div className="flex items-center gap-2 text-slate-500 text-sm font-medium bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/50 animate-in fade-in slide-in-from-bottom-2">
                    <MousePointerClick className="w-4 h-4" />
                    <span>{totalClicks.toLocaleString()} clics totaux</span>
                </div>
            </div>
        </main>

        <footer className="text-center text-slate-500 text-xs font-medium">
            WeEarn &copy; 2024. Le marché change toutes les 5 s.
        </footer>
      </div>

      {/* Cashout Modal */}
      {isCashoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div 
                className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={() => setIsCashoutOpen(false)}
                    className="absolute top-4 right-4 p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="flex flex-col items-center gap-5 text-center pt-2">
                    <div className="w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl flex items-center justify-center shadow-inner border border-slate-600">
                        <Lock className="w-8 h-8 text-slate-300" />
                    </div>
                    
                    <div>
                        <h2 className="text-xl font-bold text-white mb-2">Zone Admin</h2>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Entrez le code de sécurité pour transférer <br/>
                            <strong className="text-yellow-400 text-lg">{balance.toLocaleString()} $WE</strong> vers votre portefeuille.
                        </p>
                    </div>

                    <div className="w-full space-y-4">
                        <input
                            type="password"
                            inputMode="numeric"
                            placeholder="Code Admin (ex: 123456)"
                            value={adminCode}
                            onChange={(e) => {
                                setAdminCode(e.target.value);
                                if (cashoutState === 'error') setCashoutState('idle');
                            }}
                            className={`
                                w-full bg-slate-950 border-2 rounded-xl px-4 py-4 text-center text-lg text-white placeholder-slate-600 
                                focus:outline-none focus:ring-4 transition-all
                                ${cashoutState === 'error' 
                                    ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' 
                                    : 'border-slate-800 focus:border-yellow-500 focus:ring-yellow-500/20'}
                            `}
                        />

                        {cashoutState === 'error' && (
                            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-950/30 border border-red-900/50 p-3 rounded-xl justify-center animate-in slide-in-from-top-2">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>Code incorrect. Accès refusé.</span>
                            </div>
                        )}

                        {cashoutState === 'success' && (
                            <div className="flex items-center gap-2 text-emerald-400 text-sm bg-emerald-950/30 border border-emerald-900/50 p-3 rounded-xl justify-center animate-in slide-in-from-top-2">
                                <CheckCircle className="w-4 h-4 shrink-0" />
                                <span>Code validé ! Transfert en cours...</span>
                            </div>
                        )}

                        <button
                            onClick={handleVerifyCashout}
                            disabled={cashoutState === 'success' || !adminCode}
                            className={`
                                w-full font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2
                                ${cashoutState === 'success' 
                                    ? 'bg-emerald-500 text-white' 
                                    : 'bg-yellow-500 hover:bg-yellow-400 text-yellow-950 shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/40 active:scale-95'}
                                disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:active:scale-100
                            `}
                        >
                            {cashoutState === 'success' ? 'Succès' : 'Valider le retrait'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Backpack Modal */}
      {isBackpackOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div 
                className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={() => setIsBackpackOpen(false)}
                    className="absolute top-4 right-4 p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="flex flex-col items-center gap-2 text-center pt-2 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-600 rounded-2xl flex items-center justify-center shadow-inner border border-slate-500/30 mb-2">
                        <Backpack className="w-8 h-8 text-slate-100" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Mon Sac à Dos</h2>
                    <p className="text-slate-400 text-xs">Vos objets et récompenses.</p>
                </div>

                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
                    
                    {/* Item 1: Hotel */}
                    <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 p-3">
                         <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-900/30 p-2 rounded-lg text-blue-400">
                                    <Ticket className="w-5 h-5" />
                                </div>
                                <div className="flex flex-col text-left">
                                    <span className="font-bold text-sm text-white">Bons WeHotel</span>
                                    <span className="text-[10px] text-slate-500">Nuit d'hôtel standard</span>
                                </div>
                            </div>
                            <div className="font-mono font-bold text-lg text-white">x{voucherCount}</div>
                        </div>

                        {voucherCount > 0 && (
                            <div className="flex gap-2">
                                <input 
                                    type="password"
                                    inputMode="numeric"
                                    value={adminCode}
                                    onChange={(e) => { setAdminCode(e.target.value); setBackpackMessage(""); }}
                                    placeholder="Code Admin"
                                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-indigo-500 outline-none"
                                />
                                <button onClick={handleUseVoucher} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3 py-2 rounded-lg text-xs">
                                    Valider
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Item 2: Auto Clicker */}
                    <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 p-3">
                         <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="bg-purple-900/30 p-2 rounded-lg text-purple-400">
                                    <Bot className="w-5 h-5" />
                                </div>
                                <div className="flex flex-col text-left">
                                    <span className="font-bold text-sm text-white">Bot WeClick</span>
                                    <span className="text-[10px] text-slate-500">Auto-clic pendant 5 min</span>
                                </div>
                            </div>
                            <div className="font-mono font-bold text-lg text-white">x{autoClickerCount}</div>
                        </div>

                        {autoClickerCount > 0 && (
                            <button 
                                onClick={handleActivateAutoClicker} 
                                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold px-3 py-2 rounded-lg text-xs flex items-center justify-center gap-2"
                            >
                                <Play className="w-3 h-3" /> Activer maintenant
                            </button>
                        )}
                    </div>

                    {/* Feedback Message */}
                    {backpackMessage && (
                        <div className={`text-xs mt-1 text-center font-bold animate-in fade-in ${backpackMessage.includes('!') ? 'text-emerald-400' : 'text-red-400'}`}>
                            {backpackMessage}
                        </div>
                    )}

                    {voucherCount === 0 && autoClickerCount === 0 && (
                        <div className="text-center py-4 text-slate-500 text-sm">
                            Votre sac est vide.
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* Store Modal */}
      {isStoreOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div 
                className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={() => setIsStoreOpen(false)}
                    className="absolute top-4 right-4 p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="flex flex-col items-center gap-2 text-center pt-2 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-800 to-indigo-600 rounded-2xl flex items-center justify-center shadow-inner border border-indigo-500/30 mb-2">
                        <ShoppingBag className="w-8 h-8 text-indigo-100" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Boutique WeEarn</h2>
                    <p className="text-slate-400 text-xs">Dépensez vos $WE durement gagnés.</p>
                </div>

                <div className="space-y-3">
                    {/* WeHotel Item */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 flex flex-col gap-3">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-900/50 p-2.5 rounded-xl text-blue-400">
                                    <Building2 className="w-6 h-6" />
                                </div>
                                <div className="text-left">
                                    <h3 className="font-bold text-white text-sm">Nuit chez WeHotel</h3>
                                    <p className="text-slate-400 text-[10px] leading-tight mt-0.5">Valable dans tous nos hôtels.</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className={`text-xl font-bold ${hotelPrice > 400 ? 'text-red-400' : 'text-emerald-400'}`}>
                                    {hotelPrice} <span className="text-xs text-slate-500">$WE</span>
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={handleBuyVoucher}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-xl text-sm transition-all shadow-lg active:scale-95"
                        >
                            Acheter
                        </button>
                    </div>

                    {/* Auto Clicker Item */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 flex flex-col gap-3">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-purple-900/50 p-2.5 rounded-xl text-purple-400">
                                    <Bot className="w-6 h-6" />
                                </div>
                                <div className="text-left">
                                    <h3 className="font-bold text-white text-sm">Bot WeClick</h3>
                                    <p className="text-slate-400 text-[10px] leading-tight mt-0.5">Clique auto pendant 5 min.</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className={`text-xl font-bold ${autoClickerPrice > 1500 ? 'text-red-400' : 'text-emerald-400'}`}>
                                    {autoClickerPrice} <span className="text-xs text-slate-500">$WE</span>
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={handleBuyAutoClicker}
                            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 rounded-xl text-sm transition-all shadow-lg active:scale-95"
                        >
                            Acheter
                        </button>
                    </div>

                    {storeMessage && (
                        <div className={`text-xs text-center font-bold animate-in fade-in ${storeMessage.includes('!') ? 'text-emerald-400' : 'text-red-400'}`}>
                            {storeMessage}
                        </div>
                    )}
                    
                    <div className="text-center mt-2">
                        <span className="text-[10px] text-slate-500">Prix boutique actualisés toutes les minutes.</span>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

// Initialisation de l'application
const root = createRoot(document.getElementById("root"));
root.render(<App />);