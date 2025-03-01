<template>
  <div class="library-view">
    <h1>Mi Biblioteca</h1>
    
    <div class="library-tabs">
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'playlists' }"
        @click="activeTab = 'playlists'"
      >
        Playlists
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'favorites' }"
        @click="activeTab = 'favorites'"
      >
        Favoritos
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'recent' }"
        @click="activeTab = 'recent'"
      >
        Recientes
      </button>
    </div>
    
    <!-- Playlists Tab -->
    <div v-if="activeTab === 'playlists'" class="playlists-section">
      <div class="create-playlist">
        <input 
          type="text" 
          v-model="newPlaylistName" 
          placeholder="Nombre de la nueva playlist" 
          @keyup.enter="createPlaylist"
        />
        <button @click="createPlaylist">Crear Playlist</button>
      </div>
      
      <div v-if="playlists.length === 0" class="empty-state">
        <p>No tienes playlists creadas. ¡Crea tu primera playlist!</p>
      </div>
      
      <div v-else class="playlists-grid">
        <div 
          v-for="playlist in playlists" 
          :key="playlist.id" 
          class="playlist-card"
          @click="navigateToPlaylist(playlist)"
        >
          <div class="playlist-cover">
            <img :src="getPlaylistCover(playlist)" :alt="playlist.name" />
          </div>
          <div class="playlist-info">
            <h3>{{ playlist.name }}</h3>
            <p>{{ playlist.tracks.length }} canciones</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Favorites Tab -->
    <div v-else-if="activeTab === 'favorites'" class="favorites-section">
      <div v-if="favorites.length === 0" class="empty-state">
        <p>No tienes canciones favoritas. Añade canciones a tus favoritos.</p>
      </div>
      
      <div v-else class="tracks-grid">
        <TrackCard 
          v-for="track in favorites" 
          :key="track.id"
          :track="track"
          :trackList="favorites"
          @play="playTrack"
        />
      </div>
    </div>
    
    <!-- Recent Tab -->
    <div v-else-if="activeTab === 'recent'" class="recent-section">
      <div v-if="recentTracks.length === 0" class="empty-state">
        <p>No has escuchado canciones recientemente.</p>
      </div>
      
      <div v-else class="tracks-grid">
        <TrackCard 
          v-for="track in recentTracks" 
          :key="track.id"
          :track="track"
          :trackList="recentTracks"
          @play="playTrack"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { usePlayerStore } from '../stores/player';
import TrackCard from '../components/TrackCard.vue';

const router = useRouter();
const playerStore = usePlayerStore();

// Estado
const activeTab = ref('playlists');
const playlists = ref([]);
const favorites = ref([]);
const recentTracks = ref([]);
const newPlaylistName = ref('');

// Método para crear una nueva playlist
const createPlaylist = () => {
  if (!newPlaylistName.value.trim()) return;
  
  const newPlaylist = {
    id: Date.now().toString(),
    name: newPlaylistName.value.trim(),
    tracks: [],
    createdAt: new Date().toISOString()
  };
  
  playlists.value.push(newPlaylist);
  savePlaylists();
  newPlaylistName.value = '';
  
  // Navegar a la nueva playlist
  router.push({ name: 'playlist', params: { id: newPlaylist.id } });
};

// Método para navegar a una playlist
const navigateToPlaylist = (playlist) => {
  router.push({ name: 'playlist', params: { id: playlist.id } });
};

// Método para obtener la portada de una playlist
const getPlaylistCover = (playlist) => {
  if (playlist.tracks.length > 0) {
    return playlist.tracks[0].cover;
  }
  return 'https://via.placeholder.com/300?text=Playlist';
};

// Método para reproducir una canción
const playTrack = (track, trackList) => {
  // Verificar si el usuario está autenticado
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  
  if (!isLoggedIn) {
    alert('Debes iniciar sesión para reproducir música');
    router.push('/login');
    return;
  }
  
  if (!track || !trackList || trackList.length === 0) return;
  
  const startIndex = trackList.findIndex(t => t.id === track.id);
  
  if (startIndex !== -1) {
    const tracksCopy = JSON.parse(JSON.stringify(trackList));
    playerStore.setQueue(tracksCopy, startIndex);
  }
};

// Método para guardar las playlists en localStorage
const savePlaylists = () => {
  try {
    localStorage.setItem('musicPlayerPlaylists', JSON.stringify(playlists.value));
  } catch (error) {
    console.error('Error saving playlists:', error);
  }
};

// Cargar datos al montar el componente
onMounted(() => {
  // Cargar playlists
  try {
    const storedPlaylists = localStorage.getItem('musicPlayerPlaylists');
    if (storedPlaylists) {
      playlists.value = JSON.parse(storedPlaylists);
    }
  } catch (error) {
    console.error('Error loading playlists:', error);
  }
  
  // Cargar favoritos
  try {
    const storedFavorites = localStorage.getItem('musicPlayerFavorites');
    if (storedFavorites) {
      favorites.value = JSON.parse(storedFavorites);
    }
  } catch (error) {
    console.error('Error loading favorites:', error);
  }
  
  // Cargar recientes
  try {
    const storedRecent = localStorage.getItem('recentlyPlayed');
    if (storedRecent) {
      recentTracks.value = JSON.parse(storedRecent);
    }
  } catch (error) {
    console.error('Error loading recent tracks:', error);
  }
});
</script>

<style lang="scss" scoped>
.library-view {
  padding-bottom: 120px;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
}

.library-tabs {
  display: flex;
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--border-color);
  
  .tab-btn {
    background: none;
    border: none;
    padding: 1rem 1.5rem;
    font-size: 1rem;
    cursor: pointer;
    color: var(--secondary-color);
    position: relative;
    
    &.active {
      color: var(--accent-color);
      font-weight: 600;
      
      &::after {
        content: '';
        position: absolute;
        bottom: -1px;
        left: 0;
        width: 100%;
        height: 2px;
        background-color: var(--accent-color);
      }
    }
    
    &:hover:not(.active) {
      color: var(--text-color);
    }
  }
}

.create-playlist {
  display: flex;
  margin-bottom: 2rem;
  
  input {
    flex: 1;
    padding: 0.8rem 1rem;
    border: 1px solid var(--border-color);
    border-radius: 4px 0 0 4px;
    background-color: var(--background-color-light);
    color: var(--text-color);
    font-size: 1rem;
    
    &:focus {
      outline: none;
      border-color: var(--accent-color);
    }
  }
  
  button {
    padding: 0.8rem 1.5rem;
    background-color: var(--accent-color);
    color: white;
    border: none;
    border-radius: 0 4px 4px 0;
    cursor: pointer;
    font-weight: 600;
    transition: background-color 0.2s;
    
    &:hover {
      background-color: #19a34a; /* Darker accent color */
    }
  }
}

.empty-state {
  text-align: center;
  padding: 3rem 0;
  color: var(--secondary-color);
}

.playlists-grid, .tracks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
}

.playlist-card {
  cursor: pointer;
  transition: transform 0.3s;
  
  &:hover {
    transform: translateY(-5px);
  }
  
  .playlist-cover {
    width: 100%;
    aspect-ratio: 1;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 0.8rem;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  
  .playlist-info {
    h3 {
      font-size: 1rem;
      margin: 0 0 0.3rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    p {
      color: var(--secondary-color);
      font-size: 0.8rem;
      margin: 0;
    }
  }
}

@media (max-width: 768px) {
  .library-tabs {
    overflow-x: auto;
    white-space: nowrap;
    
    .tab-btn {
      padding: 1rem;
    }
  }
  
  .playlists-grid, .tracks-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }
}
</style>