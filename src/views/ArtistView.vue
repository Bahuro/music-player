<template>
  <div class="artist-view" v-if="artist">
    <div class="artist-header">
      <div class="artist-cover-container">
        <img :src="artist.image" :alt="artist.name" class="artist-cover" />
        <div class="artist-overlay"></div>
      </div>
      <div class="artist-info">
        <h1>{{ artist.name }}</h1>
        <p class="artist-followers">{{ formatNumber(artist.followers) }} seguidores</p>
        <div class="artist-actions">
          <button class="play-btn" @click="playAllTracks">
            Reproducir
          </button>
          <button class="follow-btn" @click="toggleFollow">
            {{ isFollowing ? 'Siguiendo' : 'Seguir' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="isLoading" class="loading-section">
      <div class="loader"></div>
      <p>Cargando...</p>
    </div>

    <template v-else>
      <section class="popular-tracks-section">
        <h2>Populares</h2>
        <div class="tracks-list">
          <div 
            v-for="(track, index) in popularTracks" 
            :key="track.id"
            class="track-item"
            @click="playTrack(track, popularTracks)"
          >
            <div class="track-number">{{ index + 1 }}</div>
            <img :src="track.cover" :alt="track.title" class="track-cover" />
            <div class="track-details">
              <h3 class="track-title">{{ track.title }}</h3>
              <p class="track-artist">{{ track.artist }}</p>
            </div>
            <div class="track-album">{{ track.album }}</div>
            <div class="track-duration">{{ formatTime(track.duration) }}</div>
            <button class="play-btn" @click.stop="playTrack(track, popularTracks)">
              <span>▶️</span>
            </button>
          </div>
        </div>
      </section>

      <section class="albums-section">
        <h2>Álbumes</h2>
        <div class="albums-grid">
          <div 
            v-for="album in albums" 
            :key="album.id"
            class="album-card"
            @click="navigateToAlbum(album)"
          >
            <img :src="album.cover" :alt="album.title" class="album-cover" />
            <div class="album-info">
              <h3 class="album-title">{{ album.title }}</h3>
              <p class="album-year">{{ album.year }}</p>
            </div>
          </div>
        </div>
      </section>

      <section class="about-section">
        <h2>Acerca de</h2>
        <div class="artist-bio" v-html="artist.bio"></div>
        
        <div class="artist-stats">
          <div class="stat-item">
            <span class="stat-value">{{ formatNumber(artist.monthlyListeners) }}</span>
            <span class="stat-label">Oyentes mensuales</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ artist.albums.length }}</span>
            <span class="stat-label">Álbumes</span>
          </div>
        </div>
      </section>
    </template>
  </div>
  <div v-else class="not-found">
    <h2>Artista no encontrado</h2>
    <p>No pudimos encontrar el artista que estás buscando.</p>
    <button @click="$router.push('/')" class="back-btn">Volver al inicio</button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePlayerStore } from '../stores/player';

const route = useRoute();
const router = useRouter();
const playerStore = usePlayerStore();

// State
const artist = ref(null);
const popularTracks = ref([]);
const albums = ref([]);
const isLoading = ref(true);
const isFollowing = ref(false);

// Methods
const formatTime = (seconds) => {
  if (!seconds) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const formatNumber = (num) => {
  if (!num) return '0';
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

const playTrack = (track, trackList) => {
  // Verificar si el usuario está autenticado
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  
  if (!isLoggedIn) {
    alert('Debes iniciar sesión para reproducir música');
    router.push('/login');
    return;
  }

  if (!track || !trackList || trackList.length === 0) {
    console.error('Canción o lista inválida');
    return;
  }

  playerStore.setQueue(trackList, trackList.indexOf(track));
};

const playAllTracks = () => {
  // Verificar si el usuario está autenticado
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  
  if (!isLoggedIn) {
    alert('Debes iniciar sesión para reproducir música');
    router.push('/login');
    return;
  }

  if (popularTracks.value.length > 0) {
    playerStore.setQueue(popularTracks.value, 0);
  }
};

const toggleFollow = () => {
  isFollowing.value = !isFollowing.value;
  // Aquí iría la lógica para seguir/dejar de seguir al artista en una API real
};

const navigateToAlbum = (album) => {
  router.push({ name: 'album', params: { id: album.id } });
};

// Cargar datos del artista
const loadArtistData = async () => {
  isLoading.value = true;
  
  try {
    // Aquí iría la llamada real a la API
    // Por ahora, simulamos una carga con datos de ejemplo
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const artistId = route.params.id;
    const mockArtist = generateMockArtist(artistId);
    
    artist.value = mockArtist;
    popularTracks.value = generateMockTracks(10, artistId);
    albums.value = mockArtist.albums;
  } catch (error) {
    console.error('Error loading artist data:', error);
  } finally {
    isLoading.value = false;
  }
};

// Funciones para generar datos de ejemplo
function generateMockArtist(id) {
  const artistId = id || 'artist-1';
  const artistName = `Artista ${artistId.split('-')[1] || '1'}`;
  
  const mockAlbums = [];
  for (let i = 1; i <= 6; i++) {
    mockAlbums.push({
      id: `album-${i}-${artistId}`,
      title: `Álbum ${i} de ${artistName}`,
      artist: artistName,
      year: 2020 - i,
      cover: `https://picsum.photos/id/${(i * 30) + parseInt(artistId.split('-')[1] || '1')}/300/300`
    });
  }
  
  return {
    id: artistId,
    name: artistName,
    image: `https://picsum.photos/id/${parseInt(artistId.split('-')[1] || '1') * 20}/800/500`,
    followers: 125000 + Math.floor(Math.random() * 900000),
    monthlyListeners: 2500000 + Math.floor(Math.random() * 7500000),
    bio: `<p>${artistName} es un artista reconocido mundialmente por su estilo único y su capacidad para fusionar diferentes géneros musicales.</p>
          <p>Con una carrera que abarca más de una década, ha lanzado múltiples álbumes aclamados por la crítica y ha realizado giras por todo el mundo.</p>
          <p>Su música se caracteriza por letras profundas y melodías pegadizas que han resonado con millones de fans.</p>`,
    albums: mockAlbums
  };
}

function generateMockTracks(count, artistId) {
  const tracks = [];
  const artistName = `Artista ${artistId.split('-')[1] || '1'}`;
  
  for (let i = 1; i <= count; i++) {
    tracks.push({
      id: `track-${i}-${artistId}`,
      title: `Canción ${i} de ${artistName}`,
      artist: artistName,
      album: `Álbum ${Math.ceil(i/2)} de ${artistName}`,
      duration: 180 + Math.floor(Math.random() * 120),
      cover: `https://picsum.photos/id/${(i * 10) + parseInt(artistId.split('-')[1] || '1')}/300/300`,
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
    });
  }
  
  return tracks;
}

// Cargar datos al montar el componente
onMounted(() => {
  loadArtistData();
});
</script>

<style lang="scss" scoped>
.artist-view {
  padding-bottom: 120px;
}

.artist-header {
  position: relative;
  margin-bottom: 2rem;
  
  .artist-cover-container {
    position: relative;
    width: 100%;
    height: 300px;
    overflow: hidden;
    
    .artist-cover {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .artist-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.8) 100%);
    }
  }
  
  .artist-info {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    padding: 2rem;
    color: white;
    
    h1 {
      font-size: 3rem;
      margin: 0 0 0.5rem;
      text-shadow: 0 2px 4px rgba(0,0,0,0.5);
    }
    
    .artist-followers {
      font-size: 1rem;
      margin: 0 0 1.5rem;
      opacity: 0.9;
    }
    
    .artist-actions {
      display: flex;
      gap: 1rem;
      
      .play-btn, .follow-btn {
        padding: 0.8rem 2rem;
        border-radius: 50px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .play-btn {
        background-color: var(--accent-color);
        color: white;
        border: none;
        
        &:hover {
          background-color: #19a34a;
          transform: scale(1.05);
        }
      }
      
      .follow-btn {
        background-color: transparent;
        color: white;
        border: 1px solid white;
        
        &:hover {
          background-color: rgba(255,255,255,0.1);
        }
      }
    }
  }
}

.loading-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem 0;
  
  .loader {
    width: 40px;
    height: 40px;
    border: 4px solid var(--border-color);
    border-bottom-color: var(--accent-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
}

section {
  margin-bottom: 3rem;
  
  h2 {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
  }
}

.tracks-list {
  .track-item {
    display: grid;
    grid-template-columns: 50px 60px 1fr 200px 100px 50px;
    align-items: center;
    padding: 0.5rem;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.2s;
    
    &:hover {
      background-color: var(--hover-color);
    }
    
    .track-number {
      text-align: center;
      color: var(--secondary-color);
    }
    
    .track-cover {
      width: 40px;
      height: 40px;
      border-radius: 4px;
      object-fit: cover;
    }
    
    .track-details {
      padding: 0 1rem;
      overflow: hidden;
      
      .track-title {
        font-size: 0.9rem;
        margin: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .track-artist {
        font-size: 0.8rem;
        color: var(--secondary-color);
        margin: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
    
    .track-album {
      color: var(--secondary-color);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .track-duration {
      text-align: right;
      color: var(--secondary-color);
    }
    
    .play-btn {
      background: none;
      border: none;
      font-size: 1.2rem;
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.2s;
    }
    
    &:hover .play-btn {
      opacity: 1;
    }
  }
}

.albums-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.5rem;
}

.album-card {
  cursor: pointer;
  transition: transform 0.3s;
  
  &:hover {
    transform: translateY(-5px);
  }
  
  .album-cover {
    width: 100%;
    aspect-ratio: 1;
    object-fit: cover;
    border-radius: 8px;
    margin-bottom: 0.8rem;
  }
  
  .album-info {
    .album-title {
      font-size: 0.9rem;
      margin: 0 0 0.3rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .album-year {
      color: var(--secondary-color);
      font-size: 0.8rem;
      margin: 0;
    }
  }
}

.about-section {
  .artist-bio {
    font-size: 1rem;
    line-height: 1.6;
    color: var(--text-color);
    margin-bottom: 2rem;
    
    p {
      margin-bottom: 1rem;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
  
  .artist-stats {
    display: flex;
    gap: 2rem;
    
    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      
      .stat-value {
        font-size: 1.5rem;
        font-weight: 600;
        margin-bottom: 0.3rem;
      }
      
      .stat-label {
        color: var(--secondary-color);
        font-size: 0.9rem;
      }
    }
  }
}

.not-found {
  text-align: center;
  padding: 3rem 0;
  
  h2 {
    font-size: 2rem;
    margin-bottom: 1rem;
  }
  
  p {
    color: var(--secondary-color);
    margin-bottom: 2rem;
  }
  
  .back-btn {
    padding: 0.8rem 2rem;
    background-color: var(--accent-color);
    color: white;
    border: none;
    border-radius: 50px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      background-color: #19a34a;
      transform: scale(1.05);
    }
  }
}

@media (max-width: 768px) {
  .artist-header {
    .artist-cover-container {
      height: 200px;
    }
    
    .artist-info {
      h1 {
        font-size: 2rem;
      }
    }
  }
  
  .tracks-list .track-item {
    grid-template-columns: 40px 50px 1fr 50px;
    
    .track-album {
      display: none;
    }
    
    .track-duration {
      display: none;
    }
  }
  
  .albums-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }
  
  .about-section {
    .artist-stats {
      flex-wrap: wrap;
    }
  }
}
</style>