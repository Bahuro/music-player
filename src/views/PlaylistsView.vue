<template>
  <div class="playlists-view">
    <h1>Mis Playlists</h1>
    
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
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { v4 as uuidv4 } from 'uuid';

const router = useRouter();
const playlists = ref([]);
const newPlaylistName = ref('');

// Método para crear una nueva playlist
const createPlaylist = () => {
  if (!newPlaylistName.value.trim()) return;
  
  const newPlaylist = {
    id: uuidv4(),
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

// Método para guardar las playlists en localStorage
const savePlaylists = () => {
  try {
    localStorage.setItem('musicPlayerPlaylists', JSON.stringify(playlists.value));
  } catch (error) {
    console.error('Error saving playlists:', error);
  }
};

// Cargar playlists al montar el componente
onMounted(() => {
  try {
    const storedPlaylists = localStorage.getItem('musicPlayerPlaylists');
    if (storedPlaylists) {
      playlists.value = JSON.parse(storedPlaylists);
    }
  } catch (error) {
    console.error('Error loading playlists:', error);
  }
});
</script>

<style lang="scss" scoped>
.playlists-view {
  padding-bottom: 120px;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
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
      background-color: var(--accent-color-dark);
    }
  }
}

.empty-state {
  text-align: center;
  padding: 3rem 0;
  color: var(--secondary-color);
}

.playlists-grid {
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
</style>