'use client';

import { useState, useRef } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import Image from 'next/image';

interface PodcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  podcast?: {
    id: string;
    title: string;
    description: string;
    cover_art: string | null;
    published_at: string;
  } | null;
  onSuccess: () => void;
}

export function PodcastModal({ isOpen, onClose, podcast, onSuccess }: PodcastModalProps) {
  const [formData, setFormData] = useState({
    title: podcast?.title || '',
    description: podcast?.description || '',
    published_at: podcast?.published_at 
      ? new Date(podcast.published_at).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  });
  const [coverArt, setCoverArt] = useState<string | null>(podcast?.cover_art || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('published_at', formData.published_at);

      if (coverArt && coverArt.startsWith('data:')) {
        const response = await fetch(coverArt);
        const blob = await response.blob();
        formDataToSend.append('cover_art', blob, 'cover.jpg');
      }

      const url = podcast
        ? `/api/v3/podcasts/${podcast.id}/`
        : '/api/v3/podcasts/';
      
      const method = podcast ? 'PATCH' : 'POST';

      await fetchWithAuth(url, {
        method,
        body: formDataToSend,
      });

      toast.success(`Podcast ${podcast ? 'updated' : 'created'} successfully`);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving podcast:', error);
      toast.error('Failed to save podcast');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={podcast ? 'Edit Podcast' : 'Add Podcast'}
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

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            rows={4}
            required
          />
        </div>

        {/* Published Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Published Date
          </label>
          <input
            type="date"
            value={formData.published_at}
            onChange={(e) => setFormData(prev => ({ ...prev, published_at: e.target.value }))}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            required
          />
        </div>

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
            {isSubmitting ? 'Saving...' : (podcast ? 'Save Changes' : 'Add Podcast')}
          </button>
        </div>
      </form>
    </Modal>
  );
} 