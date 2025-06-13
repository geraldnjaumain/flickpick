import React, { useState, useEffect, forwardRef } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, Settings, Monitor, Smartphone, X, RefreshCw } from 'lucide-react';
import { streamingSources, getStreamingUrl } from '@/services/streaming';
import { tmdbApi } from '@/services/tmdb';

interface CustomVideoPlayerProps {
  title: string;
  tmdbId: number;
  type: 'movie' | 'tv';
  season?: number;
  episode?: number;
}

interface Episode {
  id: number;
  name: string;
  episode_number: number;
  air_date: string;
  overview: string;
}

interface Season {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
}

export const CustomVideoPlayer = forwardRef<HTMLDivElement, CustomVideoPlayerProps>(
  ({ 
    title, 
    tmdbId, 
    type, 
    season = 1, 
    episode = 1 
  }, ref) => {
    const [currentSource, setCurrentSource] = useState(0);
    const [currentSeason, setCurrentSeason] = useState(season);
    const [currentEpisode, setCurrentEpisode] = useState(episode);
    const [seasons, setSeasons] = useState<Season[]>([]);
    const [episodes, setEpisodes] = useState<Episode[]>([]);
    const [loading, setLoading] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [isMuted, setIsMuted] = useState(false);
    const [isPlaying, setIsPlaying] = useState(true);
    const [showSourceMenu, setShowSourceMenu] = useState(false);

    // Haptic feedback function
    const triggerHaptic = () => {
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    };

    useEffect(() => {
      if (type === 'tv') {
        fetchSeasons();
      }
    }, [type, tmdbId]);

    useEffect(() => {
      if (type === 'tv' && currentSeason) {
        fetchEpisodes(currentSeason);
      }
    }, [currentSeason, type, tmdbId]);

    const fetchSeasons = async () => {
      try {
        const tvDetails = await tmdbApi.getTVDetails(tmdbId);
        if (tvDetails.seasons) {
          setSeasons(tvDetails.seasons.filter(s => s.season_number > 0));
        }
      } catch (error) {
        console.error('Error fetching seasons:', error);
      }
    };

    const fetchEpisodes = async (seasonNumber: number) => {
      setLoading(true);
      try {
        const seasonDetails = await tmdbApi.getTVSeasonDetails(tmdbId, seasonNumber);
        if (seasonDetails.episodes) {
          setEpisodes(seasonDetails.episodes);
        }
      } catch (error) {
        console.error('Error fetching episodes:', error);
      } finally {
        setLoading(false);
      }
    };

    const handleSourceChange = (sourceIndex: number) => {
      triggerHaptic();
      setCurrentSource(sourceIndex);
      setShowSourceMenu(false);
    };

    const handleSeasonChange = (seasonNumber: string) => {
      setCurrentSeason(parseInt(seasonNumber));
      setCurrentEpisode(1);
    };

    const handleEpisodeChange = (episodeNumber: string) => {
      setCurrentEpisode(parseInt(episodeNumber));
    };

    const toggleFullscreen = () => {
      triggerHaptic();
      setIsFullscreen(!isFullscreen);
    };

    const refreshPlayer = () => {
      triggerHaptic();
      window.location.reload();
    };

    return (
      <div ref={ref} className="w-full">
        {/* Custom Controls Header */}
        <div className="bg-background/95 backdrop-blur-3xl border border-border/60 rounded-t-2xl p-4 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-foreground font-medium text-sm md:text-base truncate">
              {title} {type === 'tv' ? `S${currentSeason}E${currentEpisode}` : ''}
            </h3>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshPlayer}
                className="h-8 px-3 bg-background/50 backdrop-blur-xl border-border/50 hover:bg-background/70"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSourceMenu(!showSourceMenu)}
                className="h-8 px-3 bg-background/50 backdrop-blur-xl border-border/50 hover:bg-background/70"
              >
                <Settings className="h-3.5 w-3.5 mr-1" />
                Sources
              </Button>
            </div>
          </div>

          {/* Source Selection */}
          {showSourceMenu && (
            <div className="bg-background/70 backdrop-blur-2xl border border-border/50 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <Monitor className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground text-sm font-medium">Video Sources:</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {streamingSources.map((source, index) => (
                  <Button
                    key={source.name}
                    variant={currentSource === index ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSourceChange(index)}
                    className={`h-8 text-xs transition-all ${
                      currentSource === index 
                        ? "bg-primary text-primary-foreground shadow-lg" 
                        : "bg-background/50 backdrop-blur-xl border-border/50 hover:bg-background/70"
                    }`}
                  >
                    {source.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* TV Show Controls */}
          {type === 'tv' && seasons.length > 0 && (
            <div className="flex gap-4 flex-wrap items-center">
              <div className="flex items-center gap-2">
                <span className="text-foreground text-sm">Season:</span>
                <Select value={currentSeason.toString()} onValueChange={handleSeasonChange}>
                  <SelectTrigger className="w-32 h-8 bg-background/50 backdrop-blur-xl border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background/95 backdrop-blur-3xl border-border/60">
                    {seasons.map((season) => (
                      <SelectItem key={season.id} value={season.season_number.toString()}>
                        Season {season.season_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {episodes.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-foreground text-sm">Episode:</span>
                  <Select value={currentEpisode.toString()} onValueChange={handleEpisodeChange}>
                    <SelectTrigger className="w-40 h-8 bg-background/50 backdrop-blur-xl border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background/95 backdrop-blur-3xl border-border/60 max-h-48">
                      {episodes.map((ep) => (
                        <SelectItem key={ep.id} value={ep.episode_number.toString()}>
                          {ep.episode_number}. {ep.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Video Player */}
        <div className="relative w-full bg-black rounded-b-2xl overflow-hidden" style={{ paddingBottom: '56.25%' }}>
          <iframe
            src={getStreamingUrl(tmdbId, type, currentSource, currentSeason, currentEpisode)}
            title={`${title} ${type === 'tv' ? `S${currentSeason}E${currentEpisode}` : ''}`}
            className="absolute top-0 left-0 w-full h-full"
            allowFullScreen
            allow="autoplay; encrypted-media; gyroscope; picture-in-picture"
            style={{ border: 'none' }}
          />
        </div>

        {/* Episode Grid for TV Shows */}
        {type === 'tv' && episodes.length > 0 && (
          <div className="mt-4 bg-background/95 backdrop-blur-3xl border border-border/60 rounded-2xl p-4">
            <h4 className="text-foreground font-medium mb-3 flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Episodes
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
              {episodes.map((ep) => (
                <Button
                  key={ep.id}
                  variant={currentEpisode === ep.episode_number ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    triggerHaptic();
                    setCurrentEpisode(ep.episode_number);
                  }}
                  className={`justify-start text-left h-auto p-3 transition-all ${
                    currentEpisode === ep.episode_number
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "bg-background/50 backdrop-blur-xl border-border/50 hover:bg-background/70"
                  }`}
                >
                  <div className="w-full">
                    <div className="font-medium text-sm">Ep {ep.episode_number}</div>
                    <div className="text-xs opacity-80 truncate">{ep.name}</div>
                    {ep.air_date && (
                      <div className="text-xs opacity-60">{new Date(ep.air_date).getFullYear()}</div>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
);

CustomVideoPlayer.displayName = 'CustomVideoPlayer';

export default CustomVideoPlayer;
