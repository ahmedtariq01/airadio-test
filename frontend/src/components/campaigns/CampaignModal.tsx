'use client';

import { useState, useRef } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import dynamic from 'next/dynamic';
import Image from 'next/image';

// Dynamic import for AudioWaveform
const AudioWaveform = dynamic(
  () => import('../library/AudioWaveform'),
  { ssr: false }
);

interface CampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign?: {
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
  } | null;
  stationId: string;
  onSuccess: () => void;
}

export function CampaignModal({ isOpen, onClose, campaign, stationId, onSuccess }: CampaignModalProps) {
  const [formData, setFormData] = useState({
    title: campaign?.title || '',
    age_min: campaign?.age_min || 0,
    age_max: campaign?.age_max || 100,
    gender: campaign?.gender || 'all',
    location: campaign?.location || '',
    radius: campaign?.radius || 10,
    target_reach: campaign?.target_reach || 1000,
    allow_skip: campaign?.allow_skip || false,
  });

  const [coverArt, setCoverArt] = useState<string | null>(campaign?.cover_art || null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [markers, setMarkers] = useState({
    in: campaign?.intro_point || 0,
    vox: campaign?.vocal_point || 0,
    aux: campaign?.aux_point || 0
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, String(value));
      });

      // Add station ID
      formDataToSend.append('station', stationId);

      // Add markers
      formDataToSend.append('markers', JSON.stringify(markers));

      // Add files if present
      if (audioFile) {
        formDataToSend.append('audio', audioFile);
      }

      if (coverArt && coverArt.startsWith('data:')) {
        const response = await fetch(coverArt);
        const blob = await response.blob();
        formDataToSend.append('cover_art', blob, 'cover.jpg');
      }

      const url = campaign
        ? `/api/v3/campaigns/${campaign.id}/`
        : '/api/v3/campaigns/';
      
      const method = campaign ? 'PATCH' : 'POST';

      await fetchWithAuth(url, {
        method,
        body: formDataToSend,
      });

      toast.success(`Campaign ${campaign ? 'updated' : 'created'} successfully`);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving campaign:', error);
      toast.error('Failed to save campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={campaign ? 'Edit Campaign' : 'Add Campaign'}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            required
          />
        </div>

        {/* Age Range Slider */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Age Range: {formData.age_min} - {formData.age_max}
          </label>
          <div className="flex gap-4">
            <input
              type="range"
              min="0"
              max="50"
              value={formData.age_min}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                age_min: Math.min(Number(e.target.value), prev.age_max - 1)
              }))}
              className="w-full"
            />
            <input
              type="range"
              min="0"
              max="100"
              value={formData.age_max}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                age_max: Math.max(Number(e.target.value), prev.age_min + 1)
              }))}
              className="w-full"
            />
          </div>
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Gender
          </label>
          <select
            value={formData.gender}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              gender: e.target.value as 'all' | 'male' | 'female'
            }))}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          >
            <option value="all">All</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Location
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            required
          />
        </div>

        {/* Radius Slider */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Radius: {formData.radius === -1 ? 'Unlimited' : `${formData.radius}km`}
          </label>
          <input
            type="range"
            min="-1"
            max="100"
            value={formData.radius}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              radius: Number(e.target.value)
            }))}
            className="w-full"
          />
        </div>

        {/* Target Reach Slider */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Target Reach: {formData.target_reach === -1 ? 'Unlimited' : formData.target_reach}
          </label>
          <input
            type="range"
            min="-1"
            max="10000"
            step="1000"
            value={formData.target_reach}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              target_reach: Number(e.target.value)
            }))}
            className="w-full"
          />
        </div>

        {/* Allow Skip */}
        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.allow_skip}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                allow_skip: e.target.checked
              }))}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Allow Skip</span>
          </label>
        </div>

        {/* Cover Art */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Cover Art
          </label>
          <div className="mt-1 flex items-center gap-4">
            {coverArt ? (
              <div className="relative w-32 h-32">
                <Image
                  src={coverArt}
                  alt="Cover Art"
                  width={128}
                  height={128}
                  className="object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setCoverArt(null)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gray-400"
              >
                <Upload className="w-6 h-6 text-gray-400" />
              </button>
            )}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    setCoverArt(e.target?.result as string);
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
          </div>
        </div>

        {/* Audio Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Audio File
          </label>
          <div className="mt-1">
            <button
              type="button"
              onClick={() => audioInputRef.current?.click()}
              className="px-4 py-2 border border-gray-300 rounded-md"
            >
              {audioFile ? 'Change Audio' : 'Upload Audio'}
            </button>
            <input
              type="file"
              ref={audioInputRef}
              className="hidden"
              accept="audio/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setAudioFile(file);
              }}
            />
            {audioFile && (
              <p className="mt-2 text-sm text-gray-500">
                Selected: {audioFile.name}
              </p>
            )}
          </div>
        </div>

        {/* Audio Waveform */}
        {audioFile && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Audio Waveform
            </label>
            <AudioWaveform
              audioFile={audioFile}
              markers={markers}
              onMarkersChange={setMarkers}
            />
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-[#7ac5be] hover:bg-[#68b1aa] text-white rounded-md disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : (campaign ? 'Save Changes' : 'Add Campaign')}
          </button>
        </div>
      </form>
    </Modal>
  );
} 