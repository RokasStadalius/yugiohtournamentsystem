import React from 'react';
import Image from 'next/image';

interface CardProps {
  imageURL: string;
  name: string;
  iD_Card: number;
  mype: string;
  frameType: string;
  atk?: number;
  def?: number;
  level?: number;
  race?: number;
  attribute?: number;
  onClick?: (card: CardProps) => void;
  className?: string;
  imageClassName?: string;
  description? : string;
}

export interface CardType extends Omit<CardProps, 'className' | 'imageClassName'> {}

const Card: React.FC<CardProps> = ({ 
  className = '',
  imageClassName = '',
  ...props 
}) => {
  const handleClick = () => {
    if (props.onClick) {
      props.onClick(props);
    }
  };

  return (
    <div 
      className={`group relative bg-zinc-800 rounded-lg border-2 border-zinc-700 p-2 transition-all 
        hover:border-red-500 hover:shadow-xl cursor-pointer h-full flex flex-col ${className}`}
      onClick={handleClick}
    >
      <div className={`relative w-full flex-1 ${imageClassName}`}>
        <Image
          src={props.imageURL}
          alt={props.name}
          fill
          className="object-contain transition-transform group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 300px"
          quality={100}
        />
      </div>
      
      <div className="mt-2 space-y-1">
        <h3 className="text-sm font-medium text-zinc-200 truncate">{props.name}</h3>
        <div className="flex justify-between text-xs text-zinc-400">
          <span>ID: {props.iD_Card}</span>
          <span className="capitalize">{props.frameType}</span>
        </div>
        {(props.atk || props.def) && (
          <div className="text-xs text-red-400">
            ATK {props.atk} / DEF {props.def}
          </div>
        )}
      </div>
    </div>
  );
};

export default Card;