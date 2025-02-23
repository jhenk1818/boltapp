import React, { useState } from 'react';
import PlanSelector from './components/PlanSelector';
import PrivateRedirectButton from './components/PrivateRedirectButton';

function App() {
  const [selectedPlan, setSelectedPlan] = useState(0);
  const [selectedConnections, setSelectedConnections] = useState(1);

  const plans = [
    { 
      basePrice: 74.99, 
      period: "per year",
      connections: {
        1: { price: 74.99, link: 'https://buy.stripe.com/fZeg2W0INaFOd6o3cf' },
        2: { price: 119.00, link: 'https://buy.stripe.com/6oE5oiajnaFO3vO9AL' },
        3: { price: 170.00, link: 'https://buy.stripe.com/cN2bMGajneW49UcaEW' },
        4: { price: 199.00, link: 'https://buy.stripe.com/cN25oi77b29i4zS28r' }
      }
    },
    { 
      basePrice: 49.99, 
      period: "per 6 months",
      connections: {
        1: { price: 49.99, link: 'https://buy.stripe.com/5kA6sm3UZeW46I05km' },
        2: { price: 89.99, link: 'https://buy.stripe.com/bIY03Y9fjg082rKbJ6' },
        3: { price: 129.99, link: 'https://buy.stripe.com/fZe6smbnrbJSd6o5kJ' },
        4: { price: 159.99, link: 'https://buy.stripe.com/cN2eYS4Z329i5DW4gG' }
      }
    },
    { 
      basePrice: 34.99, 
      period: "per 3 months",
      connections: {
        1: { price: 34.99, link: 'https://buy.stripe.com/14k5oi63715e3vO5kl' },
        2: { price: 59.99, link: 'https://buy.stripe.com/14k03Y3UZ6py5DW00l' },
        3: { price: 69.99, link: 'https://buy.stripe.com/9AQeYS9fjaFOfewbJ4' },
        4: { price: 79.99, link: 'https://buy.stripe.com/3cseYS3UZ3dmfewdRd' }
      }
    }
  ];

  const getCurrentLink = () => {
    return plans[selectedPlan].connections[selectedConnections]?.link || '';
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-2xl">
        {/* Glassmorphism background effects */}
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-blue-900 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-blue-700 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-blue-800 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        
        {/* Main widget container */}
        <div className="relative backdrop-blur-xl bg-gradient-to-br from-blue-900/40 via-blue-800/30 to-blue-900/40 p-3 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl border border-blue-700/20">
          <div className="relative z-10">
            <h1 className="text-xl sm:text-3xl font-bold mb-4 sm:mb-8 text-center text-white">Choose My Plan</h1>
            
            <div className="grid grid-cols-1 gap-3 sm:gap-6 mb-4 sm:mb-8">
              {plans.map((plan, index) => (
                <div key={index} className="relative">
                  <PlanSelector
                    basePrice={plan.basePrice}
                    period={plan.period}
                    connections={plan.connections}
                    isSelected={selectedPlan === index}
                    onClick={() => setSelectedPlan(index)}
                    onConnectionsChange={(connections) => {
                      if (selectedPlan === index) {
                        setSelectedConnections(connections);
                      }
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Continue Button */}
            <div className="flex justify-center px-2 sm:px-0">
              <PrivateRedirectButton
                destination={getCurrentLink()}
                className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 hover:from-blue-700 hover:via-blue-600 hover:to-blue-700 text-white font-medium py-3.5 sm:py-4 px-8 sm:px-10 rounded-full text-base sm:text-lg transform transition-all hover:scale-105 w-full sm:w-auto min-w-[240px] shadow-lg"
              >
                Continue
              </PrivateRedirectButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;