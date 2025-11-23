
import React from 'react';
import { Island } from '../../types';
import { Home, DollarSign, X, TrendingUp, Star } from 'lucide-react';

interface PropertyCardProps {
  island: Island;
  onBuy: () => void;
  onPass: () => void;
  onUpgrade?: () => void;
  canAfford: boolean;
  isOwner?: boolean;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ island, onBuy, onPass, onUpgrade, canAfford, isOwner }) => {
  const upgradeCost = Math.floor(island.price * 0.5);
  const nextRent = Math.floor(island.rent * Math.pow(1.5, island.level));

  return (
    <div className="bg-white rounded-xl shadow-2xl overflow-hidden w-72 transform transition-all duration-300 hover:scale-105 font-['Montserrat'] border-4 border-blue-100">
      
      {/* Header */}
      <div className={`p-4 text-white text-center relative ${isOwner ? 'bg-green-600' : 'bg-blue-600'}`}>
        <h2 className="text-xl font-bold uppercase tracking-wider">{island.name}</h2>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-black/10"></div>
        <div className="text-xs opacity-80 mt-1">{isOwner ? 'PROPERTY MANAGER' : 'TITLE DEED'}</div>
        
        {/* Level Stars */}
        <div className="flex justify-center mt-1 gap-1">
             {[...Array(island.level)].map((_, i) => (
                 <Star key={i} size={12} fill="white" strokeWidth={0} />
             ))}
        </div>
      </div>

      {/* Body */}
      <div className="p-6 text-gray-700">
        
        {!isOwner ? (
            <>
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <span className="font-semibold text-sm">Base Rent</span>
                    <span className="font-bold text-xl text-blue-900">{island.rent}€</span>
                </div>
                <p className="text-xs text-gray-500 italic mb-6 text-center leading-relaxed">
                    "{island.description}"
                </p>
                <div className="bg-gray-100 p-3 rounded-lg flex justify-between items-center mb-6">
                    <span className="text-xs font-bold uppercase text-gray-500">Price</span>
                    <span className="text-2xl font-black text-gray-800">{island.price}€</span>
                </div>
            </>
        ) : (
            <>
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <span className="font-semibold text-sm">Current Rent</span>
                    <span className="font-bold text-xl text-green-700">{Math.floor(island.rent * Math.pow(1.5, island.level - 1))}€</span>
                </div>
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <span className="font-semibold text-sm">Next Level Rent</span>
                    <span className="font-bold text-xl text-blue-600">{nextRent}€</span>
                </div>
                <div className="bg-gray-100 p-3 rounded-lg flex justify-between items-center mb-6">
                    <span className="text-xs font-bold uppercase text-gray-500">Upgrade Cost</span>
                    <span className="text-2xl font-black text-gray-800">{upgradeCost}€</span>
                </div>
            </>
        )}

        {/* Actions */}
        <div className="flex gap-2">
            {!isOwner ? (
                <button 
                    onClick={onBuy}
                    disabled={!canAfford}
                    className={`flex-1 py-3 rounded-lg font-bold shadow-md transition-colors flex justify-center items-center gap-1
                        ${canAfford 
                            ? 'bg-green-500 hover:bg-green-400 text-white' 
                            : 'bg-gray-300 cursor-not-allowed text-gray-500'}
                    `}
                >
                    <DollarSign size={16} /> BUY
                </button>
            ) : (
                <button 
                    onClick={onUpgrade}
                    disabled={!canAfford || island.level >= 4}
                    className={`flex-1 py-3 rounded-lg font-bold shadow-md transition-colors flex justify-center items-center gap-1
                        ${canAfford && island.level < 4
                            ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                            : 'bg-gray-300 cursor-not-allowed text-gray-500'}
                    `}
                >
                    <TrendingUp size={16} /> {island.level >= 4 ? 'MAX' : 'UPGRADE'}
                </button>
            )}

            <button 
                onClick={onPass}
                className="w-12 bg-red-100 hover:bg-red-200 text-red-500 rounded-lg flex items-center justify-center transition-colors"
            >
                <X size={20} />
            </button>
        </div>
      </div>
    </div>
  );
};
