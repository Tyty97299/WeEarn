import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { Coins, Wallet, Lock, X, CheckCircle, AlertCircle, Zap, TrendingUp, TrendingDown, Minus, Clock, MousePointerClick, Bell, ShoppingBag, Building2, Ticket, Backpack, Bot, Play, Timer, Activity, Users, Moon, ShoppingCart, Trash2, Plus, GripHorizontal } from "lucide-react";

// Fonction pseudo-aléatoire déterministe
const pseudoRandom = (seed: number) => {
    let x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
};

// Configuration du marché
const UPDATE_INTERVAL = 10 * 1000; // 10 secondes pour TOUT (Market + Store)

// Types
type CartItem = {
    id: string;
    type: 'hotel' | 'autoclicker';
    name: string;
    basePrice: number; // Prix unitaire ou prix de base au moment de l'ajout
    quantity: number;
    // Spécifique Hotel
    nights?: number;
    people?: number;
};

// Composant Graphique Avancé
const TrendChart = ({ data }: { data: number[] }) => {
    if (!data || data.length < 2) return null;

    const max = Math.max(...data, 2.5);
    const min = Math.min(...data, 0);
    const range = max - min || 1;
    const height = 120; // Plus haut pour "prendre de l'espace"
    const width = 300; // Largeur de base SVG

    // Génération des segments de ligne avec couleur conditionnelle
    const segments = [];
    for (let i = 0; i < data.length - 1; i++) {
        const val1 = data[i];
        const val2 = data[i + 1];
        
        const x1 = (i / (data.length - 1)) * width;
        const y1 = height - ((val1 - min) / range) * height;
        const x2 = ((i + 1) / (data.length - 1)) * width;
        const y2 = height - ((val2 - min) / range) * height;

        let color = "#fbbf24"; // Orange (Stable)
        if (val2 > val1) color = "#4ade80"; // Green (Up)
        if (val2 < val1) color = "#f87171"; // Red (Down)

        segments.push(
            <line 
                key={i} 
                x1={x1} y1={y1} 
                x2={x2} y2={y2} 
                stroke={color} 
                strokeWidth="3" 
                strokeLinecap="round"
            />
        );
    }

    // Zone de remplissage (gradient global)
    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((val - min) / range) * height;
        return `${x},${y}`;
    }).join(" ");
    const fillPath = `${points} ${width},${height} 0,${height}`;

    return (
        <div className="w-full bg-slate-950/50 rounded-2xl border border-slate-800 p-4 shadow-inner">
            <div className="flex items-center justify-between mb-2">
                 <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    <Activity className="w-4 h-4" />
                    <span>Fluctuation ($WE)</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono">1H History</div>
            </div>
            
            <div className="w-full h-32 overflow-hidden relative">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    {/* Background Grid Lines */}
                    <line x1="0" y1={height * 0.25} x2={width} y2={height * 0.25} stroke="#334155" strokeWidth="0.5" strokeDasharray="4 4" />
                    <line x1="0" y1={height * 0.5} x2={width} y2={height * 0.5} stroke="#334155" strokeWidth="0.5" strokeDasharray="4 4" />
                    <line x1="0" y1={height * 0.75} x2={width} y2={height * 0.75} stroke="#334155" strokeWidth="0.5" strokeDasharray="4 4" />

                    {/* Area Fill */}
                    <path d={`M ${fillPath}`} fill="url(#chartFill)" />
                    
                    {/* Colored Segments */}
                    {segments}
                    
                    {/* Last Point Dot */}
                    {segments.length > 0 && (
                        <circle 
                            cx={width} 
                            cy={height - ((data[data.length-1] - min) / range) * height} 
                            r="4" 
                            fill="white" 
                            className="animate-pulse"
                        />
                    )}
                </svg>
            </div>
            
            <div className="flex justify-between mt-2 text-[10px] font-medium text-slate-500">
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-400"></div>Hausse</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-400"></div>Stable</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-400"></div>Baisse</div>
            </div>
        </div>
    );
};

const App = () => {
  const [balance, setBalance] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  
  // Modals States
  const [isCashoutOpen, setIsCashoutOpen] = useState(false);
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [isBackpackOpen, setIsBackpackOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const [adminCode, setAdminCode] = useState("");
  const [cashoutState, setCashoutState] = useState<'idle' | 'success' | 'error'>('idle');
  const [backpackMessage, setBackpackMessage] = useState(""); 
  
  const [clickEffect, setClickEffect] = useState(false);
  const [rippleKey, setRippleKey] = useState(0); 
  
  // Market State
  const [currentRate, setCurrentRate] = useState(0.5);
  const [marketStatus, setMarketStatus] = useState({ name: 'Stable', color: 'text-yellow-400', icon: Minus });
  const [rateHistory, setRateHistory] = useState<number[]>([0.5, 0.5, 0.4, 0.6, 0.5, 0.8, 0.5, 0.2, 0.5]); 
  const [timeLeft, setTimeLeft] = useState("");

  // Store Items State
  const [hotelPrice, setHotelPrice] = useState(300);
  const [autoClickerPrice, setAutoClickerPrice] = useState(1200);
  
  // Hotel Options State (Pour la boutique)
  const [hotelNights, setHotelNights] = useState(1);
  const [hotelPeople, setHotelPeople] = useState(1);

  // Cart & Inventory State
  const [cart, setCart] = useState<CartItem[]>([]);
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
      if (isBackpackOpen || isCashoutOpen || isCartOpen) {
          setAdminCode("");
          setBackpackMessage("");
          setCashoutState('idle');
      }
      // Reset Hotel selection on store open
      if(isStoreOpen) {
          setHotelNights(1);
          setHotelPeople(1);
      }
  }, [isBackpackOpen, isCashoutOpen, isStoreOpen, isCartOpen]);

  // --- Unified Game Loop (Market & Store) ---
  useEffect(() => {
    const gameTick = () => {
        const now = Date.now();
        const timeBlock = Math.floor(now / UPDATE_INTERVAL);
        const rand = pseudoRandom(timeBlock);
        
        // 1. Calculate New Click Rate
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
        
        // Update History (Keep last 30 points)
        setRateHistory(prev => {
            const newHist = [...prev, newRate];
            if (newHist.length > 30) newHist.shift();
            return newHist;
        });

        // 2. Update Store Prices (Synchronized)
        const randomFactor = (Math.random() + Math.random() + Math.random()) / 3;
        setHotelPrice(Math.floor(250 + (randomFactor * 250)));
        setAutoClickerPrice(Math.floor(500 + (randomFactor * 1500)));

        // 3. Notification Logic
        const isBullish = rand >= 0.70;
        if (isBullish && notificationsEnabled && lastNotifiedBlock.current !== timeBlock) {
             new Notification("WeEarn 🚀", { 
                body: `Le marché explose ! Taux actuel : ${newRate} $WE/clic`,
             });
             lastNotifiedBlock.current = timeBlock;
        }

        // 4. Timer Visuals
        const nextTime = (timeBlock + 1) * UPDATE_INTERVAL;
        const diff = nextTime - now;
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${seconds}s`);
    };

    gameTick();
    const interval = setInterval(() => {
        const now = Date.now();
        const timeBlock = Math.floor(now / UPDATE_INTERVAL);
        const nextTime = (timeBlock + 1) * UPDATE_INTERVAL;
        const diff = nextTime - now;
        if (diff <= 0) {
            gameTick();
        } else {
            const seconds = Math.ceil(diff / 1000);
            setTimeLeft(`${seconds}s`);
        }
    }, 1000);

    return () => clearInterval(interval);
  }, [notificationsEnabled]);

  // --- Auto Clicker Logic (Enhanced) ---
  useEffect(() => {
    if (autoClickerEndTime > Date.now()) {
        // 5 clics par seconde = 1000ms / 5 = 200ms
        const interval = setInterval(() => {
            if (Date.now() > autoClickerEndTime) {
                setAutoClickerEndTime(0);
            } else {
                setBalance(prev => parseFloat((prev + currentRate).toFixed(2)));
                setTotalClicks(prev => prev + 1);
                
                // Trigger animation
                setClickEffect(true);
                setRippleKey(prev => prev + 1);
                setTimeout(() => setClickEffect(false), 100);
            }
        }, 200); 
        return () => clearInterval(interval);
    }
  }, [autoClickerEndTime, currentRate]);

  // --- Helper: Calculate Hotel Price ---
  const calculateHotelPrice = (base: number, nights: number, people: number) => {
      const nightsMultiplier = 1 + ((nights - 1) * 0.9);
      const baseCostPerPerson = base * nightsMultiplier;
      const totalCost = baseCostPerPerson + ((people - 1) * (baseCostPerPerson * 0.85));
      return Math.floor(totalCost);
  };

  // --- Cart Management ---

  const addToCart = (item: CartItem) => {
      setCart(prev => [...prev, item]);
      setStoreMessage("Ajouté au panier ! 🛒");
      setTimeout(() => setStoreMessage(""), 2000);
  };

  const removeFromCart = (index: number) => {
      setCart(prev => prev.filter((_, i) => i !== index));
  };

  const updateCartItem = (index: number, updates: Partial<CartItem>) => {
      setCart(prev => prev.map((item, i) => i === index ? { ...item, ...updates } : item));
  };

  const calculateCartTotals = () => {
      let subtotal = 0;
      cart.forEach(item => {
          if (item.type === 'hotel') {
              subtotal += calculateHotelPrice(item.basePrice, item.nights || 1, item.people || 1);
          } else {
              subtotal += item.basePrice * item.quantity;
          }
      });
      const tax = Math.floor(subtotal * 0.06);
      return { subtotal, tax, total: subtotal + tax };
  };

  const handleCheckout = () => {
      const { total } = calculateCartTotals();
      if (balance >= total) {
          if (cart.length === 0) return;
          
          setBalance(prev => prev - total);
          
          // Distribute items
          let newVouchers = 0;
          let newAutoClickers = 0;

          cart.forEach(item => {
              if (item.type === 'hotel') {
                  // Logic: 1 item entry = 1 reservation containing (nights * people) worth of utility?
                  // Previous logic: tickets = nights * people. Keeping it simple.
                  newVouchers += (item.nights || 1) * (item.people || 1);
              } else if (item.type === 'autoclicker') {
                  newAutoClickers += item.quantity;
              }
          });

          setVoucherCount(prev => prev + newVouchers);
          setAutoClickerCount(prev => prev + newAutoClickers);
          
          setCart([]);
          setIsCartOpen(false);
          setStoreMessage(`Paiement réussi ! -${total} $WE`); // Show on store if open, or main
          alert(`Paiement accepté ! Vous avez payé ${total.toLocaleString()} $WE (Taxes incluses).`);
      } else {
          alert("Fonds insuffisants pour payer le total du panier !");
      }
  };


  // --- Store Actions ---

  const handleAddHotelToCart = () => {
      addToCart({
          id: Date.now().toString(),
          type: 'hotel',
          name: 'WeHotel Deluxe',
          basePrice: hotelPrice,
          quantity: 1, // Represents 1 reservation
          nights: hotelNights,
          people: hotelPeople
      });
  };

  const handleAddAutoClickerToCart = () => {
      addToCart({
          id: Date.now().toString() + 'ac',
          type: 'autoclicker',
          name: 'Bot WeClick',
          basePrice: autoClickerPrice,
          quantity: 1
      });
  };

  // --- Other Actions ---

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
          // Add 5 minutes
          setAutoClickerEndTime(Date.now() + (5 * 60 * 1000));
          setBackpackMessage("Auto-Clicker activé pour 5 min ! ⚡");
          setTimeout(() => {
              setBackpackMessage("");
              setIsBackpackOpen(false);
          }, 1500);
      }
  };

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
        const confirmed = window.confirm(`Êtes-vous sûr de vouloir retirer ${balance.toLocaleString()} $WE ? Cette action réinitialisera votre solde.`);
        if (!confirmed) {
            setAdminCode("");
            return;
        }

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
  const isAutoClickerRunning = autoClickerEndTime > Date.now();
  const cartTotals = calculateCartTotals();

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
                onClick={() => setIsCartOpen(true)}
                className="bg-indigo-600/50 hover:bg-indigo-600 border border-indigo-500/50 p-2 rounded-full transition-all group relative"
                title="Panier"
            >
                <ShoppingCart className="w-4 h-4 text-indigo-200 group-hover:scale-110 transition-transform" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold">
                    {cart.length}
                  </span>
                )}
            </button>

            <button
                onClick={() => setIsBackpackOpen(true)}
                className="bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 p-2 rounded-full transition-all group relative"
                title="Mon Sac à dos"
            >
                <Backpack className="w-4 h-4 text-slate-200 group-hover:scale-110 transition-transform" />
            </button>

            <button
                onClick={() => setIsStoreOpen(true)}
                className="bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 p-2 rounded-full transition-all group relative"
                title="Boutique"
            >
                <ShoppingBag className="w-4 h-4 text-slate-200 group-hover:scale-110 transition-transform" />
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
        <main className="flex-1 flex flex-col items-center justify-center gap-8 pb-12 w-full">
            
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
            <div className="relative mt-4 flex flex-col items-center gap-8 w-full">
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

                {/* Market Fluctuation Chart (Full Width now) */}
                <TrendChart data={rateHistory} />

                {/* Total Clicks Counter */}
                <div className="flex items-center gap-2 text-slate-500 text-sm font-medium bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/50 animate-in fade-in slide-in-from-bottom-2">
                    <MousePointerClick className="w-4 h-4" />
                    <span>{totalClicks.toLocaleString()} clics totaux</span>
                </div>
            </div>
        </main>

        <footer className="text-center text-slate-500 text-xs font-medium">
            WeEarn &copy; 2024. Le marché change toutes les 10 s.
        </footer>
      </div>

      {/* Cart Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
             <div 
                className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={() => setIsCartOpen(false)}
                    className="absolute top-4 right-4 p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="flex flex-col items-center gap-2 text-center pt-2 mb-6 shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-700 to-indigo-500 rounded-2xl flex items-center justify-center shadow-inner border border-indigo-500/30 mb-2">
                        <ShoppingCart className="w-8 h-8 text-indigo-100" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Mon Panier</h2>
                    <p className="text-slate-400 text-xs">{cart.length} article(s)</p>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-0">
                    {cart.length === 0 ? (
                        <div className="text-center py-10 text-slate-500 text-sm">
                            Votre panier est vide.
                        </div>
                    ) : (
                        cart.map((item, index) => (
                            <div key={index} className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 flex flex-col gap-3">
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-3">
                                        <div className={`p-2 rounded-lg ${item.type === 'hotel' ? 'bg-blue-900/30 text-blue-400' : 'bg-purple-900/30 text-purple-400'}`}>
                                            {item.type === 'hotel' ? <Ticket className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <div className="font-bold text-white text-sm">{item.name}</div>
                                            {item.type !== 'hotel' && (
                                                <div className="text-xs text-slate-500">{item.basePrice} $WE</div>
                                            )}
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => removeFromCart(index)}
                                        className="text-slate-500 hover:text-red-400 transition"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                {item.type === 'hotel' && (
                                    <div className="bg-slate-900/50 rounded-lg p-2 space-y-2 border border-slate-700/30">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-slate-400 flex items-center gap-1"><Moon className="w-3 h-3"/> Nuits</span>
                                            <div className="flex items-center gap-2 bg-slate-800 rounded px-1">
                                                <button className="p-1 hover:text-white" onClick={() => updateCartItem(index, { nights: Math.max(1, (item.nights||1) - 1) })}><Minus className="w-3 h-3"/></button>
                                                <span className="w-4 text-center font-mono">{item.nights}</span>
                                                <button className="p-1 hover:text-white" onClick={() => updateCartItem(index, { nights: Math.min(7, (item.nights||1) + 1) })}><Plus className="w-3 h-3"/></button>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-slate-400 flex items-center gap-1"><Users className="w-3 h-3"/> Pers.</span>
                                            <div className="flex items-center gap-2 bg-slate-800 rounded px-1">
                                                <button className="p-1 hover:text-white" onClick={() => updateCartItem(index, { people: Math.max(1, (item.people||1) - 1) })}><Minus className="w-3 h-3"/></button>
                                                <span className="w-4 text-center font-mono">{item.people}</span>
                                                <button className="p-1 hover:text-white" onClick={() => updateCartItem(index, { people: Math.min(4, (item.people||1) + 1) })}><Plus className="w-3 h-3"/></button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                <div className="flex justify-end pt-2 border-t border-slate-700/50">
                                    <div className="font-mono font-bold text-white">
                                        {item.type === 'hotel' 
                                            ? calculateHotelPrice(item.basePrice, item.nights || 1, item.people || 1) 
                                            : item.basePrice} $WE
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {cart.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-700 shrink-0 space-y-3">
                        <div className="space-y-1 text-sm">
                            <div className="flex justify-between text-slate-400">
                                <span>Sous-total</span>
                                <span>{cartTotals.subtotal} $WE</span>
                            </div>
                            <div className="flex justify-between text-slate-400">
                                <span>Taxes (6%)</span>
                                <span>{cartTotals.tax} $WE</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold text-white pt-2 border-t border-slate-700/50">
                                <span>Total</span>
                                <span className={cartTotals.total > balance ? "text-red-400" : "text-emerald-400"}>
                                    {cartTotals.total} $WE
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={handleCheckout}
                            className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95
                                ${cartTotals.total > balance 
                                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/25'}
                            `}
                            disabled={cartTotals.total > balance}
                        >
                            <Wallet className="w-4 h-4" />
                            Payer {cartTotals.total} $WE
                        </button>
                    </div>
                )}
             </div>
        </div>
      )}

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
                    {/* WeHotel Item with Options */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 flex flex-col gap-4">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-900/50 p-2.5 rounded-xl text-blue-400">
                                    <Building2 className="w-6 h-6" />
                                </div>
                                <div className="text-left">
                                    <h3 className="font-bold text-white text-sm">WeHotel Deluxe</h3>
                                    <p className="text-slate-400 text-[10px] leading-tight mt-0.5">
                                        Prix de base: {hotelPrice} $WE / nuit
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Options Selection */}
                        <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-700/50 space-y-3">
                            {/* Nights Slider */}
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs text-slate-300">
                                    <div className="flex items-center gap-1"><Moon className="w-3 h-3" /> Nuits</div>
                                    <span className="font-mono font-bold text-white">{hotelNights}</span>
                                </div>
                                <input 
                                    type="range" min="1" max="7" step="1"
                                    value={hotelNights}
                                    onChange={(e) => setHotelNights(parseInt(e.target.value))}
                                    className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                />
                                {hotelNights > 1 && <div className="text-[9px] text-emerald-400 text-right">-10% sur nuits sup.</div>}
                            </div>

                            {/* People Slider */}
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs text-slate-300">
                                    <div className="flex items-center gap-1"><Users className="w-3 h-3" /> Personnes</div>
                                    <span className="font-mono font-bold text-white">{hotelPeople}</span>
                                </div>
                                <input 
                                    type="range" min="1" max="4" step="1"
                                    value={hotelPeople}
                                    onChange={(e) => setHotelPeople(parseInt(e.target.value))}
                                    className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                />
                                {hotelPeople > 1 && <div className="text-[9px] text-emerald-400 text-right">-15% sur pers. sup.</div>}
                            </div>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                             <div className="flex justify-between items-center px-1">
                                <span className="text-xs text-slate-400">Total estimé:</span>
                                <span className={`text-xl font-bold ${calculateHotelPrice(hotelPrice, hotelNights, hotelPeople) > balance ? 'text-red-400' : 'text-emerald-400'}`}>
                                    {calculateHotelPrice(hotelPrice, hotelNights, hotelPeople)} <span className="text-xs text-slate-500">$WE</span>
                                </span>
                            </div>
                            <button
                                onClick={handleAddHotelToCart}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-xl text-sm transition-all shadow-lg active:scale-95"
                            >
                                Ajouter au panier
                            </button>
                        </div>
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
                            onClick={handleAddAutoClickerToCart}
                            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 rounded-xl text-sm transition-all shadow-lg active:scale-95"
                        >
                            Ajouter au panier
                        </button>
                    </div>

                    {storeMessage && (
                        <div className={`text-xs text-center font-bold animate-in fade-in ${storeMessage.includes('!') ? 'text-emerald-400' : 'text-red-400'}`}>
                            {storeMessage}
                        </div>
                    )}
                    
                    <div className="text-center mt-2">
                        <span className="text-[10px] text-slate-500">Prix boutique actualisés toutes les 10 secondes.</span>
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