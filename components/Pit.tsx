import React from "react";

interface PitProps {
  stones: number;
  onClick: () => void;
  isClickable: boolean;
  isAnimating?: boolean;
  isCapturing?: boolean;
  isHighlighted?: boolean;
}

const Stone: React.FC<{ index: number }> = ({ index }) => {
  const colors = ["bg-stone-600", "bg-slate-500", "bg-gray-600", "bg-stone-500"];
  const positions = [
    "top-1/4 left-1/4",
    "top-1/4 right-1/4",
    "bottom-1/4 left-1/4",
    "bottom-1/4 right-1/4",
    "top-1/4 left-1/2 -translate-x-1/2",
    "bottom-1/4 left-1/2 -translate-x-1/2",
    "top-1/2 left-1/4 -translate-y-1/2",
    "top-1/2 right-1/4 -translate-y-1/2",
    "bottom-1/4 right-1/2 translate-x-1/2",
    "top-1/4 right-1/2 translate-x-1/2",
    "bottom-1/2 left-1/2 translate-y-1/2",
    "bottom-1/2 right-1/2 translate-y-1/2",
    "left-1/3 top-1/3 -translate-x-1/2 -translate-y-1/2",
    "right-1/3 top-1/3 translate-x-1/2 -translate-y-1/2",
    "left-1/3 bottom-1/3 -translate-x-1/2 translate-y-1/2",
    "right-1/3 bottom-1/3 translate-x-1/2 translate-y-1/2",
  ];
  const color = colors[index % colors.length];
  const position = positions[index % positions.length];

  return <div className={`absolute w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-2.5 md:h-2.5 lg:w-3 lg:h-3 rounded-full ${color} border border-stone-900/70 ${position}`} />;
};

const Pit: React.FC<PitProps> = ({ stones, onClick, isClickable, isAnimating = false, isCapturing = false, isHighlighted = false }) => {
  const pitClasses = [
    "pit-frame w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-full m-0.5 sm:m-1 md:m-2",
    "bg-amber-950/70 border-4 border-amber-900/80 flex items-center justify-center",
    "relative z-50 transition-all duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-amber-900",
    isClickable
      ? "cursor-pointer hover:-translate-y-[2px] hover:border-amber-600 active:translate-y-[1px] active:border-amber-700"
      : "cursor-default opacity-90",
    isAnimating ? "stone-animate ring-4 ring-amber-500/45 shadow-lg shadow-amber-500/40" : "",
    isHighlighted ? "pit-highlight" : "",
    isCapturing ? "capture-effect ring-2 ring-orange-400/75" : "",
  ]
    .filter((cls): cls is string => Boolean(cls))
    .join(" ");

  return (
    <button
      type="button"
      className={pitClasses}
      onClick={onClick}
      disabled={!isClickable}
    >
      <div className="pointer-events-none absolute inset-1 rounded-full border border-amber-900/60 opacity-60 shadow-inner shadow-black/40"></div>
      <div className="pointer-events-none absolute inset-1 rounded-full bg-gradient-to-b from-amber-100/25 via-transparent to-transparent mix-blend-screen"></div>
      <span className="relative text-xl sm:text-2xl md:text-3xl text-white font-bold pointer-events-none z-[60]" style={{ textShadow: "2px 2px #000" }}>
        {stones}
      </span>
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        {Array.from({ length: stones > 16 ? 16 : stones }).map((_, i) => (
          <Stone key={i} index={i} />
        ))}
      </div>
    </button>
  );
};

export default Pit;
