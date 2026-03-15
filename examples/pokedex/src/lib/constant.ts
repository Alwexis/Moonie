export const POKEMON_TYPE_STYLES: Record<string, string> = {
  normal: "bg-type-normal text-gray-700 border-gray-400",
  fire: "bg-type-fire text-red-900 border-red-300",
  water: "bg-type-water text-blue-900 border-blue-300",
  electric: "bg-type-electric text-yellow-900 border-yellow-400",
  grass: "bg-type-grass text-green-900 border-green-300",
  ice: "bg-type-ice text-cyan-900 border-cyan-300",
  fighting: "bg-type-fighting text-pink-900 border-pink-300",
  poison: "bg-type-poison text-purple-900 border-purple-300",
  ground: "bg-type-ground text-orange-900 border-orange-300",
  flying: "bg-type-flying text-indigo-900 border-indigo-200",
  psychic: "bg-type-psychic text-pink-900 border-pink-300",
  bug: "bg-type-bug text-lime-900 border-lime-400",
  rock: "bg-type-rock text-stone-800 border-stone-400",
  ghost: "bg-type-ghost text-violet-900 border-violet-300",
  dragon: "bg-type-dragon text-blue-900 border-blue-400",
  dark: "bg-type-dark text-gray-900 border-gray-500",
  steel: "bg-type-steel text-slate-800 border-slate-400",
  fairy: "bg-type-fairy text-rose-900 border-rose-300",
} as const;

const DELAY_CLASSES = [
  "animate-delay-0",
  "animate-delay-100",
  "animate-delay-200",
  "animate-delay-300",
  "animate-delay-400",
  "animate-delay-500",
];

export type DelayClass = (typeof DELAY_CLASSES)[number];

export const calculateDelay = (id: number): DelayClass => {
  const safeId = Math.max(1, id);

  const index = (safeId - 1) % DELAY_CLASSES.length;

  return DELAY_CLASSES[index];
};

// stats
export const getStatClasses = (statName: string, value: number): string => {
  const MAP: Record<string, string> = {
    hp: "bg-red-500",
    attack: "bg-orange-500",
    defense: "bg-yellow-500",
    "special-attack": "bg-blue-500",
    "special-defense": "bg-green-500",
    speed: "bg-pink-500",
  };

  const percentage = Math.round((value / 255) * 100);
  const color = MAP[statName] ?? "bg-gray-500";

  return `w-[${percentage}%] ${color}`;
};