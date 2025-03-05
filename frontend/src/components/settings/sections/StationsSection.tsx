'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { Modal } from '@/components/ui/Modal';
import { toast } from 'sonner';
import {
  getStations,
  createStation,
  updateStation,
  deleteStation,
} from '@/lib/api/stations';
import type { Station, StationFormData } from '@/lib/api/stations';

const LOCATIONS = [
  'Finland/Helsinki',
  'Finland/Tampere',
  'Finland/Turku',
  'Sweden/Stockholm',
  'Sweden/Gothenburg',
  // Add more locations as needed
];

export default function StationsSection() {
  const [stations, setStations] = useState<Station[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [formData, setFormData] = useState<StationFormData>({
    name: '',
    logo_url: null,
    is_retail: false,
    retail: '',
    is_streaming: false,
    stream_url: '',
    location: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  // Load stations on component mount
 

  const loadStations = async () => {
    try {
      setIsLoading(true);
      const data = await getStations();
      setStations(data);
    } catch (error) {
      toast.error('Failed to load stations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStations();
  }, []);
  const handleAddStation = async () => {
    try {
      await createStation(formData);
      toast.success('Station added successfully');
      setIsAddModalOpen(false);
      loadStations();
      // Reset form
      setFormData({
        name: '',
        logo_url: null,
        is_retail: false,
        retail: '',
        is_streaming: false,
        stream_url: '',
        location: '',
      });
    } catch (error) {
      toast.error('Failed to add station');
    }
  };

  const handleEditStation = async () => {
    if (!selectedStation) return;

    try {
      await updateStation(selectedStation.id, formData);
      toast.success('Station updated successfully');
      setIsEditModalOpen(false);
      loadStations();
    } catch (error) {
      toast.error('Failed to update station');
      console.error('Error updating station:', error);
    }
  };

  const handleDeleteStation = async () => {
    if (!selectedStation) return;

    try {
      await deleteStation(selectedStation.id);
      toast.success('Station deleted successfully');
      setIsDeleteModalOpen(false);
      loadStations();
    } catch (error) {
      toast.error('Failed to delete station');
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, logo_url: file }));
  };

  const filteredStations = stations?.filter((station) =>
    station?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  if (isLoading) {
    return (
      <div className='p-6 flex justify-center items-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-[#7ac5be]'></div>
      </div>
    );
  }

  return (
    <div className='p-6'>
      {/* Header */}
      <div className='flex justify-between items-center mb-6'>
        <div className='flex items-center gap-4'>
          <h2 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
            Stations
          </h2>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
            <input
              type='text'
              placeholder='Search stations...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
            />
          </div>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className='px-4 py-2 bg-[#7ac5be] hover:bg-[#68b1aa] text-white rounded-lg
            inline-flex items-center gap-2'
        >
          <Plus className='h-4 w-4' />
          Add Station
        </button>
      </div>

      {/* Stations Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {filteredStations.map((station) => (
          <div
            key={station.id}
            className='bg-white dark:bg-gray-800 rounded-lg shadow-sm border 
              border-gray-200 dark:border-gray-700 p-4'
          >
            <div className='flex items-start justify-between'>
              <div className='flex items-center gap-3'>
                <div className='h-12 w-12 relative'>
                  <Image
                    src={station.logo_url || '/placeholder.png'}
                    alt={station.name}
                    fill
                    className='rounded-lg object-cover'
                  />
                </div>
                <div>
                  <h3 className='font-medium text-gray-900 dark:text-gray-100'>
                    {station.name}
                  </h3>
                  <p className='text-sm text-gray-500 dark:text-gray-400'>
                    {station.location}
                  </p>
                </div>
              </div>
              <div className='flex items-center gap-2'>
                <button
                  onClick={() => {
                    setSelectedStation(station);
                    setFormData({
                      name: station.name,
                      logo_url: null,
                      is_retail: station.is_retail,
                      retail: station.retail,
                      is_streaming: station.is_streaming,
                      stream_url: station.stream_url,
                      location: station.location,
                    });
                    setIsEditModalOpen(true);
                  }}
                  className='p-1 text-gray-400 hover:text-gray-500'
                >
                  <Edit className='h-4 w-4' />
                </button>
                <button
                  onClick={() => {
                    setSelectedStation(station);
                    setIsDeleteModalOpen(true);
                  }}
                  className='p-1 text-gray-400 hover:text-gray-500'
                >
                  <Trash2 className='h-4 w-4' />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Station Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
        }}
        title={isEditModalOpen ? 'Edit Station' : 'Add New Station'}
      >
        <div className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
              Name
            </label>
            <input
              type='text'
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className='mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:border-[#7ac5be] 
                focus:outline-none focus:ring-1 focus:ring-[#7ac5be]'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
              Logo
            </label>
            <input
              type='file'
              accept='image/*'
              onChange={handleLogoChange}
              className='mt-1 block w-full text-sm text-gray-500 dark:text-gray-400
                file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0
                file:text-sm file:font-medium file:bg-[#7ac5be] file:text-white
                hover:file:bg-[#68b1aa]'
            />
          </div>

          <div className='flex items-center gap-4'>
            <div className='flex items-center'>
              <input
                type='checkbox'
                checked={formData.is_retail}
                onChange={(e) =>
                  setFormData({ ...formData, is_retail: e.target.checked })
                }
                className='h-4 w-4 rounded border-gray-300 text-[#7ac5be] focus:ring-[#7ac5be]'
              />
              <label className='ml-2 block text-sm text-gray-900 dark:text-gray-100'>
                Retail
              </label>
            </div>
            {formData.is_retail && (
              <input
                type='text'
                placeholder='Retail Code'
                value={formData.retail}
                onChange={(e) =>
                  setFormData({ ...formData, retail: e.target.value })
                }
                className='block w-full rounded-md border border-gray-300 dark:border-gray-600 
                  bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:border-[#7ac5be] 
                  focus:outline-none focus:ring-1 focus:ring-[#7ac5be]'
              />
            )}
          </div>

          <div className='flex items-center gap-4'>
            <div className='flex items-center'>
              <input
                type='checkbox'
                checked={formData.is_streaming}
                onChange={(e) =>
                  setFormData({ ...formData, is_streaming: e.target.checked })
                }
                className='h-4 w-4 rounded border-gray-300 text-[#7ac5be] focus:ring-[#7ac5be]'
              />
              <label className='ml-2 block text-sm text-gray-900 dark:text-gray-100'>
                Streaming
              </label>
            </div>
            {formData.is_streaming && (
              <input
                type='text'
                placeholder='Stream URL'
                value={formData.stream_url}
                onChange={(e) =>
                  setFormData({ ...formData, stream_url: e.target.value })
                }
                className='block w-full rounded-md border border-gray-300 dark:border-gray-600 
                  bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:border-[#7ac5be] 
                  focus:outline-none focus:ring-1 focus:ring-[#7ac5be]'
              />
            )}
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
              Location
            </label>
            <select
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              className='mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:border-[#7ac5be] 
                focus:outline-none focus:ring-1 focus:ring-[#7ac5be]'
            >
              <option value=''>Select location</option>
              {LOCATIONS.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className='mt-6 flex justify-end gap-3'>
          <button
            onClick={() => {
              setIsAddModalOpen(false);
              setIsEditModalOpen(false);
            }}
            className='px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
              text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 
              dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
              focus:ring-[#7ac5be]'
          >
            Cancel
          </button>
          <button
            onClick={isEditModalOpen ? handleEditStation : handleAddStation}
            className='px-4 py-2 bg-[#7ac5be] hover:bg-[#68b1aa] text-white rounded-md 
              text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 
              focus:ring-[#7ac5be]'
          >
            {isEditModalOpen ? 'Save Changes' : 'Add Station'}
          </button>
        </div>
      </Modal>

      {/* Delete Station Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title='Delete Station'
      >
        <div className='mt-2'>
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            Are you sure you want to delete this station? This action cannot be
            undone.
          </p>
        </div>
        <div className='mt-6 flex justify-end gap-3'>
          <button
            onClick={() => setIsDeleteModalOpen(false)}
            className='px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
              text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 
              dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
              focus:ring-[#7ac5be]'
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteStation}
            className='px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md 
              text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 
              focus:ring-red-500'
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}
