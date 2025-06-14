
import React from 'react';
import { CustomVideoPlayer } from './CustomVideoPlayer';

interface VideoPlayerProps {
  title: string;
  tmdbId: number;
  type: 'movie' | 'tv';
  season?: number;
  episode?: number;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = (props) => {
  return <CustomVideoPlayer {...props} />;
};
