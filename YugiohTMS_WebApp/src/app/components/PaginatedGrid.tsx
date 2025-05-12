import React, { useState } from "react";
import Card from "../components/card";
import type { CardType } from "../components/card";
import { Button } from "@/components/ui/button";

interface PaginatedGridProps {
    items: CardType[];
    itemsPerPage: number;
    className?: string;
    onCardClick: (card: CardType) => void;
    onCardContextMenu?: (card: CardType, e: React.MouseEvent<HTMLDivElement>) => void;
}

const PaginatedGrid = ({
    items,
    onCardClick,
    className = "",
    itemsPerPage = 8,
    onCardContextMenu
}: PaginatedGridProps) => {
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(items.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = items.slice(startIndex, endIndex);

    return (
        <div className={`flex flex-col h-full ${className}`}>
            <div className="grid grid-cols-2 gap-4 flex-1 pb-4">
                {currentItems.map((item) => (
                    <div 
                        key={item.iD_Card} 
                        className="h-48"
                        onContextMenu={(e) => onCardContextMenu?.(item, e)} // Fixed variable name
                    >
                        <Card
                            {...item}
                            onClick={() => onCardClick(item)}
                            className="hover:border-red-500 cursor-pointer bg-zinc-800 border-2 border-zinc-700 h-full"
                            imageClassName="h-32"
                        />
                    </div>
                ))}
            </div>
            
            {items.length > 0 && (
                <div className="flex items-center justify-between pt-4 border-t border-zinc-700">
                    <Button 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        variant="ghost"
                        className="text-red-500 hover:bg-zinc-800"
                    >
                        Previous
                    </Button>
                    
                    <span className="text-zinc-400 text-sm">
                        Page {currentPage} of {totalPages}
                    </span>

                    <Button 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        variant="ghost"
                        className="text-red-500 hover:bg-zinc-800"
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
};

export default PaginatedGrid;