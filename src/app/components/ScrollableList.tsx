import React from "react";
import Card from "../components/card";
import type { CardType } from "../components/card";

interface ScrollableListProps {
  items: CardType[];
  onCardClick: (card: CardType) => void;
}

const ScrollableList: React.FC<ScrollableListProps> = ({ items, onCardClick }) => {
  return (
    <nav style={{ marginTop: 200 }}>
      <ul
        style={{
          height: 400,
          width: 300,
          overflowY: "scroll",
          listStyle: "none",
          padding: 0,
        }}
      >
        {items.map((item) => (
          <li key={item.iD_Card}>
            <Card
              {...item}
              onClick={() => onCardClick(item)}
            />
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default ScrollableList;
