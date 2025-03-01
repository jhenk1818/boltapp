import React, { useState } from 'react';
import PrivateRedirectButton from './components/PrivateRedirectButton';
import { Zap, Shield, Lock, Check, Smartphone, Laptop, Tablet, Monitor } from 'lucide-react';

function App() {
  const [selectedPlan, setSelectedPlan] = useState(0);
  const [selectedConnections, setSelectedConnections] = useState(1);

  const plans = [
    { 
      duration: "12 Maanden",
      basePrice: 75, 
      period: "per jaar",
      connections: {
        1: { price: 75, link: 'https://buy.stripe.com/8wM4ke2QVaFO8Q8fZr' },
        2: { price: 99, link: 'https://buy.stripe.com/dR67wqezDeW43vO00u' },
        3: { price: 149, link: 'https://buy.stripe.com/3csaICajn4hq2rK8x7' },
        4: { price: 189, link: 'https://buy.stripe.com/9AQ182ajn7tC6I05kW' }
      }
    },
    { 
      duration: "6 Maanden",
      basePrice: 57, 
      period: "per 6 maanden",
      connections: {
        1: { price: 57, link: 'https://buy.stripe.com/7sIg2W8bf4hq6I000s' },
        2: { price: 79, link: 'https://buy.stripe.com/14k03Y77beW4fewdRo' },
        3: { price: 109, link: 'https://buy.stripe.com/aEU7wqdvzeW46I000z' },
        4: { price: 129, link: 'https://buy.stripe.com/9AQ6sm4Z315e3vObJi' }
      }
    },
    { 
      duration: "3 Maanden",
      basePrice: 39, 
      period: "per 3 maanden",
      connections: {
        1: { price: 39, link: 'https://buy.stripe.com/3cs2c69fj6py9Uc9B1' },
        2: { price: 59, link: 'https://buy.stripe.com/6oE1820IN01ac2kaF9' },
        3: { price: 69, link: 'https://buy.stripe.com/aEU3ga77bcNW3vO28E' },
        4: { price: 79, link: 'https://buy.stripe.com/6oE03YgHL5luaYg14B' }
      }
    }
  ];

  const deviceIcons = [
    { count: 1, icon: Smartphone, label: "1 Apparaat" },
    { count: 2, icon: Laptop, label: "2 Apparaten" },
    { count: 3, icon: Tablet, label: "3 Apparaten" },
    { count: 4, icon: Monitor, label: "4 Apparaten" }
  ];

  const getCurrentLink = () => {
    return plans[selectedPlan].connections[selectedConnections]?.link || '';
  };

  const getCurrentPrice = () => {
    return plans[selectedPlan].connections[selectedConnections]?.price || plans[selectedPlan].basePrice;
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-3xl">
        {/* Glassmorphism background effects */}
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-blue-900 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-blue-700 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-blue-800 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        
        {/* Main widget container */}
        <div className="relative backdrop-blur-xl bg-gradient-to-br from-blue-900/40 via-blue-800/30 to-blue-900/40 p-3 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl border border-blue-700/20">
          <div className="relative z-10">
            {/* Zapp TV Logo */}
            <div className="flex justify-center items-center mb-6">
              <div className="flex items-center gap-2 bg-black/50 px-4 py-2 rounded-full border border-purple-500/30">
                <Zap className="w-6 h-6 text-purple-500" />
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 text-transparent bg-clip-text">
                  Zapp TV
                </span>
              </div>
            </div>
            
            <h1 className="text-xl sm:text-3xl font-bold mb-6 text-center text-white">Kies Uw Abonnement</h1>
            
            {/* Device Selection Tabs */}
            <div className="flex justify-center mb-8">
              <div className="bg-gray-900/70 p-1.5 rounded-full flex">
                {deviceIcons.map((device) => (
                  <button
                    key={device.count}
                    onClick={() => setSelectedConnections(device.count)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                      selectedConnections === device.count
                        ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {React.createElement(device.icon, {
                      className: "w-4 h-4"
                    })}
                    <span className="text-sm font-medium hidden sm:inline">{device.label}</span>
                    <span className="text-sm font-medium sm:hidden">{device.count}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Pricing Table */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {plans.map((plan, index) => (
                <div 
                  key={index}
                  onClick={() => setSelectedPlan(index)}
                  className={`relative bg-gradient-to-b from-gray-900/80 to-black/80 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer hover:scale-105 ${
                    selectedPlan === index 
                      ? 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]' 
                      : 'border-gray-800 hover:border-gray-700'
                  }`}
                >
                  {/* Popular Badge */}
                  {index === 0 && (
                    <div className="absolute top-0 right-0">
                      <div className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                        BESTE WAARDE
                      </div>
                    </div>
                  )}
                  
                  <div className="p-6">
                    {/* Plan Duration */}
                    <h3 className="text-lg font-bold text-white mb-2">{plan.duration}</h3>
                    
                    {/* Price */}
                    <div className="mb-4">
                      <div className="flex items-end">
                        <span className="text-3xl font-bold text-white">€{plan.connections[selectedConnections].price}</span>
                        <span className="text-gray-400 ml-2">{plan.period}</span>
                      </div>
                      {selectedConnections > 1 && (
                        <div className="text-xs text-gray-500 mt-1">
                          €{(plan.connections[selectedConnections].price / selectedConnections).toFixed(2)} per apparaat
                        </div>
                      )}
                    </div>
                    
                    {/* Features */}
                    <ul className="space-y-2 mb-6">
                      <li className="flex items-center text-gray-300">
                        <Check className="w-4 h-4 text-blue-500 mr-2" />
                        <span className="text-sm">{selectedConnections} {selectedConnections === 1 ? 'apparaat' : 'apparaten'}</span>
                      </li>
                      <li className="flex items-center text-gray-300">
                        <Check className="w-4 h-4 text-blue-500 mr-2" />
                        <span className="text-sm">Full HD streaming</span>
                      </li>
                      <li className="flex items-center text-gray-300">
                        <Check className="w-4 h-4 text-blue-500 mr-2" />
                        <span className="text-sm">Alle kanalen inbegrepen</span>
                      </li>
                      <li className="flex items-center text-gray-300">
                        <Check className="w-4 h-4 text-blue-500 mr-2" />
                        <span className="text-sm">24/7 klantenservice</span>
                      </li>
                    </ul>
                    
                    {/* Select Button */}
                    <PrivateRedirectButton
                      destination={plan.connections[selectedConnections].link}
                      className={`w-full py-2.5 rounded-lg text-sm font-medium ${
                        selectedPlan === index
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                      }`}
                    >
                      {selectedPlan === index ? 'Doorgaan' : 'Selecteren'}
                    </PrivateRedirectButton>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Secure Checkout Section */}
            <div className="mt-4 pt-6 border-t border-blue-700/20">
              {/* Secure Checkout Text */}
              <div className="flex justify-center items-center gap-2">
                <Lock className="w-4 h-4 text-green-400" />
                <p className="text-white font-medium">Veilig Afrekenen</p>
                <Shield className="w-4 h-4 text-green-400" />
              </div>
              
              {/* Security Badges */}
              <div className="flex justify-center mt-4 gap-3">
                <div className="bg-gray-900/50 px-3 py-1 rounded-md border border-gray-800">
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-green-400" />
                    SSL Beveiligd
                  </span>
                </div>
                <div className="bg-gray-900/50 px-3 py-1 rounded-md border border-gray-800">
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Shield className="w-3 h-3 text-green-400" />
                    Privacy Beschermd
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;