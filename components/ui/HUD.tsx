

import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { Wind, MapPin, DollarSign, Coffee, Sun, Trophy, User, Lock, Calendar, Anchor, Plus, X, BookOpen, Ship, Users, Moon, Sunrise, Sunset } from 'lucide-react';
import { PropertyCard } from './PropertyCard';
import { EventCard } from './EventCard';
import { IslandInfoModal } from './IslandInfoModal';
import { FERRY_CONFIG, CYCLE_PHASE } from '../../constants';
import { FerryType } from '../../types';

const AVATAR_COLORS = [
    { name: 'Kamaki Red', hex: '#ef4444' },
    { name: 'Tourist Blue', hex: '#3b82f6' },
    { name: 'Yiayia Black', hex: '#1f2937' },
    { name: 'Ferry White', hex: '#f3f4f6' },
    { name: 'Olive Green', hex: '#65a30d' },
];

export const HUD = () => {
  const { 
    players, 
    turnIndex, 
    phase, 
    diceValue, 
    message, 
    rollDice, 
    payBail,
    buyProperty, 
    upgradeProperty,
    buyFerryUpgrade,
    skipTurn,
    endTurn,
    initializeGame,
    islands,
    weather,
    isDiceRolling,
    updatePlayerName,
    updatePlayerAvatar,
    addPlayer,
    removePlayer,
    currentDay,
    maxDays,
    timeOfDay
  } = useGameStore();

  const [showInfo, setShowInfo] = useState(false);

  const currentPlayer = players[turnIndex];
  const currentIsland = islands.find(i => i.id === currentPlayer.positionId);
  
  // Time Logic for UI
  const isNight = timeOfDay > CYCLE_PHASE.SUNSET_END && timeOfDay < CYCLE_PHASE.SUNRISE_START;
  const isSunset = timeOfDay >= CYCLE_PHASE.SUNSET_START && timeOfDay <= CYCLE_PHASE.SUNSET_END;
  const isSunrise = timeOfDay >= CYCLE_PHASE.SUNRISE_START && timeOfDay <= CYCLE_PHASE.SUNRISE_END;
  const isDay = !isNight && !isSunset && !isSunrise;

  // Initial Lobby Screen
  if (phase === 'LOBBY') {
      return (
          <div className="absolute inset-0 flex items-center justify-center bg-blue-900/40 backdrop-blur-sm z-50 pointer-events-auto font-['Montserrat']">
              <div className="bg-white/90 backdrop-blur-md p-8 md:p-10 rounded-3xl shadow-2xl max-w-2xl w-full border border-white/50 m-4 flex flex-col md:flex-row gap-8 overflow-y-auto max-h-[90vh]">
                  
                  <div className="flex-1 text-center md:text-left">
                    <h1 className="text-4xl font-extrabold text-blue-600 mb-2 font-['Comfortaa']">Aegean Tycoon</h1>
                    <h2 className="text-xl text-gray-600 mb-6">Summer Wars</h2>
                    <p className="mb-8 text-gray-700 text-sm leading-relaxed">
                        The ferries are late, the frappe is expensive, and everyone wants your money. 
                        Navigate the Cyclades, build an empire, and avoid the Meltemi winds.
                    </p>
                    <button 
                        onClick={initializeGame}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition transform hover:scale-105"
                    >
                        START SEASON
                    </button>
                  </div>

                  <div className="flex-1 bg-blue-50/50 rounded-2xl p-6 relative">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2"><User size={18}/> Player Setup</h3>
                        {players.length < 4 && (
                            <button onClick={addPlayer} className="bg-green-500 hover:bg-green-600 text-white p-1 rounded-full shadow transition">
                                <Plus size={16} />
                            </button>
                        )}
                      </div>
                      
                      <div className="space-y-4">
                          {players.map((p, idx) => (
                              <div key={p.id} className="bg-white p-4 rounded-xl shadow-sm relative group">
                                  {players.length > 2 && (
                                      <button 
                                        onClick={() => removePlayer(p.id)}
                                        className="absolute top-2 right-2 text-gray-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                                      >
                                          <X size={14} />
                                      </button>
                                  )}
                                  
                                  <label className="text-xs font-bold text-gray-400 uppercase">Player {idx + 1}</label>
                                  <input 
                                    type="text" 
                                    value={p.name}
                                    onChange={(e) => updatePlayerName(p.id, e.target.value)}
                                    className="w-full font-bold text-lg text-gray-800 border-b border-gray-200 focus:outline-none focus:border-blue-500 bg-transparent mb-3"
                                  />
                                  <div className="flex gap-2">
                                      {AVATAR_COLORS.map(c => (
                                          <button 
                                            key={c.hex}
                                            onClick={() => updatePlayerAvatar(p.id, c.hex)}
                                            className={`w-6 h-6 rounded-full border-2 ${p.avatarColor === c.hex ? 'border-gray-800 scale-110' : 'border-transparent'}`}
                                            style={{ backgroundColor: c.hex }}
                                            title={c.name}
                                          />
                                      ))}
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
                  
              </div>
          </div>
      )
  }

  // Game Over Screen
  if (phase === 'GAME_OVER') {
      const winner = [...players].sort((a,b) => b.money - a.money)[0];
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md z-50 pointer-events-auto">
            <div className="bg-white p-10 rounded-3xl shadow-2xl text-center animate-bounce-in max-w-lg">
                <Trophy size={64} className="mx-auto text-yellow-400 mb-4" />
                <h1 className="text-4xl font-black text-gray-800 mb-2">GAME OVER</h1>
                <p className="text-xl text-gray-600 mb-6">{message}</p>
                <div className="bg-blue-50 rounded-xl p-6 mb-6">
                    <span className="block text-sm text-blue-400 uppercase font-bold tracking-widest">The Big Boss</span>
                    <span className="block text-3xl font-bold text-blue-800">{winner.name}</span>
                    <span className="block text-lg text-blue-600">{winner.money}€</span>
                </div>
                <button 
                    onClick={() => window.location.reload()}
                    className="bg-gray-800 text-white font-bold py-3 px-8 rounded-full hover:bg-gray-700 transition"
                >
                    Play Again
                </button>
            </div>
        </div>
      );
  }

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 md:p-6 font-['Montserrat']">
      
      {/* GLOBAL OVERLAYS */}
      <EventCard />
      
      {showInfo && currentIsland && (
          <IslandInfoModal island={currentIsland} onClose={() => setShowInfo(false)} />
      )}

      {/* Top Bar: Player Stats & Calendar */}
      <div className="flex justify-between items-start pointer-events-auto">
        <div className="flex gap-4 overflow-x-auto pb-2 max-w-[70vw]">
            {players.map((p, idx) => (
                <div 
                    key={p.id} 
                    className={`
                        relative overflow-hidden rounded-2xl p-4 min-w-[140px] md:w-56 transition-all duration-300 border shadow-md flex-shrink-0
                        ${idx === turnIndex ? 'bg-white/95 scale-105 border-blue-400 ring-2 ring-blue-200' : 'bg-white/40 border-transparent blur-[1px]'}
                        ${p.money < 0 ? 'bg-red-200' : ''}
                        ${p.isJailed ? 'ring-4 ring-red-500' : ''}
                    `}
                >
                    <div className="flex items-center justify-between mb-2">
                         <div className="flex items-center gap-2">
                             <div className="w-3 h-3 rounded-full shadow-sm ring-1 ring-black/10" style={{ backgroundColor: p.avatarColor }} />
                             <span className="font-bold text-gray-800 truncate text-sm md:text-base">{p.name}</span>
                             {p.isJailed && <Lock size={12} className="text-red-600" />}
                         </div>
                         {/* Tourist Count */}
                         <div className="flex items-center gap-1 bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs font-bold">
                             <Users size={10} /> {p.tourists}
                         </div>
                    </div>
                    
                    <div className={`flex items-center font-mono text-lg md:text-xl font-bold ${p.money < 0 ? 'text-red-600' : 'text-green-700'}`}>
                        <DollarSign size={16} strokeWidth={3} /> {p.money}
                    </div>
                    
                    <div className="flex justify-between items-end mt-1">
                        <div className="text-xs text-gray-500 flex items-center gap-1 truncate max-w-[100px]">
                             <MapPin size={10} /> {islands.find(i => i.id === p.positionId)?.name.substring(0, 10)}
                        </div>
                        <div className="text-[10px] uppercase font-bold text-gray-400 bg-gray-100 px-1 rounded">
                            {FERRY_CONFIG[p.ferryType].name.split(' ')[0]}
                        </div>
                    </div>
                </div>
            ))}
        </div>
        
        {/* Environment Info */}
        <div className="flex flex-col items-end gap-2">
            {/* Calendar Widget */}
            <div className="bg-white/90 backdrop-blur-md px-5 py-3 rounded-2xl shadow-lg border border-white/50 flex flex-col items-center">
                 <span className="text-xs font-bold text-red-500 uppercase tracking-widest flex items-center gap-1">
                     <Calendar size={10} /> August
                 </span>
                 <span className="text-3xl font-black text-gray-800 leading-none">{currentDay}</span>
                 <span className="text-[10px] text-gray-400">{maxDays - currentDay} days left</span>
            </div>

            {/* Weather Widget */}
            <div className={`
                backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 text-white border shadow-lg transition-colors duration-1000
                ${weather === 'MELTEMI' ? 'bg-red-500/90 border-red-400 animate-pulse' : (
                    isNight ? 'bg-indigo-900/60 border-indigo-500' : 
                    (isSunset ? 'bg-orange-500/60 border-orange-400' : 
                    (isSunrise ? 'bg-pink-400/60 border-pink-300' : 'bg-blue-500/30 border-white/20'))
                )}
            `}>
                 {weather === 'MELTEMI' ? (
                     <Wind size={20} className=""/> 
                 ) : (
                     isNight ? <Moon size={20} className="text-yellow-200" /> : 
                     (isSunset ? <Sunset size={20} className="text-orange-100" /> :
                     (isSunrise ? <Sunrise size={20} className="text-yellow-100" /> : <Sun size={20} className="text-yellow-300"/>))
                 )}
                 <span className="text-sm font-semibold hidden md:inline">
                    {weather === 'MELTEMI' ? 'Meltemi (Half Speed!)' : (
                        isNight ? 'Night Time' : 
                        (isSunset ? 'Sunset' : 
                        (isSunrise ? 'Sunrise' : 'Sunny'))
                    )}
                 </span>
            </div>
        </div>
      </div>

      {/* Center Toast (Minimal, for minor updates) */}
      {message && phase !== 'ACTION' && phase !== 'EVENT' && !isDiceRolling && (
          <div className="absolute top-32 left-1/2 -translate-x-1/2 pointer-events-none w-full max-w-md flex justify-center z-0">
              <div className="bg-black/70 text-white backdrop-blur-md px-6 py-2 rounded-full shadow-2xl flex items-center gap-3 animate-fade-in-up border border-white/10">
                  <Coffee size={16} className="text-yellow-400" />
                  <span className="text-sm font-medium">{message}</span>
              </div>
          </div>
      )}

      {/* Bottom Bar / Action Center */}
      <div className="pointer-events-auto flex flex-col items-center gap-4 mb-8">
        
        {/* 1. ROLL DICE BUTTON */}
        {phase === 'ROLLING' && !isDiceRolling && (
            <div className="flex gap-4">
                {currentPlayer.isJailed && (
                    <button 
                        onClick={payBail}
                        className="bg-red-600 hover:bg-red-500 text-white font-bold py-4 px-8 rounded-2xl shadow-xl transition-all border-4 border-white/20 flex flex-col items-center"
                    >
                         <span className="text-sm">
                            {currentPlayer.jailReason === 'STRIKE' ? 'PAY SCAB BOAT (50€)' : 'BRIBE POLICE (50€)'}
                         </span>
                    </button>
                )}
                
                <button 
                    onClick={rollDice}
                    className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold py-4 px-16 rounded-2xl shadow-xl transition-all active:scale-95 flex flex-col items-center border-4 border-white/20"
                >
                    <span className="text-2xl tracking-widest drop-shadow-md">
                        {currentPlayer.isJailed ? 'ROLL 6 TO ESCAPE' : 'ROLL DICE'}
                    </span>
                    {currentPlayer.ferryType === 'SPEEDBOAT' && (
                        <span className="text-xs text-blue-100 font-bold mt-1">
                            Speedboat Active: Best of 2!
                        </span>
                    )}
                </button>
            </div>
        )}

        {/* Action Phase Controls Container */}
        {phase === 'ACTION' && currentIsland && (
            <div className="flex items-end gap-4 max-w-full overflow-x-auto p-2">
                
                {/* Info Button */}
                <button 
                    onClick={() => setShowInfo(true)}
                    className="bg-white hover:bg-gray-50 text-blue-600 p-4 rounded-2xl shadow-xl border-2 border-white/50 transition-transform active:scale-95"
                    title="Island Guide"
                >
                    <BookOpen size={24} />
                </button>

                {/* 2. PROPERTY CARD (Islands) */}
                {currentIsland.type === 'ISLAND' && (
                    <PropertyCard 
                        island={currentIsland} 
                        onBuy={buyProperty} 
                        onPass={skipTurn} 
                        onUpgrade={upgradeProperty}
                        canAfford={currentPlayer.money >= (currentIsland.ownerId === currentPlayer.id ? Math.floor(currentIsland.price * 0.5) : currentIsland.price)}
                        isOwner={currentIsland.ownerId === currentPlayer.id}
                    />
                )}

                {/* 3. START TILE / SHIPYARD (Upgrades) */}
                {currentIsland.type === 'START' && (
                    <div className="bg-white rounded-xl shadow-2xl p-4 w-[400px] border-4 border-blue-100">
                        <h2 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                            <Ship size={20} className="text-blue-600"/> Piraeus Shipyard
                        </h2>
                        <p className="text-xs text-gray-500 mb-4">Tourists refilled automatically. Upgrade your fleet below.</p>
                        
                        <div className="grid grid-cols-1 gap-2">
                             {/* SPEEDBOAT */}
                             <button 
                                onClick={() => buyFerryUpgrade('SPEEDBOAT')}
                                disabled={currentPlayer.money < FERRY_CONFIG.SPEEDBOAT.cost || currentPlayer.ferryType === 'SPEEDBOAT'}
                                className={`flex justify-between items-center p-3 rounded-lg border-2 ${currentPlayer.ferryType === 'SPEEDBOAT' ? 'bg-green-100 border-green-500' : 'bg-gray-50 hover:bg-white border-gray-200'}`}
                             >
                                 <div className="text-left">
                                     <div className="font-bold text-gray-800">{FERRY_CONFIG.SPEEDBOAT.name}</div>
                                     <div className="text-xs text-gray-500">{FERRY_CONFIG.SPEEDBOAT.desc}</div>
                                 </div>
                                 <div className="font-bold text-blue-600">{FERRY_CONFIG.SPEEDBOAT.cost}€</div>
                             </button>

                             {/* CATAMARAN */}
                             <button 
                                onClick={() => buyFerryUpgrade('CATAMARAN')}
                                disabled={currentPlayer.money < FERRY_CONFIG.CATAMARAN.cost || currentPlayer.ferryType === 'CATAMARAN'}
                                className={`flex justify-between items-center p-3 rounded-lg border-2 ${currentPlayer.ferryType === 'CATAMARAN' ? 'bg-green-100 border-green-500' : 'bg-gray-50 hover:bg-white border-gray-200'}`}
                             >
                                 <div className="text-left">
                                     <div className="font-bold text-gray-800">{FERRY_CONFIG.CATAMARAN.name}</div>
                                     <div className="text-xs text-gray-500">{FERRY_CONFIG.CATAMARAN.desc}</div>
                                 </div>
                                 <div className="font-bold text-blue-600">{FERRY_CONFIG.CATAMARAN.cost}€</div>
                             </button>
                             
                             <button onClick={endTurn} className="mt-2 w-full bg-gray-800 text-white font-bold py-2 rounded-lg">
                                 DEPART
                             </button>
                        </div>
                    </div>
                )}

                {/* 4. GENERIC EVENT END */}
                {currentIsland.type === 'EVENT' && (
                    <div className="bg-white/90 backdrop-blur-xl p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4 border border-white/50">
                        <p className="font-bold text-gray-800 text-lg text-center">{message}</p>
                        <button 
                            onClick={endTurn}
                            className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-10 rounded-xl shadow-md transition-all active:scale-95"
                        >
                            END TURN
                        </button>
                    </div>
                )}
            </div>
        )}

        {/* 4. MOVING INDICATOR */}
        {phase === 'MOVING' && (
            <div className="bg-blue-600/90 backdrop-blur text-white px-8 py-3 rounded-full font-bold italic shadow-lg border border-blue-400/50 flex items-center gap-2">
                <Anchor size={16} className="animate-bounce" />
                Ferry En Route...
            </div>
        )}
        
        {/* 5. CHOOSING PATH INDICATOR */}
        {phase === 'CHOOSING_PATH' && (
            <div className="bg-yellow-500 text-white px-8 py-4 rounded-full font-bold shadow-lg animate-pulse border-4 border-yellow-300">
                Tap an arrow to choose your route!
            </div>
        )}

      </div>
    </div>
  );
};
