import { useEffect, useRef, useState } from 'react';
import { Play, Pause } from 'lucide-react';

const AudioPlayer = ({
  audioFile,
  startTime,
  endTime,
  playingAudio,
  setPlayingAudio,
}: {
  audioFile: string;
  startTime: number;
  endTime: number;
  playingAudio: string | null;
  setPlayingAudio: (file: string | null) => void;
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      if (audio.currentTime >= endTime) {
        audio.pause();
        setIsPlaying(false);
        setPlayingAudio(null);
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [endTime, setPlayingAudio]);

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    const audio = audioRef.current;

    if (playingAudio === audioFile) {
      audio.pause();
      setIsPlaying(false);
      setPlayingAudio(null);
    } else {
      if (playingAudio) {
        const otherAudio = document.getElementById(
          playingAudio
        ) as HTMLAudioElement;
        if (otherAudio) {
          otherAudio.pause();
          otherAudio.currentTime = startTime;
        }
      }

      audio.currentTime = startTime;
      audio.play().catch((error) => console.error('Playback failed', error));
      setIsPlaying(true);
      setPlayingAudio(audioFile);
    }
  };

  return (
    <div>
      <button
        onClick={handlePlayPause}
        className='w-6 h-6 flex items-center justify-center bg-green-600 hover:bg-green-700 text-white rounded-full transition-all'
      >
        {isPlaying ? <Pause size={12} /> : <Play size={12} />}
      </button>
      <audio id={audioFile} ref={audioRef} src={audioFile} />
    </div>
  );
};

export default AudioPlayer;
