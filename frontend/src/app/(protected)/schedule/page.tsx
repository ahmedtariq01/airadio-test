'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { Star } from 'lucide-react';

interface Station {
  id: string;
  name: string;
}

interface ScheduleSettings {
  station_id: string;
  id_frequency: number;
  spot_break_frequency: number;
  spot_break_length: number;
  rotation_five_star: number;
  rotation_four_star: number;
  rotation_three_star: number;
  rotation_two_star: number;
  rotation_one_star: number;
  separate_genres: boolean;
  news_url: string;
  schedule_news: boolean;
}

export default function SchedulePage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [formData, setFormData] = useState<ScheduleSettings>({
    station_id: '',
    id_frequency: 10,
    spot_break_frequency: 6,
    spot_break_length: 4,
    rotation_five_star: 1,
    rotation_four_star: 2,
    rotation_three_star: 3,
    rotation_two_star: 4,
    rotation_one_star: 5,
    separate_genres: true,
    news_url: '',
    schedule_news: false,
  });

  const loadStations = useCallback(async () => {
    try {
      const response = await fetchWithAuth('/api/v3/stations/');
      const data = await response.json();
      setStations(data);
      if (data.length > 0) {
        setFormData(prev => ({ ...prev, station_id: data[0].id }));
        loadScheduleSettings(data[0].id);
      }
    } catch (error) {
      console.error('Error loading stations:', error);
      toast.error('Failed to load stations');
    }
  }, []);

  useEffect(() => {
    loadStations();
  }, [loadStations]);

  const loadScheduleSettings = async (stationId: string) => {
    try {
      const response = await fetchWithAuth(`/api/v3/schedule-settings/${stationId}/`);
      const data = await response.json();
      setFormData(data);
    } catch (error) {
      console.error('Error loading schedule settings:', error);
      toast.error('Failed to load schedule settings');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchWithAuth(`/api/v3/schedule-settings/${formData.station_id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      toast.success('Schedule settings saved successfully');
    } catch (error) {
      console.error('Error saving schedule settings:', error);
      toast.error('Failed to save schedule settings');
    }
  };

  const renderStars = (count: number) => {
    return Array(count)
      .fill(0)
      .map((_, index) => (
        <Star
          key={index}
          className="w-4 h-4 fill-current text-[#7ac5be]"
        />
      ));
  };

  return (
    <div className="p-6">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8">Schedule Settings</h1>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow-sm rounded-lg divide-y divide-gray-200 dark:divide-gray-700">
          {/* Station Selection Section */}
          <div className="p-6">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                SELECT STATION
              </label>
              <select
                value={formData.station_id}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, station_id: e.target.value }));
                  loadScheduleSettings(e.target.value);
                }}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 py-2 px-3 shadow-sm focus:border-[#7ac5be] focus:outline-none focus:ring-1 focus:ring-[#7ac5be] dark:bg-gray-700"
              >
                {stations.map((station) => (
                  <option key={station.id} value={station.id}>
                    {station.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ID and Spot Break Settings */}
          <div className="p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-3 items-center gap-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  INSERT ID EVERY
                </label>
                <div className="col-span-2 flex items-center gap-2">
                  <input
                    type="number"
                    value={formData.id_frequency}
                    onChange={(e) => setFormData(prev => ({ ...prev, id_frequency: parseInt(e.target.value) }))}
                    className="block w-20 rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-[#7ac5be] focus:ring-1 focus:ring-[#7ac5be] dark:bg-gray-700"
                    min="1"
                  />
                  <span className="text-sm text-gray-500 dark:text-gray-400">songs</span>
                </div>
              </div>

              <div className="grid grid-cols-3 items-center gap-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  INSERT SPOT BREAK
                </label>
                <div className="col-span-2 flex items-center gap-2">
                  <input
                    type="number"
                    value={formData.spot_break_frequency}
                    onChange={(e) => setFormData(prev => ({ ...prev, spot_break_frequency: parseInt(e.target.value) }))}
                    className="block w-20 rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-[#7ac5be] focus:ring-1 focus:ring-[#7ac5be] dark:bg-gray-700"
                    min="1"
                  />
                  <span className="text-sm text-gray-500 dark:text-gray-400">songs</span>
                </div>
              </div>

              <div className="grid grid-cols-3 items-center gap-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  SPOT BREAK LENGTH
                </label>
                <div className="col-span-2 flex items-center gap-2">
                  <input
                    type="number"
                    value={formData.spot_break_length}
                    onChange={(e) => setFormData(prev => ({ ...prev, spot_break_length: parseInt(e.target.value) }))}
                    className="block w-20 rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-[#7ac5be] focus:ring-1 focus:ring-[#7ac5be] dark:bg-gray-700"
                    min="1"
                  />
                  <span className="text-sm text-gray-500 dark:text-gray-400">items</span>
                </div>
              </div>
            </div>
          </div>

          {/* Music Rotation Section */}
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">MUSIC ROTATION</h2>
            <div className="space-y-4">
              {[
                { stars: 5, key: 'rotation_five_star' },
                { stars: 4, key: 'rotation_four_star' },
                { stars: 3, key: 'rotation_three_star' },
                { stars: 2, key: 'rotation_two_star' },
                { stars: 1, key: 'rotation_one_star' },
              ].map(({ stars, key }) => (
                <div key={key} className="grid grid-cols-3 items-center gap-4">
                  <div className="flex items-center gap-0.5">
                    {renderStars(stars)}
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    <input
                      type="number"
                      value={formData[key as keyof typeof formData]}
                      onChange={(e) => setFormData(prev => ({ ...prev, [key]: parseInt(e.target.value) }))}
                      className="block w-20 rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-[#7ac5be] focus:ring-1 focus:ring-[#7ac5be] dark:bg-gray-700"
                      min="0"
                    />
                    <span className="text-sm text-gray-500 dark:text-gray-400">songs</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* News Settings Section */}
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  NEWS URL
                </label>
                <input
                  type="url"
                  value={formData.news_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, news_url: e.target.value }))}
                  placeholder="https://example.com/news-feed"
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 py-2 px-3 shadow-sm focus:border-[#7ac5be] focus:outline-none focus:ring-1 focus:ring-[#7ac5be] dark:bg-gray-700"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="schedule_news"
                  checked={formData.schedule_news}
                  onChange={(e) => setFormData(prev => ({ ...prev, schedule_news: e.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300 text-[#7ac5be] focus:ring-[#7ac5be] dark:border-gray-600"
                />
                <label htmlFor="schedule_news" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  SCHEDULE NEWS AT TOP OF HOUR
                </label>
              </div>
            </div>
          </div>

          {/* Genre Separation Section */}
          <div className="p-6">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="separate_genres"
                checked={formData.separate_genres}
                onChange={(e) => setFormData(prev => ({ ...prev, separate_genres: e.target.checked }))}
                className="h-4 w-4 rounded border-gray-300 text-[#7ac5be] focus:ring-[#7ac5be] dark:border-gray-600"
              />
              <label htmlFor="separate_genres" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                SEPARATE SAME GENRES
              </label>
            </div>
          </div>

          {/* Submit Button Section */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 rounded-b-lg">
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 bg-[#7ac5be] hover:bg-[#68b1aa] text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7ac5be] focus:ring-offset-2"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 