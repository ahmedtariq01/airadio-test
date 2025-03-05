'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Search, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

interface AddFromLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  stationId: string;
  onAdd: () => void;
}

interface LibraryItem {
  id: string;
  title: string;
  artist: string;
  is_voice_track: boolean;
  type: 'SONG' | 'ADVERT' | 'PODCAST' | 'NEWS' | 'VOICE' | 'ID';
}

export default function AddFromLibraryModal({ isOpen, onClose, stationId, onAdd }: AddFromLibraryModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [selectedType, setSelectedType] = useState<string>('ALL');

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query) return;

    try {
      const response = await fetchWithAuth(
        `/api/v3/library/search/?q=${query}${selectedType !== 'ALL' ? `&type=${selectedType}` : ''}`
      );
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error('Error searching library:', error);
      toast.error('Failed to search library');
    }
  };

  const handleAdd = async (itemId: string) => {
    try {
      await fetchWithAuth(`/api/v3/playlists/${stationId}/items/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ item_id: itemId }),
      });
      toast.success('Item added to playlist');
      onAdd();
    } catch (error) {
      console.error('Error adding item to playlist:', error);
      toast.error('Failed to add item');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add from Library"
    >
      <div className="space-y-6">
        {/* Type Filter */}
        <div className="flex gap-2 overflow-x-auto">
          {['ALL', 'SONG', 'ADVERT', 'PODCAST', 'NEWS', 'VOICE', 'ID'].map((type) => (
            <button
              key={type}
              onClick={() => {
                setSelectedType(type);
                if (searchQuery) handleSearch(searchQuery);
              }}
              className={`px-3 py-1 rounded-md text-sm whitespace-nowrap ${
                selectedType === type
                  ? 'bg-[#7ac5be] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {type === 'ALL' ? 'All Types' : type.charAt(0) + type.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search library..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7ac5be]"
          />
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Artist
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{item.artist}</td>
                  <td className="px-6 py-4">{item.title}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleAdd(item.id)}
                      className="text-[#7ac5be] hover:text-[#68b1aa]"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
} 