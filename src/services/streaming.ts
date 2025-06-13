
export interface StreamingSource {
  name: string;
  getUrl: (tmdbId: number, type: 'movie' | 'tv', season?: number, episode?: number) => string;
}

// Enhanced ad blocking parameters
const adBlockParams = '&adblock=1&nopop=1&noads=1&block_ads=true&popup=0&adsblock=true&adsblocker=1';

export const streamingSources: StreamingSource[] = [
  {
    name: 'VidSrc Me',
    getUrl: (tmdbId, type, season, episode) => {
      const baseUrl = `https://vidsrc.me/embed/${type}?tmdb=${tmdbId}&autoplay=1${adBlockParams}`;
      if (type === 'tv' && season && episode) {
        return `${baseUrl}&season=${season}&episode=${episode}`;
      }
      return baseUrl;
    }
  },

  {
    name: 'VidSrc Pro',
    getUrl: (tmdbId, type, season, episode) => {
      const baseUrl = `https://vidsrc.pro/embed/${type}/${tmdbId}`;
      if (type === 'tv' && season && episode) {
        return `${baseUrl}/${season}/${episode}?autoplay=1${adBlockParams}`;
      }
      return `${baseUrl}?autoplay=1${adBlockParams}`;
    }
  },
  
  {
    name: 'MoviesAPI',
    getUrl: (tmdbId, type, season, episode) => {
      if (type === 'tv' && season && episode) {
        return `https://moviesapi.club/tv/${tmdbId}-${season}-${episode}?autoplay=1${adBlockParams}`;
      }
      return `https://moviesapi.club/${type}/${tmdbId}?autoplay=1${adBlockParams}`;
    }
  },
  {
    name: 'SuperEmbed',
    getUrl: (tmdbId, type, season, episode) => {
      const baseUrl = `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&autoplay=1${adBlockParams}`;
      if (type === 'tv' && season && episode) {
        return `${baseUrl}&s=${season}&e=${episode}`;
      }
      return baseUrl;
    }
  },
  {
    name: 'EmbedSu',
    getUrl: (tmdbId, type, season, episode) => {
      const baseUrl = `https://embed.su/embed/${type}/${tmdbId}`;
      if (type === 'tv' && season && episode) {
        return `${baseUrl}/${season}/${episode}?autoplay=1${adBlockParams}`;
      }
      return `${baseUrl}?autoplay=1${adBlockParams}`;
    }
  },
  {
    name: 'VidLink',
    getUrl: (tmdbId, type, season, episode) => {
      const baseUrl = `https://vidlink.pro/movie/${tmdbId}`;
      if (type === 'tv' && season && episode) {
        return `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}?autoplay=1${adBlockParams}`;
      }
      return `${baseUrl}?autoplay=1${adBlockParams}`;
    }
  },
  {
    name: 'VidCloud',
    getUrl: (tmdbId, type, season, episode) => {
      const baseUrl = `https://embed.smashystream.com/playere.php?tmdb=${tmdbId}&autoplay=1${adBlockParams}`;
      if (type === 'tv' && season && episode) {
        return `${baseUrl}&season=${season}&episode=${episode}`;
      }
      return baseUrl;
    }
  },
  {
    name: 'AutoEmbed',
    getUrl: (tmdbId, type, season, episode) => {
      const baseUrl = `https://player.autoembed.cc/embed/${type}/${tmdbId}`;
      if (type === 'tv' && season && episode) {
        return `${baseUrl}/${season}/${episode}?autoplay=1${adBlockParams}`;
      }
      return `${baseUrl}?autoplay=1${adBlockParams}`;
    }
  },
  {
    name: 'DbGo',
    getUrl: (tmdbId, type, season, episode) => {
      if (type === 'tv' && season && episode) {
        return `https://www.dbgo.fun/tv/${tmdbId}/${season}/${episode}?autoplay=1${adBlockParams}`;
      }
      return `https://www.dbgo.fun/movie/${tmdbId}?autoplay=1${adBlockParams}`;
    }
  },
   {
    name: 'VidSrc',
    getUrl: (tmdbId, type, season, episode) => {
      const baseUrl = `https://vidsrc.to/embed/${type}/${tmdbId}`;
      if (type === 'tv' && season && episode) {
        return `${baseUrl}/${season}/${episode}?autoplay=1${adBlockParams}`;
      }
      return `${baseUrl}?autoplay=1${adBlockParams}`;
    }
  }

];
 
export const getStreamingUrl = (
  tmdbId: number, 
  type: 'movie' | 'tv', 
  sourceIndex: number = 0,
  season?: number,
  episode?: number
): string => {
  const source = streamingSources[sourceIndex] || streamingSources[0];
  return source.getUrl(tmdbId, type, season, episode);
};
