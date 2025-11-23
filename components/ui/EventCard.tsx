
import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { Zap, AlertTriangle, Gift } from 'lucide-react';

export const EventCard = () => {
    const currentEvent = useGameStore(state => state.currentEvent);
    const dismissEvent = useGameStore(state => state.dismissEvent);

    if (!currentEvent) return null;

    let Icon = AlertTriangle;
    let colorClass = "bg-yellow-500";
    if (currentEvent.type === 'GOOD') {
        Icon = Gift;
        colorClass = "bg-green-500";
    } else if (currentEvent.type === 'BAD') {
        Icon = Zap;
        colorClass = "bg-red-500";
    }

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 pointer-events-auto">
            <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden transform animate-bounce-in">
                <div className={`${colorClass} p-6 flex justify-center items-center`}>
                    <Icon className="text-white w-16 h-16 drop-shadow-md" />
                </div>
                <div className="p-8 text-center">
                    <h2 className="text-2xl font-black text-gray-800 mb-2 uppercase tracking-wide font-['Montserrat']">
                        {currentEvent.title}
                    </h2>
                    <p className="text-gray-600 mb-8 font-['Comfortaa'] leading-relaxed">
                        {currentEvent.description}
                    </p>
                    <button 
                        onClick={dismissEvent}
                        className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition active:scale-95 shadow-lg"
                    >
                        OK, ENTAXEI
                    </button>
                </div>
                <div className="bg-gray-50 p-2 text-center text-xs text-gray-400 uppercase tracking-widest border-t">
                    Malakies Cards
                </div>
            </div>
        </div>
    );
};
