'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { CampaignModal } from '@/components/campaigns/CampaignModal';
import { Modal } from '@/components/ui/Modal';
import Image from 'next/image';

// Types
type ContentType = 'ALL' | 'ACTIVE' | 'INACTIVE';

interface Station {
  id: string;
  name: string;
}

interface Campaign {
  id: string;
  title: string;
  age_min: number;
  age_max: number;
  gender: 'all' | 'male' | 'female';
  location: string;
  radius: number;
  target_reach: number;
  allow_skip: boolean;
  cover_art: string | null;
  media_url: string;
  intro_point: number;
  vocal_point: number;
  aux_point: number;
  station: string;
}

export default function CampaignsPage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStation, setSelectedStation] = useState<string>('');
  const [selectedType, setSelectedType] = useState<ContentType>('ALL');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  const loadCampaigns = useCallback(async () => {
    if (!selectedStation) return;
    
    try {
      const response = await fetchWithAuth(`/api/v3/campaigns/?station=${selectedStation}`);
      const data = await response.json();
      setCampaigns(data);
    } catch (error) {
      console.error('Error loading campaigns:', error);
      toast.error('Failed to load campaigns');
    }
  }, [selectedStation]);

  useEffect(() => {
    loadStations();
  }, []);

  useEffect(() => {
    if (selectedStation) {
      loadCampaigns();
    }
  }, [selectedStation, loadCampaigns]);

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

  const handleDelete = async () => {
    if (!selectedCampaign) return;

    try {
      await fetchWithAuth(`/api/v3/campaigns/${selectedCampaign.id}/`, {
        method: 'DELETE',
      });
      toast.success('Campaign deleted successfully');
      loadCampaigns();
      setIsDeleteModalOpen(false);
      setSelectedCampaign(null);
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast.error('Failed to delete campaign');
    }
  };

  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* Header with Title and Add Button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Ad Campaigns</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#7ac5be] hover:bg-[#68b1aa] text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Campaign
        </button>
      </div>

      {/* Controls Row */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Station Selector */}
        <div className="w-full md:w-64">
          <select
            value={selectedStation}
            onChange={(e) => setSelectedStation(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7ac5be]"
          >
            <option value="">All Stations</option>
            {stations.map((station) => (
              <option key={station.id} value={station.id}>
                {station.name}
              </option>
            ))}
          </select>
        </div>

        {/* Content Type Selector */}
        <div className="flex rounded-lg border border-gray-200 p-1 gap-1">
          {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`
                px-4 py-1 rounded-md text-sm font-medium transition-colors
                ${selectedType === type
                  ? 'bg-[#7ac5be] text-white'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              {type.charAt(0) + type.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7ac5be]"
          />
        </div>
      </div>

      {/* Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCampaigns.map((campaign) => (
          <div
            key={campaign.id}
            className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Cover Art */}
            <div className="relative h-48 bg-gray-100">
              {campaign.cover_art ? (
                <Image
                  src={campaign.cover_art}
                  alt={campaign.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <span className="text-gray-400">No Cover Art</span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="font-semibold mb-2">{campaign.title}</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p>Age: {campaign.age_min}-{campaign.age_max}</p>
                <p>Gender: {campaign.gender}</p>
                <p>Location: {campaign.location} ({campaign.radius}km)</p>
                <p>Reach: {campaign.target_reach === -1 ? 'Unlimited' : campaign.target_reach}</p>
              </div>

              {/* Actions */}
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => {
                    setSelectedCampaign(campaign);
                  }}
                  className="p-2 text-[#7ac5be] hover:bg-[#7ac5be] hover:text-white rounded-full transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setSelectedCampaign(campaign);
                    setIsDeleteModalOpen(true);
                  }}
                  className="p-2 text-red-600 hover:bg-red-600 hover:text-white rounded-full transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Campaign Modal */}
      <CampaignModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        stationId={selectedStation}
        onSuccess={loadCampaigns}
      />

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedCampaign(null);
        }}
        title="Delete Campaign"
      >
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Are you sure you want to delete this campaign? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setIsDeleteModalOpen(false);
                setSelectedCampaign(null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
} 