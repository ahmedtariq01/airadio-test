import { MediaItem } from '@/types/media';
import { Draggable } from '@hello-pangea/dnd';
import { Edit, Pause, Play, Trash2 } from 'lucide-react';
import AudioPlayer from '../audioPlayer';

interface DraggableTableRowProps {
  item: MediaItem;
  index: number;
  playingAudio: string | null;
  setPlayingAudio: (url: string | null) => void;
  handleDelete: (id: string) => void;
  handleEditLibrary?: (id: string) => void;
  handleAudioPlayPause: (
    audioUrl: string,
    playingAudio: string | null,
    setPlayingAudio: (url: string | null) => void
  ) => void;
  sectionId: 'station' | 'library';
}

export const DraggableTableRow: React.FC<DraggableTableRowProps> = ({
  item,
  index,
  playingAudio,
  setPlayingAudio,
  handleDelete,
  handleAudioPlayPause,
  sectionId,
  handleEditLibrary,
}) => {
  const draggableId = `${sectionId}-${item?.id || index}`;
  return (
    <Draggable draggableId={draggableId} index={index}>
      {(provided, snapshot) => (
        <tr
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`border-b border-gray-200 dark:border-gray-700 ${
            snapshot.isDragging ? 'bg-gray-50 dark:bg-gray-700' : ''
          }`}
        >
          <td className='px-4 py-3 text-sm text-gray-900 dark:text-gray-100'>
            {item?.title}
          </td>
          <td className='px-4 py-3 text-sm text-gray-900 dark:text-gray-100'>
            {item?.artist}
          </td>
          <td className='px-4 py-3 text-sm text-gray-900 dark:text-gray-100'>
            {item?.rotation}
          </td>
          <td className='px-4 py-3 text-sm text-gray-900 dark:text-gray-100'>
            <div className='flex justify-end'>
              <AudioPlayer
                audioFile={item?.audio_file}
                startTime={item?.intro_point}
                endTime={item?.aux_point}
                playingAudio={playingAudio}
                setPlayingAudio={setPlayingAudio}
              />

              <button
                onClick={() =>
                  handleDelete(
                    sectionId === 'station' ? item?.playlist_item_id : item?.id
                  )
                }
                className='w-6 h-6 flex ml-2 items-center justify-center bg-red-600 hover:bg-red-700 text-white rounded-full transition-all'
              >
                <Trash2 size={12} />
              </button>
              {sectionId === 'library' && (
                <button
                  onClick={() => handleEditLibrary(item?.id)}
                  className='w-6 h-6 flex ml-2 items-center justify-center bg-gray-500 hover:bg-gray-700 text-white rounded-full transition-all'
                >
                  <Edit size={12} />
                </button>
              )}
            </div>
          </td>
        </tr>
      )}
    </Draggable>
  );
};