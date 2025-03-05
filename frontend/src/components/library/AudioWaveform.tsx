'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useRef, useState } from 'react';
import { Play, Pause, ZoomIn, ZoomOut } from 'lucide-react';
import WaveSurfer from 'wavesurfer.js';
// Import the plugin as any type
const MarkersPlugin =
  require('wavesurfer.js/dist/plugin/wavesurfer.markers.min.js') as any;
import '@/styles/waveform.css';

interface AudioWaveformProps {
  audioFile: File | null;
  markers: {
    in: number;
    vox: number;
    aux: number;
  };
  onMarkersChange: (markers: { in: number; vox: number; aux: number }) => void;
}

const AudioWaveform = ({
  audioFile,
  markers,
  onMarkersChange,
}: AudioWaveformProps) => {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Initialize WaveSurfer
  useEffect(() => {
    if (waveformRef.current) {
      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#4a9eff',
        progressColor: '#2451ff',
        height: 64,
        cursorColor: '#fff',
        cursorWidth: 2,
        barWidth: 2,
        barGap: 1,
        responsive: true,
        normalize: true,
        plugins: [
          MarkersPlugin.create({
            markers: [],
          }),
        ],
      });

      wavesurfer.current.on('ready', () => {
        updateMarkers();
      });

      wavesurfer.current.on('finish', () => {
        setIsPlaying(false);
      });

      return () => {
        wavesurfer.current?.destroy();
      };
    }
  }, []);

  // Load audio file
  useEffect(() => {
    if (audioFile && typeof audioFile === 'string') {
      console.log("here inside useffext",audioFile)
      wavesurfer.current.load(audioFile);
    } else {
      if (audioFile && wavesurfer.current) {
        const url = URL.createObjectURL(audioFile);
        wavesurfer.current.load(url);
      }
    }
  }, [audioFile]);

  const updateMarkers = () => {
    if (!wavesurfer.current?.markers) return;

    wavesurfer.current.markers.clear();

    if (markers.in > 0) {
      wavesurfer.current.markers.add({
        time: markers?.in,
        label: 'IN',
        color: '#00ff00',
        position: 'top',
      });
    }
    if (markers.vox > 0) {
      wavesurfer.current.markers.add({
        time: markers?.vox,
        label: 'VOX',
        color: '#ff9900',
        position: 'top',
      });
    }
    if (markers.aux > 0) {
      wavesurfer.current.markers.add({
        time: markers?.aux,
        label: 'AUX',
        color: '#ff0000',
        position: 'top',
      });
    }
  };

  const getMarkerColor = (type: 'in' | 'vox' | 'aux') => {
    const colors = {
      in: '#00ff00',
      vox: '#ff9900',
      aux: '#ff0000',
    };
    return colors[type];
  };

  // Set marker at current time
  const setMarker = (type: 'in' | 'vox' | 'aux') => {
    if (!wavesurfer.current?.markers) return;

    const currentTime = wavesurfer.current.getCurrentTime();

    // Clear previous marker
    wavesurfer.current.markers.markers.forEach((marker: any, index: number) => {
      if (marker.label === type.toUpperCase()) {
        wavesurfer.current?.markers.remove(index);
      }
    });

    // Add new marker
    wavesurfer.current.markers.add({
      time: currentTime,
      label: type.toUpperCase(),
      color: getMarkerColor(type),
      position: 'top',
    });

    // Update state
    onMarkersChange({
      ...markers,
      [type]: currentTime,
    });

    // Add visual feedback
    const button = document.getElementById(`set${type.toUpperCase()}Point`);
    if (button) {
      button.classList.add('scale-95');
      button.textContent = `${type.toUpperCase()}: ${currentTime.toFixed(2)}s`;
      setTimeout(() => {
        button.classList.remove('scale-95');
      }, 200);
    }
  };

  // Toggle play/pause
  const togglePlayPause = () => {
    if (wavesurfer.current) {
      wavesurfer.current.playPause();
      setIsPlaying(!isPlaying);
    }
  };

  // Play from marker position
  const playFromMarker = (type: 'in' | 'vox' | 'aux') => {
    if (!wavesurfer.current) return;

    const time = markers[type];
    if (time > 0) {
      wavesurfer.current.seekTo(time / wavesurfer.current.getDuration());
      wavesurfer.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className='bg-gray-100 dark:bg-gray-700 rounded-lg p-4'>
      <div ref={waveformRef} className='mb-4' />

      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <button
            onClick={togglePlayPause}
            type='button'
            className='flex items-center gap-2 px-3 py-1 bg-[#7ac5be] text-white rounded'
          >
            {isPlaying ? (
              <Pause className='h-4 w-4' />
            ) : (
              <Play className='h-4 w-4' />
            )}
            {isPlaying ? 'Pause' : 'Play'}
          </button>

          <div className='flex items-center gap-2'>
            <div className='flex items-center gap-1'>
              <button
                id='setINPoint'
                type='button'
                onClick={() => setMarker('in')}
                className='px-3 py-1 bg-green-500 text-white rounded transition-transform'
              >
                Set IN
              </button>
              {markers.in !== undefined && markers.in >= 0 && (
                <button
                  onClick={() => playFromMarker('in')}
                  type='button'
                  className='p-1 bg-green-500/20 hover:bg-green-500/30 text-green-700 rounded'
                  title='Play from IN marker'
                >
                  <Play className='h-4 w-4' />
                </button>
              )}
            </div>

            <div className='flex items-center gap-1'>
              <button
                id='setVOXPoint'
                type='button'
                onClick={() => setMarker('vox')}
                className='px-3 py-1 bg-orange-500 text-white rounded transition-transform'
              >
                Set VOX
              </button>
              {markers.vox !== undefined && markers.vox >= 0 && (
                <button
                  onClick={() => playFromMarker('vox')}
                  type='button'
                  className='p-1 bg-orange-500/20 hover:bg-orange-500/30 text-orange-700 rounded'
                  title='Play from VOX marker'
                >
                  <Play className='h-4 w-4' />
                </button>
              )}
            </div>

            <div className='flex items-center gap-1'>
              <button
                id='setAUXPoint'
                type='button'
                onClick={() => setMarker('aux')}
                className='px-3 py-1 bg-red-500 text-white rounded transition-transform'
              >
                Set AUX
              </button>
              {markers.aux !== undefined && markers.aux >= 0 && (
                <button
                  onClick={() => playFromMarker('aux')}
                  type='button'
                  className='p-1 bg-red-500/20 hover:bg-red-500/30 text-red-700 rounded'
                  title='Play from AUX marker'
                >
                  <Play className='h-4 w-4' />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <button
            onClick={() =>
              wavesurfer.current?.zoom(
                wavesurfer.current.params.minPxPerSec / 1.5
              )
            }
            className='p-1 text-gray-600 hover:text-gray-800'
            type='button'
          >
            <ZoomOut className='h-4 w-4' />
          </button>
          <button
            onClick={() =>
              wavesurfer.current?.zoom(
                wavesurfer.current.params.minPxPerSec * 1.5
              )
            }
            className='p-1 text-gray-600 hover:text-gray-800'
            type='button'
          >
            <ZoomIn className='h-4 w-4' />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AudioWaveform;
