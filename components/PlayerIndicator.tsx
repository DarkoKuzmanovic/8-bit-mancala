import React from 'react';
import { Player } from '../types';

interface PlayerIndicatorProps {
  player: Player;
  isActive: boolean;
  isYou: boolean;
}

const PlayerIndicator: React.FC<PlayerIndicatorProps> = ({ player, isActive, isYou }) => {
  const color = player === Player.One ? 'text-orange-400' : 'text-amber-400';
  const panelClasses = [
    'status-banner pixel-shadow flex flex-col items-center gap-2 min-w-[10rem] text-[10px] md:text-xs tracking-tight uppercase player-indicator',
    isActive ? 'active' : 'inactive',
    !isActive && 'waiting',
  ]
    .filter((cls): cls is string => Boolean(cls))
    .join(' ');

  const turnTextClasses = [
    'text-[11px] md:text-sm turn-text',
    isActive ? 'active' : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={panelClasses} style={{ color: isActive ? color : undefined }}>
      <div className="flex items-center gap-2">
        <span className={`text-base md:text-lg player-number ${color}`}>Player {player === Player.One ? '1' : '2'}</span>
        {isYou && <span className="you-badge">You</span>}
      </div>
      <div className="flex flex-col items-center gap-1">
        {isActive ? (
          <>
            <span className={`${turnTextClasses} text-amber-50 font-semibold`}>
              Your Turn
            </span>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
            </div>
          </>
        ) : (
          <span className="text-[11px] md:text-sm opacity-70">
            Waiting
          </span>
        )}
      </div>
    </div>
  );
};

export default PlayerIndicator;
