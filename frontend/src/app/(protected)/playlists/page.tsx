'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Play, Mic, X, Download } from 'lucide-react';
import { toast } from 'sonner';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import dynamic from 'next/dynamic';

// Dynamic imports
const AddFromLibraryModal = dynamic(
  () => import('@/components/playlists/AddFromLibraryModal'),
  { ssr: false }
);

const DragDropContext = dynamic(
  () => import('react-beautiful-dnd').then(mod => mod.DragDropContext),
  { ssr: false }
);

const Droppable = dynamic(
  () => import('react-beautiful-dnd').then(mod => mod.Droppable),
  { ssr: false }
);

const Draggable = dynamic(
  () => import('react-beautiful-dnd').then(mod => mod.Draggable),
  { ssr: false }
);

interface Station {
  id: string;
  name: string;
}

interface PlaylistItem {
  id: string;
  title: string;
  artist: string;
  is_voice_track: boolean;
  order: number;
}

export default function PlaylistsPage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStation, setSelectedStation] = useState<string>('');
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const loadPlaylist = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetchWithAuth(`/api/v3/playlists/${selectedStation}/`);
      const data = await response.json();
      setPlaylist(data);
    } catch (error) {
      console.error('Error loading playlist:', error);
      toast.error('Failed to load playlist');
    } finally {
      setIsLoading(false);
    }
  }, [selectedStation]);

  useEffect(() => {
    loadStations();
  }, []);

  useEffect(() => {
    if (selectedStation) {
      loadPlaylist();
    }
  }, [selectedStation, loadPlaylist]);

  const loadStations = async () => {
    try {
      const response = await fetchWithAuth('/api/v3/stations/');
      const data = await response.json();
      setStations(data);
      if (data.length > 0) {
        setSelectedStation(data[0].id);
      }
    } catch (error) {
      console.error('Error loading stations:', error);
      toast.error('Failed to load stations');
    }
  };

  const handleDragEnd = async (result: {
    destination?: { index: number };
    source: { index: number };
  }) => {
    if (!result.destination) return;

    const items = Array.from(playlist);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order property
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index,
    }));

    setPlaylist(updatedItems);

    try {
      await fetchWithAuth(`/api/v3/playlists/${selectedStation}/reorder/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: updatedItems }),
      });
    } catch (error) {
      console.error('Error reordering playlist:', error);
      toast.error('Failed to reorder playlist');
      loadPlaylist(); // Reload the original order
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await fetchWithAuth(`/api/v3/playlists/${selectedStation}/items/${itemId}/`, {
        method: 'DELETE',
      });
      toast.success('Item removed from playlist');
      loadPlaylist();
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item');
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetchWithAuth(`/api/v3/playlists/${selectedStation}/export/`, {
        method: 'POST',
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `playlist-${selectedStation}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting playlist:', error);
      toast.error('Failed to export playlist');
    }
  };

  const handleSave = async () => {
    try {
      await fetchWithAuth(`/api/v3/playlists/${selectedStation}/save/`, {
        method: 'POST',
      });
      toast.success('Playlist saved successfully');
    } catch (error) {
      console.error('Error saving playlist:', error);
      toast.error('Failed to save playlist');
    }
  };

  // Add filtered playlist
  const filteredPlaylist = playlist.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Playlists</h1>
        </div>

        {/* Controls Card */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg divide-y divide-gray-200 dark:divide-gray-700">
          {/* Controls Section */}
          <div className="p-6">
            <div className="space-y-4">
              {/* Station and Date Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Station Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    SELECT STATION
                  </label>
                  <select
                    value={selectedStation}
                    onChange={(e) => setSelectedStation(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 py-2 px-3 shadow-sm focus:border-[#7ac5be] focus:outline-none focus:ring-1 focus:ring-[#7ac5be] dark:bg-gray-700"
                  >
                    {stations.map((station) => (
                      <option key={station.id} value={station.id}>
                        {station.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    SELECT DATE
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 py-2 px-3 shadow-sm focus:border-[#7ac5be] focus:outline-none focus:ring-1 focus:ring-[#7ac5be] dark:bg-gray-700"
                  />
                </div>
              </div>

              {/* Actions Row */}
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                {/* Add from Library Button */}
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="w-full md:w-auto px-4 py-2 bg-[#7ac5be] hover:bg-[#68b1aa] text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7ac5be] focus:ring-offset-2 flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add from Library
                </button>

                {/* Search */}
                <div className="w-full md:w-96 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search playlist..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-[#7ac5be] focus:outline-none focus:ring-1 focus:ring-[#7ac5be] dark:bg-gray-700"
                  />
                </div>

                {/* Export and Save Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={handleExport}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-[#7ac5be] focus:ring-offset-2"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-[#7ac5be] hover:bg-[#68b1aa] text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7ac5be] focus:ring-offset-2"
                  >
                    Save Playlist
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Playlist Table Section */}
          <div className="p-6">
            <div className="overflow-x-auto">
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="playlist">
                  {(provided) => (
                    <table className="w-full" {...provided.droppableProps} ref={provided.innerRef}>
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="w-12"></th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Artist
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Title
                          </th>
                          <th className="w-12"></th>
                          <th className="w-12"></th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {isLoading ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                              Loading...
                            </td>
                          </tr>
                        ) : filteredPlaylist.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                              No items found
                            </td>
                          </tr>
                        ) : (
                          filteredPlaylist.map((item, index) => (
                            <Draggable key={item.id} draggableId={item.id} index={index}>
                              {(provided) => (
                                <tr
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
                                    activeItemId === item.id ? 'bg-gray-100 dark:bg-gray-600' : ''
                                  }`}
                                >
                                  <td className="px-6 py-4">
                                    <Play 
                                      className={`w-4 h-4 ${
                                        activeItemId === item.id ? 'text-[#7ac5be]' : 'text-gray-400'
                                      }`}
                                      onClick={() => setActiveItemId(item.id)}
                                    />
                                  </td>
                                  <td className="px-6 py-4">{item.artist}</td>
                                  <td className="px-6 py-4">{item.title}</td>
                                  <td className="px-6 py-4">
                                    {item.is_voice_track && (
                                      <Mic className="w-4 h-4 text-gray-400" />
                                    )}
                                  </td>
                                  <td className="px-6 py-4">
                                    <button
                                      onClick={() => handleRemoveItem(item.id)}
                                      className="text-red-600 hover:text-red-800"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </td>
                                </tr>
                              )}
                            </Draggable>
                          ))
                        )}
                        {provided.placeholder}
                      </tbody>
                    </table>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          </div>
        </div>
      </div>

      <AddFromLibraryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        stationId={selectedStation}
        onAdd={loadPlaylist}
      />
    </div>
  );
} 