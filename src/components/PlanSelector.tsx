import React, { useState } from 'react';
import { Circle, CheckCircle2, Smartphone, Laptop, Tablet, Plus, Monitor } from 'lucide-react';

interface ConnectionPrice {
  price: number;
  link: string;
}

interface Connections {
  [key: number]: ConnectionPrice;
}

interface PlanSelectorProps {
  basePrice: number;
  period: string;
  connections: Connections;
  isSelected?: boolean;
  onClick?: () => void;
  onConnectionsChange?: (connections: number) => void;
}

const PlanSelector: React.FC<PlanSelectorProps> = ({
  basePrice,
  period,
  connections,
  isSelected = false,
  onClick,
  onConnectionsChange
}) => {
  const [selectedConnections, setSelectedConnections] = useState(1);
  const [isOpen, setIsOpen] = useState(false);

  const connectionOptions = [
    { connections: 1, icon: Smartphone },
    { connections: 2, icon: Laptop },
    { connections: 3, icon: Tablet },
    { connections: 4, icon: Monitor }
  ];

  const getCurrentPrice = () => {
    return connections[selectedConnections]?.price || basePrice;
  };

  const handleConnectionChange = (connections: number) => {
    setSelectedConnections(connections);
    setIsOpen(false);
    onConnectionsChange?.(connections);
  };

  const getCurrentDeviceIcon = () => {
    const option = connectionOptions.find(opt => opt.connections === selectedConnections);
    const Icon = option?.icon || Smartphone;
    return <Icon className="w-4 h-4 text-white" />;
  };

  return (
    <div className="relative">
      <div
        onClick={onClick}
        className={`bg-gradient-to-r from-black via-blue-600 to-gray-900 hover:from-black hover:via-blue-700 hover:to-gray-800 py-4 max-w-3xl mx-auto w-full border-2 ${isSelected ? 'border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.5)]' : 'border-gray-700'} rounded-[1.5rem] transform transition-all hover:scale-105 group cursor-pointer overflow-hidden`}
      >
        <div className="flex items-center justify-between px-4 h-[42px]">
          <div className="flex items-center gap-2">
            {isSelected ? (
              <CheckCircle2 className="w-5 h-5 text-blue-400" />
            ) : (
              <Circle className="w-5 h-5 text-gray-500" />
            )}
            <span className="text-lg font-bold text-white">
              ${getCurrentPrice()}
            </span>
            <span className="text-sm text-gray-300">{period}</span>
          </div>
          
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
            className="flex items-center bg-black hover:bg-gray-900 rounded-full h-[34px] border-2 border-blue-400 transform transition-all hover:scale-105"
          >
            <div className="flex items-center gap-1.5 px-2">
              {getCurrentDeviceIcon()}
              <span className="text-sm text-white">{selectedConnections}</span>
            </div>
            <div className="flex items-center gap-1.5 border-l border-blue-400/30 px-2">
              <span className="text-sm text-white whitespace-nowrap">Devices</span>
              <Plus className="w-4 h-4 text-white" />
            </div>
          </button>
        </div>
      </div>
      
      <div 
        className={`absolute right-8 top-full mt-4 w-64 bg-black rounded-xl border-2 border-gray-800 shadow-lg transform transition-all duration-200 z-20
          ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}
      >
        <div className="p-4">
          <h3 className="text-white text-base font-medium mb-3">Select Devices</h3>
          <div className="space-y-2">
            {connectionOptions.map((option) => (
              <button
                key={option.connections}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleConnectionChange(option.connections);
                }}
                className={`w-full p-2.5 rounded-lg transition-all flex items-center justify-between ${
                  selectedConnections === option.connections
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-900 text-gray-300 hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  {React.createElement(option.icon, {
                    className: `w-4 h-4 ${selectedConnections === option.connections ? 'text-white' : 'text-gray-400'}`
                  })}
                  <span className="text-sm">
                    {option.connections} {option.connections === 1 ? 'Device' : 'Devices'}
                  </span>
                </div>
                <span className="text-sm font-semibold">
                  ${connections[option.connections].price}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanSelector;