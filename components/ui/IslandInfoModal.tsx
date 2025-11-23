
import React from 'react';
import { Island } from '../../types';
import { X, MapPin, Lightbulb } from 'lucide-react';

interface IslandInfoModalProps {
  island: Island;
  onClose: () => void;
}

export const IslandInfoModal: React.FC<IslandInfoModalProps> = ({ island, onClose }) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in pointer-events-auto">
      <div className="bg-white/95 backdrop-blur-xl w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-white/40 flex flex-col max-h-[80vh]">
        
        {/* Header */}
        <div className="bg-blue-600 p-6 relative shrink-0">
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-colors"
            >
                <X size={20} />
            </button>
            <h2 className="text-3xl font-black text-white uppercase tracking-tight font-['Montserrat'] mb-1">
                {island.name}
            </h2>
            <div className="text-blue-100 text-sm font-medium opacity-90 flex items-center gap-2">
                <MapPin size={14} /> Travel Guide
            </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto font-['Comfortaa'] text-gray-700 space-y-6">
            
            {/* Description */}
            <p className="italic text-lg text-gray-500 border-l-4 border-blue-300 pl-4 py-1">
                "{island.description}"
            </p>

            {/* Landmarks */}
            {island.landmarks && island.landmarks.length > 0 && (
                <div>
                    <h3 className="font-bold text-gray-900 uppercase text-xs tracking-widest mb-3 flex items-center gap-2">
                        <MapPin size={14} className="text-blue-500" /> Must See
                    </h3>
                    <ul className="space-y-2">
                        {island.landmarks.map((landmark, idx) => (
                            <li key={idx} className="bg-blue-50 p-3 rounded-xl text-sm font-bold text-blue-800 shadow-sm border border-blue-100">
                                {landmark}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Fun Fact */}
            {island.funFact && (
                <div className="bg-yellow-50 p-4 rounded-2xl border border-yellow-100 shadow-sm">
                    <h3 className="font-bold text-yellow-700 uppercase text-xs tracking-widest mb-2 flex items-center gap-2">
                        <Lightbulb size={14} /> Did You Know?
                    </h3>
                    <p className="text-sm leading-relaxed text-gray-800">
                        {island.funFact}
                    </p>
                </div>
            )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 shrink-0">
            <button 
                onClick={onClose}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition shadow-lg"
            >
                CONTINUE JOURNEY
            </button>
        </div>

      </div>
    </div>
  );
};
