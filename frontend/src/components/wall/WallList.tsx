'use client';

import { useEffect, useState } from "react";
import Image from "next/image";
import type { Wall } from "@/types/wall";

export function WallList() {
  const [items, setItems] = useState<Wall[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/v3/wall/')
      .then(res => res.json())
      .then(data => {
        if (data.result?.soundwall) {
          setItems(data.result.soundwall);
        }
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <div 
          key={item.id}
          className="rounded-lg shadow overflow-hidden"
          style={{
            backgroundColor: item.ui_color_background,
            color: item.ui_color_foreground
          }}
        >
          {item.cover_art && (
            <Image 
              src={item.cover_art} 
              alt={item.title}
              width={400}
              height={200}
              className="w-full h-48 object-cover"
            />
          )}
          <div className="p-4">
            <h3 className="font-bold text-lg">{item.title}</h3>
            <p className="text-sm">{item.artist}</p>
            <div className="mt-4 flex justify-between items-center">
              <span className="text-sm">
                {item.studio_only ? 'Studio Only' : 'Public'}
              </span>
              <span className="text-sm">
                Rating: {item.rating}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 