'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Search, Upload, X } from 'lucide-react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import Cookies from 'js-cookie';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { toast } from 'sonner';

const AudioWaveform = dynamic(() => import('./AudioWaveform'), { ssr: false });

type MediaType = 'SONG' | 'ADVERT' | 'PODCAST' | 'NEWS' | 'VOICE' | 'ID';

interface Format {
  id: string;
  name: string;
  color: string;
}

interface AddMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEditing?: boolean;
  signleSong?: any;
}

export function AddMediaModal({
  isOpen,
  onClose,
  isEditing = false,
  signleSong,
}: AddMediaModalProps) {
  const [coverArt, setCoverArt] = useState<string | null>(
    signleSong?.cover_art || null
  );
  const [audioFile, setAudioFile] = useState<File | null>(
    signleSong?.audio_file || null
  );
  const [lyricsFile, setLyricsFile] = useState<File | null>(
    signleSong?.lyrics_file || null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [coverArtQuery, setCoverArtQuery] = useState('');
  const [lyricsQuery, setLyricsQuery] = useState('');
  const [markers, setMarkers] = useState({
    in: signleSong?.intro_point || null,
    vox: signleSong?.vocal_point || null,
    aux: signleSong?.aux_point || null,
  });
  const [allowSkip, setAllowSkip] = useState(signleSong?.allow_skip || false);
  const [isClean, setIsClean] = useState(signleSong?.allow_skip);
  const [formData, setFormData] = useState({
    title: signleSong?.title || '',
    artist: signleSong?.artist || '',
    genre: signleSong?.genre || '',
    rotation: signleSong?.rotation || 'medium',
  });
  const [mediaType, setMediaType] = useState<MediaType>('SONG');
  const [formats, setFormats] = useState<Format[]>([]);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const coverArtInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (signleSong) {
      setCoverArt(signleSong?.cover_art || '');
      setLyricsFile(signleSong?.lyrics_file || '');
      setAudioFile(signleSong?.audio_file || '')

      setMarkers({
        in: signleSong?.intro_point || null,
        vox: signleSong?.vocal_point || null,
        aux: signleSong?.aux_point || null,
      });
      setAllowSkip(signleSong?.allow_skip || false);
      setFormData({
        title: signleSong?.title || '',
        artist: signleSong?.artist || '',
        genre: signleSong?.genre || '',
        rotation: signleSong?.rotation || 'medium',
      });
    }
    setIsClean(signleSong?.is_clean || false);
  }, [
    signleSong?.cover_art,
    signleSong?.audio_file,
    signleSong?.lyrics_file,
    signleSong?.intro_point,
    signleSong?.vocal_point,
    signleSong?.aux_point,
    signleSong?.title,
    signleSong?.artist,
    signleSong?.genre,
    signleSong?.rotation,
    signleSong?.allow_skip,
    signleSong?.is_clean,
  ]);
  console.log(audioFile,"audio")
  useEffect(() => {
    if (isOpen) {
      loadFormats();
    }
  }, [isOpen]);

  const loadFormats = async () => {
    try {
      const response = await fetchWithAuth('/api/v3/formats/');
      const data = await response.json();
      setFormats(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to load formats');
    }
  };

  const handleCoverArtUpload = useCallback((file: File) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverArt(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleCoverArtDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleCoverArtUpload(file);
    },
    [handleCoverArtUpload]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'audio/aac' || file.type === 'audio/x-m4a')) {
      setAudioFile(file);
    }
  };

  const handleLyricsUpload = (file: File) => {
    console.log('Attempting to upload lyrics file:', {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    if (file.name.toLowerCase().endsWith('.lrc')) {
      setLyricsFile(file);
    } else {
      setError('Please upload a .lrc file');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setError('');
    setIsSubmitting(true);

    try {
      if (!audioFile) {
        setError('Please select an audio file');
        return;
      }

      const formDataToSend = new FormData();

      formDataToSend.append('audio', audioFile);

      if (coverArt) {
        const response = await fetch(coverArt);
        const blob = await response.blob();
        formDataToSend.append('cover_art', blob, 'cover.jpg');
      }

      if (lyricsFile) {
        formDataToSend.append('lyrics', lyricsFile);
      }

      formDataToSend.append('title', formData.title || '');
      formDataToSend.append('artist', formData.artist || '');
      formDataToSend.append('genre', formData.genre || '');
      formDataToSend.append('rotation', formData.rotation || 'medium');
      formDataToSend.append('markers', JSON.stringify(markers));
      formDataToSend.append('allow_skip', String(allowSkip));
      formDataToSend.append('is_clean', String(isClean));
      formDataToSend.append('media_type', mediaType);
      formDataToSend.append('formats', JSON.stringify(selectedFormats));

      const token = Cookies.get('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error('API URL not configured');
      }

      const url = new URL('/api/library/items/', apiUrl);

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error('Failed to upload audio file');
      }

      onClose();
      setFormData({
        title: '',
        artist: '',
        genre: '',
        rotation: 'medium',
      });
      setAudioFile(null);
      setCoverArt(null);
      setLyricsFile(null);
      setMarkers({ in: 0, vox: 0, aux: 0 });
    } catch (error) {
      console.error('Error submitting form:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      <div className='flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0'>
        <div
          className='fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity'
          onClick={onClose}
        />

        <div className='relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl sm:p-6'>
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className='flex justify-between items-center mb-6 border-b border-gray-200 dark:border-gray-700 pb-4'>
              <h3 className='text-xl font-semibold text-gray-900 dark:text-white'>
                {isEditing ? 'Edit Item' : 'Add New Item'}
              </h3>
              <button
                type='button'
                onClick={onClose}
                className='text-gray-400 hover:text-gray-500'
              >
                <X className='h-6 w-6' />
              </button>
            </div>

            <div className='space-y-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Media Type
                </label>
                <select
                  value={mediaType}
                  onChange={(e) => setMediaType(e.target.value as MediaType)}
                  className='w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                    bg-white dark:bg-gray-800 
                    text-gray-900 dark:text-gray-100'
                >
                  <option value='SONG'>Song</option>
                  <option value='ADVERT'>Advertisement</option>
                  <option value='PODCAST'>Podcast</option>
                  <option value='NEWS'>News</option>
                  <option value='VOICE'>Voice Track</option>
                  <option value='ID'>Station ID</option>
                </select>
              </div>

              {mediaType === 'SONG' && (
                <>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                      Search Track Metadata
                    </label>
                    <div className='relative'>
                      <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                      <input
                        type='text'
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder='Search Tidal for track metadata...'
                        className='w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg'
                      />
                    </div>
                  </div>

                  <div className='grid grid-cols-2 gap-6'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                        Cover Art
                      </label>
                      <div
                        className='relative w-[200px] h-[200px] bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden cursor-pointer'
                        onClick={() => coverArtInputRef.current?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleCoverArtDrop}
                      >
                        <input
                          type='file'
                          ref={coverArtInputRef}
                          accept='image/*'
                          className='hidden'
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleCoverArtUpload(file);
                          }}
                        />

                        {coverArt ? (
                          <>
                            <Image
                              src={coverArt}
                              alt='Cover Art'
                              fill
                              className='object-cover'
                            />
                            <div className='absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 transition-opacity flex items-center justify-center'>
                              <div className='text-white opacity-0 hover:opacity-100 transition-opacity'>
                                Click or drop to change
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className='flex flex-col items-center justify-center h-full text-gray-400'>
                            <Upload className='h-12 w-12 mb-2' />
                            <p className='text-sm'>Click or drop image here</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                        Search Cover Art
                      </label>
                      <div className='relative'>
                        <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                        <input
                          type='text'
                          value={coverArtQuery}
                          onChange={(e) => setCoverArtQuery(e.target.value)}
                          placeholder='Search Tidal for cover art...'
                          className='w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg'
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                      Lyrics (.lrc)
                    </label>
                    <div className='grid grid-cols-2 gap-6'>
                      <div>
                        <div
                          className='border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center'
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const file = e.dataTransfer.files[0];
                            if (file) handleLyricsUpload(file);
                          }}
                        >
                          <input
                            type='file'
                            accept='.lrc'
                            id='lyricsInput'
                            className='hidden'
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleLyricsUpload(file);
                            }}
                          />
                          <div className='cursor-pointer'>
                            <button
                              type='button'
                              onClick={() =>
                                document.getElementById('lyricsInput')?.click()
                              }
                              className='text-[#7ac5be] hover:text-[#68b1aa]'
                            >
                              Upload .lrc file
                            </button>
                            <p className='text-sm text-gray-500 mt-1'>
                              or drag and drop
                            </p>
                          </div>
                          {lyricsFile && (
                            <div className='mt-2'>
                              <p className='text-sm text-gray-700 dark:text-gray-300'>
                                {lyricsFile.name}
                              </p>
                              <button
                                type='button'
                                onClick={() => setLyricsFile(null)}
                                className='text-xs text-red-500 hover:text-red-600 mt-1'
                              >
                                Remove
                              </button>
                            </div>
                          )}
                        </div>
                        <p className='text-xs text-gray-500 mt-1'>
                          Only .lrc (LRC) files are supported for synchronized
                          lyrics
                        </p>
                      </div>
                      <div>
                        <div className='relative'>
                          <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                          <input
                            type='text'
                            value={lyricsQuery}
                            onChange={(e) => setLyricsQuery(e.target.value)}
                            placeholder='Search Tidal for lyrics...'
                            className='w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg'
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Upload Audio {mediaType === 'SONG' ? '(AAC)' : '(MP3/AAC)'}
                </label>
                <div
                  ref={dropZoneRef}
                  className={`border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center
                    ${
                      audioFile
                        ? 'bg-gray-50 dark:bg-gray-800'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <input
                    type='file'
                    ref={fileInputRef}
                    accept='.aac,.m4a'
                    className='hidden'
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setAudioFile(file);
                    }}
                  />
                  <div className='flex flex-col items-center'>
                    <button
                      type='button'
                      onClick={() => fileInputRef.current?.click()}
                      className='text-[#7ac5be] hover:text-[#68b1aa] font-medium'
                    >
                      Upload a file
                    </button>
                    <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
                      or drag and drop
                    </p>
                    {audioFile && (
                      <div className='mt-4'>
                        <p className='text-sm text-gray-700 dark:text-gray-300'>
                          {audioFile.name}
                        </p>
                        <button
                          type='button'
                          onClick={() => setAudioFile(null)}
                          className='text-xs text-red-500 hover:text-red-600 mt-1'
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-6'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                    Title
                  </label>
                  <input
                    type='text'
                    value={signleSong?.title || formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className='w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                      bg-white dark:bg-gray-800 
                      text-gray-900 dark:text-gray-100 
                      placeholder-gray-500 dark:placeholder-gray-400'
                  />
                </div>
                {mediaType === 'SONG' && (
                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                      Artist
                    </label>
                    <input
                      type='text'
                      value={formData.artist}
                      onChange={(e) =>
                        setFormData({ ...formData, artist: e.target.value })
                      }
                      className='w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                        bg-white dark:bg-gray-800 
                        text-gray-900 dark:text-gray-100 
                        placeholder-gray-500 dark:placeholder-gray-400'
                    />
                  </div>
                )}
                {mediaType === 'SONG' && (
                  <>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                        Genre
                      </label>
                      <input
                        type='text'
                        value={formData.genre}
                        onChange={(e) =>
                          setFormData({ ...formData, genre: e.target.value })
                        }
                        className='w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                          bg-white dark:bg-gray-800 
                          text-gray-900 dark:text-gray-100 
                          placeholder-gray-500 dark:placeholder-gray-400'
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                        Rotation
                      </label>
                      <select
                        value={formData.rotation}
                        onChange={(e) =>
                          setFormData({ ...formData, rotation: e.target.value })
                        }
                        className='w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                          bg-white dark:bg-gray-800 
                          text-gray-900 dark:text-gray-100'
                      >
                        <option value='high'>High</option>
                        <option value='medium'>Medium</option>
                        <option value='low'>Low</option>
                      </select>
                    </div>
                  </>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Audio Waveform
                </label>
                <AudioWaveform
                  audioFile={audioFile}
                  markers={markers}
                  onMarkersChange={setMarkers}
                />
              </div>

              <div className='flex gap-6'>
                <label className='flex items-center gap-2'>
                  <input
                    type='checkbox'
                    checked={allowSkip}
                    onChange={(e) => setAllowSkip(e.target.checked)}
                    className='rounded border-gray-300'
                  />
                  <span className='text-sm text-gray-700 dark:text-gray-300'>
                    Allow Skip
                  </span>
                </label>
                <label className='flex items-center gap-2'>
                  <input
                    type='checkbox'
                    checked={isClean}
                    onChange={(e) => setIsClean(e.target.checked)}
                    className='rounded border-gray-300'
                  />
                  <span className='text-sm text-gray-700 dark:text-gray-300'>
                    Clean Edit
                  </span>
                </label>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Formats
                </label>
                <div className='flex flex-wrap gap-2 p-2 border border-gray-200 dark:border-gray-700 rounded-lg'>
                  {formats.map((format) => (
                    <button
                      key={format.id}
                      type='button'
                      onClick={() => {
                        setSelectedFormats((prev) =>
                          prev.includes(format.id)
                            ? prev.filter((id) => id !== format.id)
                            : [...prev, format.id]
                        );
                      }}
                      style={{
                        backgroundColor: selectedFormats.includes(format.id)
                          ? format.color
                          : 'transparent',
                        borderColor: format.color,
                      }}
                      className={`
                        px-3 py-1.5 rounded-full text-sm font-medium
                        border-2 transition-all duration-200
                        hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2
                        ${
                          selectedFormats.includes(format.id)
                            ? 'text-white shadow-sm'
                            : 'text-gray-700 dark:text-gray-300'
                        }
                      `}
                    >
                      <span className='flex items-center gap-2'>
                        {selectedFormats.includes(format.id) && (
                          <svg
                            className='w-4 h-4'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M5 13l4 4L19 7'
                            />
                          </svg>
                        )}
                        {format.name}
                      </span>
                    </button>
                  ))}
                </div>
                {formats.length === 0 && (
                  <p className='text-sm text-gray-500 mt-1'>
                    No formats available. Add formats in Settings.
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className='mt-6 flex justify-end'>
                {error && (
                  <p className='text-red-500 text-sm mr-4 self-center'>
                    {error}
                  </p>
                )}
                <button
                  type='submit'
                  disabled={isSubmitting}
                  className={`
                    bg-[#7ac5be] hover:bg-[#68b1aa] text-white px-4 py-2 rounded-lg
                    flex items-center gap-2
                    ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  {isSubmitting ? (
                    <>
                      <span className='animate-spin'>⌛</span>
                      {isEditing ? 'Saving...' : 'Adding...'}
                    </>
                  ) : isEditing ? (
                    'Save Changes'
                  ) : (
                    'Add Item'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
