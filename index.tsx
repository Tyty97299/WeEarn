import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { Coins, Wallet, Lock, X, CheckCircle, AlertCircle, Zap, TrendingUp, TrendingDown, Minus, Clock, MousePointerClick } from "lucide-react";

// Fonction pseudo-aléatoire déterministe basée sur une graine (seed)
// Permet d'avoir le même résultat sur tous les appareils pour un même bloc de temps
const pseudoRandom = (seed: number) => {
    let x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
};

// Configuration du marché
const MARKET_UPDATE_INTERVAL = 5 * 60 * 1000; // 5 minutes en ms

const App = () => {
  const [balance, setBalance] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  const [isCashoutOpen, setIsCashoutOpen] = useState(false);
  const [adminCode, setAdminCode] = useState("");
  const [cashoutState, setCashoutState] = useState<'idle' | 'success' | 'error'>('idle');
  const [clickEffect, setClickEffect] = useState(false);
  
  // Market State
  const [currentRate, setCurrentRate] = useState(0.5);
  const [marketStatus, setMarketStatus] = useState({ name: 'Stable', color: 'text-yellow-400', icon: Minus });
  const [timeLeft, setTimeLeft] = useState("");

  // Load saved data
  useEffect(() => {
    const savedBalance = localStorage.getItem('weearn_balance');
    if (savedBalance) setBalance(parseFloat(savedBalance));

    const savedClicks = localStorage.getItem('weearn_total_clicks');
    if (savedClicks) setTotalClicks(parseInt(savedClicks, 10));
  }, []);

  // Save data on change
  useEffect(() => {
    localStorage.setItem('weearn_balance', balance.toString());
  }, [balance]);

  useEffect(() => {
    localStorage.setItem('weearn_total_clicks', totalClicks.toString());
  }, [totalClicks]);

  // Market Logic Loop
  useEffect(() => {
    const updateMarket = () => {
        const now = Date.now();
        // Calcul du bloc de 5 minutes actuel (Timestamp entier / 5min)
        const timeBlock = Math.floor(now / MARKET_UPDATE_INTERVAL);
        
        // Génération du taux basé sur ce bloc temporel unique
        const rand = pseudoRandom(timeBlock);

        // Définition du taux et du statut
        if (rand < 0.20) {
            setCurrentRate(0.1);
            setMarketStatus({ name: 'Bear Market', color: 'text-red-500', icon: TrendingDown });
        } else if (rand < 0.70) { // 0.20 à 0.70 = 50%
            setCurrentRate(0.5);
            setMarketStatus({ name: 'Stable', color: 'text-yellow-400', icon: Minus });
        } else if (rand < 0.90) { // 0.70 à 0.90 = 20%
            setCurrentRate(1.0);
            setMarketStatus({ name: 'Bull Run', color: 'text-green-400', icon: TrendingUp });
        } else { // Reste 10%
            setCurrentRate(2.0); // Bonus rare "Moon"
            setMarketStatus({ name: 'MOON 🚀', color: 'text-purple-400', icon: Zap });
        }

        // Calcul du temps restant
        const nextTime = (timeBlock + 1) * MARKET_UPDATE_INTERVAL;
        const diff = nextTime - now;
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
    };

    // Mise à jour immédiate
    updateMarket();

    // Mise à jour chaque seconde pour le compte à rebours
    const interval = setInterval(updateMarket, 1000);
    return () => clearInterval(interval);
  }, []);

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
    // Utilisation de toFixed pour éviter les erreurs de virgule flottante JS
    setBalance(prev => parseFloat((prev + currentRate).toFixed(2)));
    setTotalClicks(prev => prev + 1);
    setClickEffect(true);
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
          <button
            onClick={handleCashoutOpen}
            className="flex items-center gap-2 bg-slate-800/50 hover:bg-slate-800 backdrop-blur-md border border-slate-700 hover:border-slate-600 transition-all px-4 py-2 rounded-full text-sm font-medium group"
          >
            <Wallet className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span>Retrait</span>
          </button>
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
            <div className="w-full bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 backdrop-blur-md flex flex-row justify-between items-center animate-in fade-in zoom-in-95 duration-500">
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

            {/* The Big Button */}
            <div className="relative mt-4 flex flex-col items-center gap-8">
                {/* Button Wrapper */}
                <div className="relative">
                    {/* Glow effect */}
                    <div className={`absolute inset-0 bg-yellow-500/30 rounded-full blur-2xl transition-all duration-100 ${clickEffect ? 'scale-110 opacity-100' : 'scale-100 opacity-50'}`}></div>
                    
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
                        
                        <Zap className={`w-20 h-20 text-yellow-900 mb-2 drop-shadow-sm transition-transform duration-75 ${clickEffect ? 'scale-110' : 'scale-100'}`} fill="currentColor" />
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
            WeEarn &copy; 2024. Le marché change toutes les 5 min.
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
    </div>
  );
};

// Initialisation de l'application
const root = createRoot(document.getElementById("root"));
root.render(<App />);