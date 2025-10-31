import React from 'react';
import { Player } from '../types';

interface PlayerIndicatorProps {
  player: Player;
  isActive: boolean;
  isYou: boolean;
}

const PlayerIndicator: React.FC<PlayerIndicatorProps> = ({ player, isActive, isYou }) => {
  const color = player === Player.One ? 'text-orange-400' : 'text-amber-400';
  const visibility = isActive ? 'opacity-100' : 'opacity-30';
  const panelClasses = [
    'status-banner pixel-shadow flex flex-col items-center gap-1 min-w-[9rem] text-[10px] md:text-xs tracking-tight uppercase',
    visibility,
    isActive ? 'scale-105 turn-indicator-animate' : 'scale-95',
    'transition-transform duration-300 ease-out',
  ]
    .filter((cls): cls is string => Boolean(cls))
    .join(' ');

  return (
    <div className={panelClasses}>
      <span className={`text-base md:text-lg ${color}`}>Player {player === Player.One ? '1' : '2'}</span>
      <div className="flex items-center gap-2 text-amber-100">
        {isActive ? <span className="animate-pulse text-[11px] md:text-sm text-amber-50">Your Turn</span> : <span className="text-[11px] md:text-sm opacity-70">Waiting</span>}
        {isYou && <span className="text-amber-200/80 text-[9px] md:text-xs">You</span>}
      </div>
    </div>
  );
};

export default PlayerIndicator;
