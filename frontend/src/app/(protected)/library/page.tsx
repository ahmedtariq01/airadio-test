'use client';

import { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import dynamic from 'next/dynamic';
import Cookies from 'js-cookie';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { toast } from 'sonner';
import { MediaTable } from '@/components/mediaTable';
import { DragDropContext } from '@hello-pangea/dnd';

const AddMediaModal = dynamic(
  () =>
    import('@/components/library/AddMediaModal').then(
      (mod) => mod.AddMediaModal
    ),
  { ssr: false }
);

const CONTENT_TYPES = [
  'SONGS',
  'ADVERTS',
  'PODCASTS',
  'NEWS',
  'VOICE',
  'IDS',
] as const;
type ContentType = (typeof CONTENT_TYPES)[number];

export default function LibraryPage() {
  const [selectedContentType, setSelectedContentType] =
    useState<ContentType>('SONGS');
  const [selectedStation, setSelectedStation] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [listData, setListData] = useState([]);
  const [signleSong, setSingleSong] = useState({});
  const [filteredStationsData, setFilteredStationsData] = useState([]);
  const [stations, setStations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFilterDataLoading, setIsFilterDataLoading] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [playingAudioMain, setPlayingAudioMain] = useState<string | null>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const url = new URL('/api/v3/libraryview', apiUrl);
  const token = Cookies.get('token');

  const loadStations = async () => {
    try {
      const response = await fetchWithAuth('/api/v3/stations/');
      const data = await response.json();
      setStations(data);
      if (data.length > 0) {
        setSelectedStation(data[0].id);
      }
    } catch (error) {
      toast.error('Failed to load stations');
    }
  };

  const getSongById = async (id: string) => {
    try {
      const response = await fetchWithAuth(`/api/v3/libraryview/${id}`);
      const data = await response.json();
      setSingleSong(data);
      if (data.length > 0) {
        setSelectedStation(data[0].id);
      }
    } catch (error) {
      toast.error('Failed to load stations');
    }
  };
  const getFilteredStationsData = async () => {
    try {
      setIsFilterDataLoading(true);
      const response = await fetchWithAuth(
        `/api/v3/playlist-items/songs_by_station/?station_id=${selectedStation}`
      );
      const data = await response.json();
      setFilteredStationsData(data);
    } catch (error) {
      toast.error('Failed to Load Data');
    } finally {
      setIsFilterDataLoading(false);
    }
  };
  const fetchData = async () => {
    setIsLoading(true);
    if (!apiUrl) {
      throw new Error('API URL not configured');
    }

    if (!token) {
      throw new Error('No authentication token found');
    }
    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response?.json();
        setListData(data || []);
      }
      if (!response.ok) {
        throw new Error('Failed to upload audio file');
      }
    } catch (error) {
      toast.error('Failed to load data' + error?.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    loadStations();
  }, []);

  useEffect(() => {
    if (selectedStation) {
      getFilteredStationsData();
    }
  }, [selectedStation]);

  const handleAudioPlayPause = (
    audioUrl: string,
    playingAudio: string | null,
    setPlayingAudio: (url: string | null) => void
  ) => {
    const audioElement = document.getElementById(audioUrl) as HTMLAudioElement;

    if (!audioElement) return;

    if (playingAudio === audioUrl) {
      audioElement.pause();
      setPlayingAudio(null);
    } else {
      if (playingAudio) {
        const previousAudio = document.getElementById(
          playingAudio
        ) as HTMLAudioElement;
        if (previousAudio) previousAudio.pause();
      }
      audioElement.currentTime = 0;
      audioElement.play();
      setPlayingAudio(audioUrl);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`${apiUrl}/api/v3/libraryview/${id}/`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete item.');
      }
      setListData((prevData) => prevData.filter((item) => item.id !== id));
    } catch (error) {
      toast.error('Error deleting item');
    }
  };

  const handleDeleteLibrary = async (id: string) => {
    try {
      const response = await fetch(`${apiUrl}/api/v3/playlist-items/${id}/`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete item.');
      }
      setFilteredStationsData((prevData) =>
        prevData.filter((item) => item.id !== id)
      );
    } catch (error) {
      toast.error('Error deleting item' + error?.message);
    }
  };

  const handleDragEnd = async (result: any) => {
    const { source, destination } = result;

    if (!destination) return;

    if (
      source.droppableId === 'library' &&
      destination.droppableId === 'station'
    ) {
      try {
        const itemId = result.draggableId.replace(/^.*?-/, '');
        setListData((prevList) =>
          prevList.filter((item) => item?.id !== itemId)
        );
        const addedItem = listData?.find((item) => item?.id === itemId);

        if (addedItem) {
          setFilteredStationsData((prevFiltered) => [
            ...prevFiltered,
            addedItem,
          ]);
        }
        const response = await fetchWithAuth(`/api/v3/playlist-items/`, {
          method: 'POST',
          body: JSON.stringify({
            station_id: selectedStation,
            library_item: itemId,
          }),
        });

        if (response.ok) {
          toast.success('Added to station successfully');
        } else {
          toast.error('Failed to add to drop item');
        }
      } catch (error) {
        toast.error('Failed to add to station');
      }
    }
  };
  const handleEditLibrary = (id: string) => {
    getSongById(id);
    setIsAddModalOpen(true);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className='h-[calc(100vh-theme(spacing.20))] flex flex-col'>
        <div className='flex-1 flex flex-col lg:flex-row gap-4 p-4 overflow-hidden'>
          <div className='flex-1 min-w-0 lg:max-w-[65%] bg-white dark:bg-gray-800 rounded-lg shadow'>
            <div className='flex flex-col h-full'>
              <div className='p-4 border-b border-gray-200 dark:border-gray-700'>
                <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
                  Station Content
                </h2>
              </div>

              <div className='p-4 border-b border-gray-200 dark:border-gray-700 space-y-4'>
                <select
                  value={selectedStation}
                  onChange={(e) => setSelectedStation(e.target.value)}
                  className='mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 py-2 px-3 shadow-sm focus:border-[#7ac5be] focus:outline-none focus:ring-1 focus:ring-[#7ac5be] dark:bg-gray-700'
                >
                  {stations?.map((station) => (
                    <option key={station?.id} value={station?.id}>
                      {station?.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className='p-4 border-b border-gray-200 dark:border-gray-700'>
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                  <input
                    type='text'
                    placeholder='Search station content...'
                    className='w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                  />
                </div>
              </div>

              <div className='flex-1 overflow-auto p-4 '>
                <MediaTable
                  droppableId='station'
                  items={filteredStationsData}
                  isLoading={isFilterDataLoading}
                  playingAudio={playingAudioMain}
                  setPlayingAudio={setPlayingAudioMain}
                  handleDelete={handleDeleteLibrary}
                  handleAudioPlayPause={handleAudioPlayPause}
                />
              </div>
            </div>
          </div>

          <div className='w-full lg:w-[35%] bg-white dark:bg-gray-800 rounded-lg shadow'>
            <div className='flex flex-col h-full'>
              <div className='p-4 border-b border-gray-200 dark:border-gray-700 space-y-4'>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className='w-full bg-[#7ac5be] hover:bg-[#68b1aa] text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2'
                >
                  <Plus className='h-4 w-4' />
                  Add New Audio
                </button>

                <div className='flex flex-wrap bg-gray-100 dark:bg-gray-700 rounded-lg p-1'>
                  {CONTENT_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedContentType(type)}
                      className={`flex-1 min-w-[100px] px-3 py-1.5 text-sm font-medium rounded-md ${
                        selectedContentType === type
                          ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                  <input
                    type='text'
                    placeholder='Search library...'
                    className='w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                  />
                </div>
              </div>

              <div className='flex-1 overflow-auto p-4'>
                <MediaTable
                  droppableId='library'
                  items={listData}
                  isLoading={isLoading}
                  playingAudio={playingAudio}
                  setPlayingAudio={setPlayingAudio}
                  handleDelete={handleDelete}
                  handleAudioPlayPause={handleAudioPlayPause}
                  handleEditLibrary={handleEditLibrary}
                />
              </div>
            </div>
          </div>
        </div>

        <AddMediaModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          signleSong={signleSong}
        />
      </div>
    </DragDropContext>
  );
}