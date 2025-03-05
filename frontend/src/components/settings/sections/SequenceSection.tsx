'use client';

import { useEffect, useState } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd';
import { GripVertical } from 'lucide-react';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { toast } from 'sonner';

interface Station {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  color: string;
}

interface SequenceItem {
  id: string;
  categoryId: string;
}

export default function SequenceSection() {
  const [selectedStation, setSelectedStation] = useState<string>('');
  const [stations, setStations] = useState([]);
  const [categories] = useState<Category[]>([]);
  const [sequence, setSequence] = useState<SequenceItem[]>([]);
const [isLoading, setIsLoading] = useState(false);
  // Handle drag and drop reordering
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(sequence);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setSequence(items);
  };

  // Add category to sequence
  const handleAddCategory = (categoryId: string) => {
    if (!selectedStation) return;

    setSequence([...sequence, { id: Date.now().toString(), categoryId }]);
  };

  // Remove category from sequence
  const handleRemoveSequenceItem = (itemId: string) => {
    setSequence(sequence.filter((item) => item.id !== itemId));
  };

  const loadStations = async () => {
    try {
      setIsLoading(true)
      const response = await fetchWithAuth('/api/v3/stations/');
      const data = await response.json();
      setStations(data);
      if (data.length > 0) {
        setSelectedStation(data[0].id);
      }
    } catch (error) {
      toast.error('Failed to load stations');
    }finally{
      setIsLoading(false)
    }
  };

  useEffect(() => {
    loadStations();
  }, []);

  if (isLoading) {
    return (
      <div className='p-6 flex justify-center items-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-[#7ac5be]'></div>
      </div>
    );
  }
  return (
    <div className='p-6'>
      <div className='mb-8'>
        <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
          Select Station
        </label>
        <select
          value={selectedStation}
          onChange={(e) => setSelectedStation(e.target.value)}
          className='w-full max-w-xs px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
            bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
        >
          <option value=''>Select a station...</option>
          {stations?.map((station) => (
            <option key={station?.id} value={station?.id}>
              {station?.name}
            </option>
          ))}
        </select>
      </div>

      {selectedStation && (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
          {/* Available Categories */}
          <div>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4'>
              Available Categories
            </h3>
            <div className='space-y-2'>
              {categories.map((category) => (
                <div
                  key={category.id}
                  className='flex items-center justify-between p-3 bg-white dark:bg-gray-800 
                    rounded-lg border border-gray-200 dark:border-gray-700'
                >
                  <div className='flex items-center gap-3'>
                    <div
                      className='w-4 h-4 rounded'
                      style={{ backgroundColor: category.color }}
                    />
                    <span className='text-sm text-gray-900 dark:text-gray-100'>
                      {category.name}
                    </span>
                  </div>
                  <button
                    onClick={() => handleAddCategory(category.id)}
                    className='text-[#7ac5be] hover:text-[#68b1aa] text-sm font-medium'
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Sequence */}
          <div>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4'>
              Sequence
            </h3>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId='sequence'>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className='space-y-2'
                  >
                    {sequence.map((item, index) => {
                      const category = categories.find(
                        (c) => c.id === item.categoryId
                      );
                      if (!category) return null;

                      return (
                        <Draggable
                          key={item.id}
                          draggableId={item.id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className='flex items-center justify-between p-3 bg-white dark:bg-gray-800 
                                rounded-lg border border-gray-200 dark:border-gray-700'
                            >
                              <div className='flex items-center gap-3'>
                                <div {...provided.dragHandleProps}>
                                  <GripVertical className='h-5 w-5 text-gray-400' />
                                </div>
                                <div
                                  className='w-4 h-4 rounded'
                                  style={{ backgroundColor: category.color }}
                                />
                                <span className='text-sm text-gray-900 dark:text-gray-100'>
                                  {category.name}
                                </span>
                              </div>
                              <button
                                onClick={() =>
                                  handleRemoveSequenceItem(item.id)
                                }
                                className='text-red-600 hover:text-red-700 text-sm font-medium'
                              >
                                Remove
                              </button>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </div>
      )}
    </div>
  );
}
