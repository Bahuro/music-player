<template>
  <div class="genre-view" v-if="genre">
    <div class="genre-header">
      <div class="genre-cover-container">
        <img :src="genre.cover" :alt="genre.name" class="genre-cover" />
        <div class="genre-overlay"></div>
      </div>
      <div class="genre-info">
        <span class="genre-type">Género</span>
        <h1>{{ genre.name }}</h1>
        <p class="genre-stats">{{ genre.trackCount }} canciones</p>
      </div>
    </div>

    <div v-if="isLoading" class="loading-section">
      <div class="loader"></div>
      <p>Cargando canciones...</p>
    </div>

    <div v-else class="tracks-section">
      <div class="tracks-header">
        <div class="track-number">#</div>
        <div class="track-info">Título</div>
        <div class="track-album">Álbum</div>
        <div class="track-duration">⏱️</div>
      </div>
      
      <div class="tracks-list">
        <div 
          v-for="(track, index) in tracks" 
          :key="track.id"
          class="track-item"
          @click="playTrack(track)"
        >
          <div class="track-number">{{ index + 1 }}</div>
          <div class="track-info">
            <div class="track-title">{{ track.title }}</div>
            <div class="track-artist">{{ track.artist }}</div>
          </div>
          <div class="track-album">{{ track.album }}</div>
          <div class="track-duration">{{ formatTime(track.duration) }}</div>
          <button class="play-btn" @click.stop="playTrack(track)">
            <span>▶️</span>
          </button>
        </div>
      </div>
    </div>
  </div>
  
  <div v-else class="not-found">
    <h2>Género no encontrado</h2>
    <p>No pudimos encontrar el género que estás buscando.</p>
    <button @click="$router.push('/')" class="back-btn">Volver al inicio</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePlayerStore } from '../stores/player';

const route = useRoute();
const router = useRouter();
const playerStore = usePlayerStore();

// State
const genre = ref(null);
const tracks = ref([]);
const isLoading = ref(true);

// Methods
const formatTime = (seconds) => {
  if (!seconds) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const playTrack = (track) => {
  // Verificar si el usuario está autenticado
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  
  if (!isLoggedIn) {
    alert('Debes iniciar sesión para reproducir música');
    router.push('/login');
    return;
  }
  
  // Asegurarse de que la canción y la lista son válidas
  if (!track || tracks.value.length === 0) {
    console.error('Canción o lista inválida');
    return;
  }
  
  // Encontrar el índice correcto
  const startIndex = tracks.value.findIndex(t => t.id === track.id);
  
  if (startIndex !== -1) {
    // Crear copias para evitar problemas de referencia
    const tracksCopy = JSON.parse(JSON.stringify(tracks.value));
    playerStore.setQueue(tracksCopy, startIndex);
  }
};

// Cargar datos del género
const loadGenreData = async () => {
  // Verificar si el usuario está autenticado
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  
  if (!isLoggedIn) {
    alert('Debes iniciar sesión para ver detalles del género');
    router.push('/login');
    return;
  }
  
  isLoading.value = true;
  
  try {
    // Aquí iría la llamada real a la API
    // Por ahora, simulamos una carga con datos de ejemplo
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const genreId = route.params.id;
    const mockData = generateMockGenreData(genreId);
    
    genre.value = mockData.genre;
    tracks.value = mockData.tracks;
  } catch (error) {
    console.error('Error loading genre data:', error);
  } finally {
    isLoading.value = false;
  }
};

// Generar datos de ejemplo
const generateMockGenreData = (genreId) => {
  // Datos de ejemplo para el género
  const genreData = {
    genre: {
      id: genreId,
      name: `Género ${genreId}`,
      cover: `https://picsum.photos/id/${genreId * 10}/800/400`,
      trackCount: 20
    },
    tracks: []
  };
  
  // Generar canciones de ejemplo
  for (let i = 1; i <= 20; i++) {
    genreData.tracks.push({
      id: `track-${genreId}-${i}`,
      title: `Canción ${i} del Género ${genreId}`,
      artist: `Artista ${i}`,
      album: `Álbum ${Math.ceil(i / 4)}`,
      duration: 180 + Math.floor(Math.random() * 120),
      cover: `https://picsum.photos/id/${i * 5}/300/300`,
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
    });
  }
  
  return genreData;
};

onMounted(() => {
  loadGenreData();
});
</script>

<style lang="scss" scoped>
.genre-view {
  padding-bottom: 120px;
}

.genre-header {
  position: relative;
  margin-bottom: 2rem;
  
  .genre-cover-container {
    position: relative;
    width: 100%;
    height: 300px;
    overflow: hidden;
    
    .genre-cover {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .genre-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.8) 100%);
    }
  }
  
  .genre-info {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    padding: 2rem;
    color: white;
    
    .genre-type {
      font-size: 0.9rem;
      text-transform: uppercase;
      margin-bottom: 0.5rem;
      display: block;
    }
    
    h1 {
      font-size: 3rem;
      margin: 0 0 0.5rem;
      text-shadow: 0 2px 4px rgba(0,0,0,0.5);
    }
    
    .genre-stats {
      font-size: 1.1rem;
      margin: 0;
      opacity: 0.9;
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

.tracks-section {
  .tracks-header {
    display: grid;
    grid-template-columns: 50px 1fr 200px 100px;
    padding: 0.5rem 1rem;
    border-bottom: 1px solid var(--border-color);
    color: var(--secondary-color);
    font-size: 0.9rem;
  }
  
  .tracks-list {
    .track-item {
      display: grid;
      grid-template-columns: 50px 1fr 200px 100px;
      align-items: center;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s;
      
      &:hover {
        background-color: var(--hover-color);
        
        .play-btn {
          opacity: 1;
        }
      }
      
      .track-number {
        color: var(--secondary-color);
      }
      
      .track-info {
        .track-title {
          font-size: 0.9rem;
          margin-bottom: 0.2rem;
        }
        
        .track-artist {
          font-size: 0.8rem;
          color: var(--secondary-color);
        }
      }
      
      .track-album {
        color: var(--secondary-color);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .track-duration {
        color: var(--secondary-color);
        text-align: right;
      }
      
      .play-btn {
        background: none;
        border: none;
        font-size: 1.2rem;
        cursor: pointer;
        opacity: 0;
        transition: opacity 0.2s;
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
  .genre-header {
    .genre-cover-container {
      height: 200px;
    }
    
    .genre-info {
      h1 {
        font-size: 2rem;
      }
    }
  }
  
  .tracks-section {
    .tracks-header, .tracks-list .track-item {
      grid-template-columns: 50px 1fr 80px;
      
      .track-album {
        display: none;
      }
    }
  }
}
</style>