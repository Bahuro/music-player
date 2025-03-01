import axios from 'axios';

const JAMENDO_API_URL = 'https://api.jamendo.com/v3.0';
// Use the client ID from environment variables
const CLIENT_ID = import.meta.env.VITE_JAMENDO_CLIENT_ID;

const api = axios.create({
  baseURL: JAMENDO_API_URL,
  params: {
    client_id: CLIENT_ID,
    format: 'json'
  }
});

// Obtener canciones destacadas
export const getFeaturedTracks = async (limit = 20) => {
  try {
    const response = await api.get('/tracks/', {
      params: {
        limit,
        boost: 'popularity_total',
        include: 'musicinfo',
        audioformat: 'mp32'
      }
    });
    
    if (response.data && response.data.results) {
      console.log('Tracks obtenidos:', response.data.results.length);
      return mapTracks(response.data.results);
    } else {
      console.error('Respuesta inesperada de la API:', response.data);
      return getLocalTracks().slice(0, limit);
    }
  } catch (error) {
    console.error('Error fetching featured tracks:', error);
    return getLocalTracks().slice(0, limit);
  }
};

// Obtener nuevos lanzamientos
export const getNewReleases = async (limit = 20) => {
  try {
    const response = await api.get('/tracks/', {
      params: {
        limit,
        order: 'releasedate_desc',
        include: 'musicinfo',
        audioformat: 'mp32'
      }
    });
    
    if (response.data && response.data.results) {
      return mapTracks(response.data.results);
    }
    return getLocalTracks().slice(0, limit);
  } catch (error) {
    console.error('Error fetching new releases:', error);
    return getLocalTracks().slice(0, limit);
  }
};

// Buscar canciones
export const searchTracks = async (query, limit = 20) => {
  try {
    const response = await api.get('/tracks/search', {
      params: {
        search: query,
        limit,
        include: 'musicinfo',
        audioformat: 'mp32'
      }
    });
    
    if (response.data && response.data.results) {
      return mapTracks(response.data.results);
    }
    return [];
  } catch (error) {
    console.error('Error searching tracks:', error);
    return [];
  }
};

// Obtener géneros
export const getGenres = async () => {
  try {
    const response = await api.get('/tags', {
      params: {
        type: 'genre',
        order: 'count_desc',
        limit: 20
      }
    });
    
    if (response.data && response.data.results) {
      return response.data.results.map(genre => ({
        id: genre.id,
        name: genre.name,
        cover: `https://picsum.photos/seed/${genre.name}/400/400`,
        trackCount: genre.count
      }));
    }
    return getLocalGenres();
  } catch (error) {
    console.error('Error fetching genres:', error);
    return getLocalGenres();
  }
};

// Obtener canciones por género
export const getTracksByGenre = async (genreId, limit = 50) => {
  try {
    const response = await api.get('/tracks/', {
      params: {
        tags: genreId,
        limit,
        include: 'musicinfo',
        audioformat: 'mp32'
      }
    });
    
    if (response.data && response.data.results) {
      return mapTracks(response.data.results);
    }
    return getLocalTracks().filter(track => track.genre.toLowerCase() === genreId.toLowerCase()).slice(0, limit);
  } catch (error) {
    console.error('Error fetching tracks by genre:', error);
    return getLocalTracks().filter(track => track.genre.toLowerCase() === genreId.toLowerCase()).slice(0, limit);
  }
};

// Mapear datos de la API a nuestro formato
function mapTracks(apiTracks) {
  return apiTracks.map(track => ({
    id: track.id,
    title: track.name,
    artist: track.artist_name,
    album: track.album_name || 'Single',
    genre: track.musicinfo?.tags?.genres?.[0] || 'Unknown',
    duration: track.duration,
    cover: track.image,
    url: track.audio
  }));
}

// Datos locales como fallback
function getLocalTracks() {
  return [
    {
      id: 'local-1',
      title: 'Epic Journey',
      artist: 'Scott Buckley',
      album: 'Cinematic Atmospheres',
      genre: 'electronic',
      duration: 245,
      cover: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&auto=format&fit=crop',
      url: 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Scott_Buckley/Cinematic_Ambient_Electronic/Scott_Buckley_-_01_-_Epic_Journey.mp3'
    },
    // Más canciones de fallback...
  ];
}

function getLocalGenres() {
  return [
    { id: 'electronic', name: 'Electrónica', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop', trackCount: 42 },
    { id: 'ambient', name: 'Ambient', cover: 'https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?w=800&auto=format&fit=crop', trackCount: 38 },
    { id: 'jazz', name: 'Jazz', cover: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&auto=format&fit=crop', trackCount: 25 },
    { id: 'classical', name: 'Clásica', cover: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800&auto=format&fit=crop', trackCount: 31 },
    { id: 'rock', name: 'Rock', cover: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=800&auto=format&fit=crop', trackCount: 29 },
    { id: 'acoustic', name: 'Acústica', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop', trackCount: 36 }
  ];
}