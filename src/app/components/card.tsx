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
  onClick?: (card: CardProps) => void;  // Ensure correct type
}

export interface CardType {
  iD_Card: number;
  name: string;
  mype: string;
  frameType: string;
  atk?: number;
  def?: number;
  level?: number;
  race?: number;
  attribute?: number;
  imageURL: string;
}


const Card: React.FC<CardProps> = (props) => {
  const handleClick = () => {
    if (props.onClick) {
      props.onClick({ ...props }); // Ensure all props are passed correctly
    }
  };

  return (
    <div className="card" onClick={handleClick} style={{ cursor: 'pointer' }}>
      <Image
        src={props.imageURL}
        alt={props.name}
        width={100}
        height={100}
        style={{ borderRadius: '5px', objectFit: 'cover' }}
      />
      <div className="card-name">{props.name}</div>
      <div className="card-id">ID: {props.iD_Card}</div>
      <div className="card-mype">Mype: {props.mype}</div>
      <div className="card-frameType">Frame Type: {props.frameType}</div>
    </div>
  );
};

export default Card;
