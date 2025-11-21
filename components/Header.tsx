import React from 'react';
import { Trophy } from 'lucide-react';

interface HeaderProps {
  score?: number;
  level?: number;
}

const Header: React.FC<HeaderProps> = ({ score = 0, level = 1 }) => {
  return (
    <header className="bg-gray-900/40 border-b border-white/10 sticky top-0 z-10 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src="https://cdn-icons-png.flaticon.com/512/6194/6194029.png" 
            alt="SmartTask Logo" 
            className="w-10 h-10 object-contain drop-shadow-md"
          />
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight leading-tight drop-shadow-sm">SmartTask</h1>
            <p className="text-xs text-gray-400 font-medium flex items-center gap-1">
              Powered by KD
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end">
             <span className="text-xs font-bold text-gray-200">Level {level}</span>
             <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-1">
               {score} XP Total
             </span>
          </div>
          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-lg ring-2 ring-white/10 transition-transform hover:scale-105">
            <Trophy className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;