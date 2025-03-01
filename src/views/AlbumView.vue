<template>
  <div class="album-view" v-if="album">
    <div class="album-header">
      <div class="album-cover">
        <img :src="album.cover" :alt="album.title" />
      </div>
      <div class="album-info">
        <span class="album-type">Álbum</span>
        <h1>{{ album.title }}</h1>
        <div class="album-meta">
          <img :src="album.artistImage" :alt="album.artist" class="artist-avatar" />
          <span class="artist-name" @click="navigateToArtist(album.artistId)">{{ album.artist }}</span>
          <span class="separator">•</span>
          <span class="year">{{ album.year }}</span>
          <span class="separator">•</span>
          <span class="tracks-count">{{ album.tracks.length }} canciones</span>
          <span class="separator">•</span>
          <span class="duration">{{ formatTotalDuration }}</span>
        </div>
      </div>
    </div>

    <div class="album-actions">
      <button class="play-btn" @click="playAlbum">
        <span>▶️</span> Reproducir
      </button>
      <button class="like-btn" @click="toggleLike">
        <span>{{ isLiked ? '❤️' : '🤍' }}</span>
      </button>
    </div>

    <div v-if="isLoading" class="loading-section">
      <div class="loader"></div>
      <p>Cargando álbum...</p>
    </div>

    <div v-else class="tracks-section">
      <div class="tracks-header">
        <div class="track-number">#</div>
        <div class="track-title">Título</div>
        <div class="track-duration">⏱️</div>
      </div>
      
      <div class="tracks-list">
        <div 
          v-for="(track, index) in album.tracks" 
          :key="track.id"
          class="track-item"
          @click="playTrack(track)"
        >
          <div class="track-number">{{ index + 1 }}</div>
          <div class="track-info">
            <div class="track-title">{{ track.title }}</div>
            <div class="track-artist">{{ track.artist }}</div>
          </div>
          <div class="track-duration">{{ formatTime(track.duration) }}</div>
          <button class="play-btn" @click.stop="playTrack(track)">
            <span>▶️</span>
          </button>
        </div>
      </div>
    </div>

    <section class="album-details">
      <div class="release-info">
        <h3>Información</h3>
        <p class="release-date">{{ formatReleaseDate(album.releaseDate) }}</p>
        <p class="genre">{{ album.genre }}</p>
        <p class="label">{{ album.label }}</p>
      </div>
      
      <div class="copyright">
        <p>{{ album.copyright }}</p>
      </div>
    </section>
  </div>
  
  <div v-else class="not-found">
    <h2>Álbum no encontrado</h2>
    <p>No pudimos encontrar el álbum que estás buscando.</p>
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
const album = ref(null);
const isLoading = ref(true);
const isLiked = ref(false);

// Computed
const formatTotalDuration = computed(() => {
  if (!album.value?.tracks) return '0:00';
  
  const totalSeconds = album.value.tracks.reduce((total, track) => total + track.duration, 0);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours} h ${minutes} min`;
  }
  return `${minutes} min`;
});

// Methods
const formatTime = (seconds) => {
  if (!seconds) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const formatReleaseDate = (date) => {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const playAlbum = () => {
  if (album.value?.tracks.length > 0) {
    playerStore.setQueue(album.value.tracks, 0);
  }
};

const playTrack = (track) => {
  playerStore.setQueue(album.value.tracks, album.value.tracks.indexOf(track));
};

const toggleLike = () => {
  isLiked.value = !isLiked.value;
  // Aquí iría la lógica para guardar el like en una API real
};

const navigateToArtist = (artistId) => {
  router.push({ name: 'artist', params: { id: artistId } });
};

// Cargar datos del álbum
const loadAlbumData = async () => {
  isLoading.value = true;
  
  try {
    // Aquí iría la llamada real a la API
    // Por ahora, simulamos una carga con datos de ejemplo
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const albumId = route.params.id;
    album.value = generateMockAlbum(albumId);
  } catch (error) {
    console.error('Error loading album data:', error);
  } finally {
    isLoading.value = false;
  }
};

// Función para generar datos de ejemplo
function generateMockAlbum(id) {
  const albumId = id || 'album-1';
  const artistId = `artist-${albumId.split('-')[1] || '1'}`;
  const artistName = `Artista ${artistId.split('-')[1]}`;
  const albumTitle = `Álbum ${albumId.split('-')[1] || '1'} de ${artistName}`;
  
  const tracks = [];
  const trackCount = 10 + Math.floor(Math.random() * 5);
  
  for (let i = 1; i <= trackCount; i++) {
    tracks.push({
      id: `track-${i}-${albumId}`,
      title: `Canción ${i} de ${albumTitle}`,
      artist: artistName,
      duration: 180 + Math.floor(Math.random() * 120),
      cover: `https://picsum.photos/id/${(i * 10) + parseInt(albumId.split('-')[1] || '1')}/300/300`,
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
    });
  }
  
  return {
    id: albumId,
    title: albumTitle,
    artist: artistName,
    artistId: artistId,
    artistImage: `https://picsum.photos/id/${parseInt(artistId.split('-')[1] || '1') * 20}/300/300`,
    cover: `https://picsum.photos/id/${parseInt(albumId.split('-')[1] || '1') * 30}/500/500`,
    year: 2020 - Math.floor(Math.random() * 5),
    releaseDate: new Date(2020 - Math.floor(Math.random() * 5), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
    genre: ['Rock', 'Pop', 'Hip Hop', 'Electrónica', 'Jazz'][Math.floor(Math.random() * 5)],
    label: ['Universal Music', 'Sony Music', 'Warner Music', 'Independent'][Math.floor(Math.random() * 4)],
    copyright: `© ${new Date().getFullYear()} ${artistName}. Todos los derechos reservados.`,
    tracks: tracks
  };
}

// Cargar datos al montar el componente
onMounted(() => {
  loadAlbumData();
});
</script>

<style lang="scss" scoped>
.album-view {
  padding-bottom: 120px;
}

.album-header {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  
  .album-cover {
    flex-shrink: 0;
    width: 300px;
    height: 300px;
    box-shadow: 0 4px 60px rgba(0,0,0,0.5);
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  
  .album-info {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    
    .album-type {
      font-size: 0.9rem;
      text-transform: uppercase;
      margin-bottom: 0.5rem;
    }
    
    h1 {
      font-size: 3rem;
      margin: 0 0 1rem;
    }
    
    .album-meta {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      
      .artist-avatar {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        object-fit: cover;
      }
      
      .artist-name {
        cursor: pointer;
        font-weight: 600;
        
        &:hover {
          text-decoration: underline;
        }
      }
      
      .separator {
        color: var(--secondary-color);
      }
    }
  }
}

.album-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  
  .play-btn, .like-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
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
  
  .like-btn {
    background-color: transparent;
    border: 1px solid var(--border-color);
    
    &:hover {
      background-color: var(--hover-color);
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
  margin-bottom: 2rem;
  
  .tracks-header {
    display: grid;
    grid-template-columns: 50px 1fr 100px;
    padding: 0.5rem 1rem;
    border-bottom: 1px solid var(--border-color);
    color: var(--secondary-color);
    font-size: 0.9rem;
  }
  
  .tracks-list {
    .track-item {
      display: grid;
      grid-template-columns: 50px 1fr 100px;
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

.album-details {
  color: var(--secondary-color);
  font-size: 0.9rem;
  
  h3 {
    color: var(--text-color);
    margin-bottom: 1rem;
  }
  
  .release-info {
    margin-bottom: 2rem;
    
    p {
      margin-bottom: 0.5rem;
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
    .album-header {
      flex-direction: column;
      align-items: center;
      text-align: center;
      
      .album-cover {
        width: 200px;
        height: 200px;
      }
      
      .album-info {
        h1 {
          font-size: 2rem;
        }
        
        .album-meta {
          justify-content: center;
          flex-wrap: wrap;
        }
      }
    }
    .album-actions {
      justify-content: center;
    }
    .tracks-section {
      .tracks-header {
        grid-template-columns: 50px 1fr 80px;
      }
      .tracks-list .track-item {
        grid-template-columns: 50px 1fr 80px;
      }
    }
  }

</style>