import React from 'react';
import { Player } from '../types';

interface StoreProps {
  stones: number;
  player: Player;
  isActive: boolean;
}

const Store: React.FC<StoreProps> = ({ stones, player, isActive }) => {
  const borderColor = player === Player.One ? 'border-orange-600' : 'border-amber-700';
  const baseBg = isActive ? (player === Player.One ? 'bg-gradient-to-b from-orange-900/70 via-amber-900/60 to-amber-950/70' : 'bg-gradient-to-b from-amber-900/70 via-amber-950/65 to-stone-950/70') : 'bg-amber-950/55';
  const activeAccent = isActive ? 'ring-4 ring-orange-400/25 shadow-lg shadow-orange-900/35' : 'opacity-95';
  const storeClasses = [
    'store-frame pixel-shadow relative w-16 h-24 sm:w-20 sm:h-32 md:w-24 md:h-40 lg:w-28 lg:h-56 rounded-2xl border-4',
    borderColor,
    baseBg,
    'flex items-center justify-center transition-all duration-300 ease-out',
    activeAccent,
  ]
    .filter((cls): cls is string => Boolean(cls))
    .join(' ');

  return (
    <div className={storeClasses}>
      <div className="pointer-events-none absolute inset-2 rounded-2xl border border-black/40 opacity-70"></div>
      <div className="pointer-events-none absolute inset-2 rounded-2xl bg-gradient-to-b from-amber-200/12 via-transparent to-transparent mix-blend-soft-light"></div>
      <span className="relative text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-amber-100 font-bold drop-shadow-[2px_2px_0_rgba(0,0,0,0.75)]">
        {stones}
      </span>
    </div>
  );
};

export default Store;
