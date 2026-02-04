import React from "react";

type Props = {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  color: string;
  onClick?: () => void;
};

export function BigOptionButton({
  icon,
  title,
  subtitle,
  color,
  onClick,
}: Props) {
  return (
    <button
      onClick={onClick}
      className={`
        ${color}
        w-full h-72
        rounded-2xl
        flex flex-col items-center justify-center
        text-white
        shadow-xl
        active:scale-95
        transition
      `}
    >
      {icon}

      <h2 className="text-3xl font-bold mt-6">
        {title}
      </h2>

      <p className="text-xl opacity-90 mt-2">
        {subtitle}
      </p>
    </button>
  );
}
export function MiniOptionButton({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 shadow-md hover:shadow-lg transition">
      {/* Textos à esquerda */}
      <div className="flex flex-col">
        <span className="font-bold text-black">{title}</span>
        <span className="text-sm text-black opacity-90">{subtitle}</span>
      </div>

      {/* Ícone à direita */}
      <span className="text-red-500 text-2xl">📍</span>
    </div>
  );
}