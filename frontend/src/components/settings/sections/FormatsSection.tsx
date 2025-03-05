'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { toast } from 'sonner';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

interface Format {
  id: string;
  name: string;
  description: string;
  color: string;
}

interface FormData {
  name: string;
  description: string;
  color: string;
}

export default function FormatsSection() {
  const [formats, setFormats] = useState<Format[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<Format | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    color: '#7ac5be'
  });

  useEffect(() => {
    loadFormats();
  }, []);

  const loadFormats = async () => {
    try {
      setIsLoading(true);
      const response = await fetchWithAuth('/api/v3/formats/');
      const data = await response.json();
      setFormats(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to load formats');
      setFormats([]);
    }finally{
      setIsLoading(false)
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = selectedFormat 
        ? `/api/v3/formats/${selectedFormat.id}/`
        : '/api/v3/formats/';
      
      const method = selectedFormat ? 'PATCH' : 'POST';
      
      await fetchWithAuth(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      toast.success(`Format ${selectedFormat ? 'updated' : 'created'} successfully`);
      loadFormats();
      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
      setFormData({ name: '', description: '', color: '#7ac5be' });
    } catch (error) {
      console.error('Error saving format:', error);
      toast.error('Failed to save format');
    }
  };

  const handleDelete = async () => {
    if (!selectedFormat) return;

    try {
      await fetchWithAuth(`/api/v3/formats/${selectedFormat.id}/`, {
        method: 'DELETE',
      });

      toast.success('Format deleted successfully');
      loadFormats();
      setIsDeleteModalOpen(false);
    } catch (error) {
      toast.error('Failed to delete format');
    }
  };

  if (isLoading) {
    return (
      <div className='p-6 flex justify-center items-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-[#7ac5be]'></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Formats</h2>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-[#7ac5be] hover:bg-[#68b1aa] text-white rounded-lg
            inline-flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Format
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {formats.map((format) => (
          <div
            key={format.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: format.color }}
                />
                <h3 className="font-medium">{format.name}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedFormat(format);
                    setFormData({
                      name: format.name,
                      description: format.description,
                      color: format.color,
                    });
                    setIsEditModalOpen(true);
                  }}
                  className="p-1 text-gray-500 hover:text-gray-700"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setSelectedFormat(format);
                    setIsDeleteModalOpen(true);
                  }}
                  className="p-1 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            {format.description && (
              <p className="text-sm text-gray-500">{format.description}</p>
            )}
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
          setSelectedFormat(null);
          setFormData({ name: '', description: '', color: '#7ac5be' });
        }}
        title={`${isEditModalOpen ? 'Edit' : 'Add'} Format`}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#7ac5be] focus:ring-[#7ac5be]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#7ac5be] focus:ring-[#7ac5be]"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Color</label>
            <input
              type="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="w-full"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
                setSelectedFormat(null);
                setFormData({ name: '', description: '', color: '#7ac5be' });
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#7ac5be] hover:bg-[#68b1aa] text-white rounded-md"
            >
              {isEditModalOpen ? 'Save Changes' : 'Add Format'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Format"
      >
        <div className="space-y-4">
          <p>Are you sure you want to delete this format? This action cannot be undone.</p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
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