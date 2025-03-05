import { MediaItem } from '@/types/media';
import React from 'react';
import { DraggableTableRow } from '../DraggableTableRow';
import { Droppable } from '@hello-pangea/dnd';

interface MediaTableProps {
  droppableId: 'station' | 'library';
  items: MediaItem[];
  isLoading: boolean;
  playingAudio: string | null;
  setPlayingAudio: (url: string | null) => void;
  handleDelete: (id: string) => void;
  handleEditLibrary?: (id: string) => void;
  handleAudioPlayPause: (
    audioUrl: string,
    playingAudio: string | null,
    setPlayingAudio: (url: string | null) => void
  ) => void;
}

export const MediaTable: React.FC<MediaTableProps> = ({
  droppableId,
  items,
  isLoading,
  playingAudio,
  setPlayingAudio,
  handleDelete,
  handleAudioPlayPause,
  handleEditLibrary,
}) => {
  return (
    <Droppable droppableId={droppableId}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`${
            snapshot.isDraggingOver ? 'bg-gray-50 dark:bg-gray-700' : ''
          }`}
        >
          <table className='w-full'>
            <thead className='sticky top-[-16px] bg-white dark:bg-gray-800'>
              <tr className='border-b border-gray-200 dark:border-gray-700'>
                <th className='px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400'>
                  Title
                </th>
                <th className='px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400'>
                  Artist
                </th>
                <th className='px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400'>
                  Rotation
                </th>
                <th className='px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4}>
                    <div className='p-6 flex justify-center items-center'>
                      <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-[#7ac5be]' />
                    </div>
                  </td>
                </tr>
              ) : items?.length > 0 ? (
                items?.map((item, index) => (
                  <DraggableTableRow
                    key={item.id}
                    item={item}
                    index={index}
                    playingAudio={playingAudio}
                    setPlayingAudio={setPlayingAudio}
                    handleDelete={handleDelete}
                    handleAudioPlayPause={handleAudioPlayPause}
                    sectionId={droppableId}
                    handleEditLibrary={handleEditLibrary}
                  />
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className='px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400'
                  >
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};