import React from "react";
import Card from "../components/card";
import type { CardType } from "../components/card";

interface ScrollableListProps {
  items: CardType[];
  onCardClick: (card: CardType) => void;
  className?: string;
}

const ScrollableList: React.FC<ScrollableListProps> = ({ 
  items, 
  onCardClick,
  className = ""
}) => {
  return (
    <div className={`flex-1 ${className}`}>
      <ul className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-900 space-y-2 pr-2">
        {items.map((item) => (
          <li 
            key={item.iD_Card}
            className="group relative transition-transform hover:translate-x-2"
          >
            <Card
              {...item}
              onClick={() => onCardClick(item)}
              className="hover:border-red-500 cursor-pointer bg-zinc-800 border-2 border-zinc-700"
            />
          </li>
        ))}
        {items.length === 0 && (
          <div className="text-center text-zinc-400 py-4">
            No cards found
          </div>
        )}
      </ul>
    </div>
  );
};

export default ScrollableList;