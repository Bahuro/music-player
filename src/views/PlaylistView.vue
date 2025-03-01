<template>
  <div class="playlist-view">
    <div v-if="isLoading" class="loading-section">
      <div class="loader"></div>
      <p>Cargando playlist...</p>
    </div>
    
    <div v-else-if="!playlist" class="not-found">
      <h2>Playlist no encontrada</h2>
      <p>La playlist que buscas no existe o ha sido eliminada.</p>
      <button @click="router.push('/library')" class="back-btn">Volver a la biblioteca</button>
    </div>
    
    <template v-else>
      <div class="playlist-header">
        <div class="playlist-cover">
          <img :src="playlistCover" :alt="playlist.name" />
        </div>
        
        <div class="playlist-info">
          <span class="playlist-type">PLAYLIST</span>
          <h1>{{ playlist.name }}</h1>
          <p class="playlist-details">
            {{ playlist.tracks.length }} canciones
            <span v-if="totalDuration"> • {{ formatDuration(totalDuration) }}</span>
          </p>
          
          <div class="playlist-actions">
            <button 
              class="play-btn" 
              @click="playPlaylist" 
              :disabled="playlist.tracks.length === 0"
            >
              Reproducir
            </button>
            <button class="edit-btn" @click="isEditing = true">Editar</button>
            <button class="delete-btn" @click="confirmDelete = true">Eliminar</button>
          </div>
        </div>
      </div>
      
      <div v-if="playlist.tracks.length === 0" class="empty-playlist">
        <p>Esta playlist está vacía. Añade canciones desde la búsqueda.</p>
        <button @click="router.push('/search')" class="search-btn">Buscar canciones</button>
      </div>
      
      <div v-else class="tracks-container">
        <div class="tracks-header">
          <div class="track-number">#</div>
          <div class="track-title">TÍTULO</div>
          <div class="track-album">ÁLBUM</div>
          <div class="track-duration">DURACIÓN</div>
          <div class="track-actions"></div>
        </div>
        
        <div 
          v-for="(track, index) in playlist.tracks" 
          :key="track.id"
          class="track-item"
          @dblclick="handlePlayTrack(track, playlist.tracks)"
        >
          <div class="track-number">{{ index + 1 }}</div>
          <div class="track-title-container">
            <img :src="track.cover" :alt="track.title" class="track-cover" />
            <div class="track-details">
              <span class="title">{{ track.title }}</span>
              <span class="artist">{{ track.artist }}</span>
            </div>
          </div>
          <div class="track-album">{{ track.album }}</div>
          <div class="track-duration">{{ formatTime(track.duration) }}</div>
          <div class="track-actions">
            <button class="action-btn" @click="removeTrack(index)">
              <span>🗑️</span>
            </button>
          </div>
        </div>
      </div>
    </template>
    
    <!-- Modal de edición -->
    <div v-if="isEditing" class="modal-overlay">
      <div class="modal-content">
        <h2>Editar Playlist</h2>
        <input 
          type="text" 
          v-model="editName" 
          placeholder="Nombre de la playlist" 
          class="edit-input"
        />
        <div class="modal-actions">
          <button @click="isEditing = false" class="cancel-btn">Cancelar</button>
          <button @click="savePlaylist" class="save-btn">Guardar</button>
        </div>
      </div>
    </div>
    
    <!-- Modal de confirmación de eliminación -->
    <div v-if="confirmDelete" class="modal-overlay">
      <div class="modal-content">
        <h2>¿Eliminar playlist?</h2>
        <p>Esta acción no se puede deshacer.</p>
        <div class="modal-actions">
            <button @click="confirmDelete = false" class="cancel-btn">Cancelar</button>
          <button @click="deletePlaylist" class="delete-btn">Eliminar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { usePlayerStore } from '../stores/player';

const router = useRouter();
const route = useRoute();
const playerStore = usePlayerStore();

// Estado
const isLoading = ref(true);
const playlist = ref(null);
const isEditing = ref(false);
const editName = ref('');
const confirmDelete = ref(false);

// Verificar autenticación
const checkAuth = () => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  if (!isLoggedIn) {
    alert('Debes iniciar sesión para acceder a las playlists');
    router.push('/login');
    return false;
  }
  return true;
};


const handlePlayTrack = (track, trackList) => {
  if (!checkAuth()) return;
  
  // Asegurarse de que la canción y la lista son válidas
  if (!track || !trackList || trackList.length === 0) {
    console.error('Canción o lista inválida');
    return;
  }
  
  // Encontrar el índice correcto
  const startIndex = trackList.findIndex(t => t.id === track.id);
  
  if (startIndex !== -1) {
    // Crear copias para evitar problemas de referencia
    const tracksCopy = JSON.parse(JSON.stringify(trackList));
    playerStore.setQueue(tracksCopy, startIndex);
  }
};

// Método para reproducir toda la playlist
const playPlaylist = () => {
  if (!checkAuth()) return;
  
  if (playlist.value && playlist.value.tracks.length > 0) {
    const tracksCopy = JSON.parse(JSON.stringify(playlist.value.tracks));
    playerStore.setQueue(tracksCopy, 0);
  }
};

// Método para eliminar una canción
const removeTrack = (index) => {
  if (!checkAuth()) return;
  
  playlist.value.tracks.splice(index, 1);
  savePlaylists();
};

// Método para guardar la playlist
const savePlaylist = () => {
  if (!checkAuth()) return;
  
  try {
    if (!playlist.value || !editName.value.trim()) return;
    
    playlist.value.name = editName.value.trim();
    savePlaylists();
    isEditing.value = false;
  } catch (error) {
    console.error('Error al guardar la playlist:', error);
    alert('Error al guardar los cambios');
  }
};

// Método para eliminar la playlist
const deletePlaylist = () => {
  if (!checkAuth()) return;
  if (!playlist.value) return;
  
  try {
    // Cargar todas las playlists
    const storedPlaylists = JSON.parse(localStorage.getItem('musicPlayerPlaylists') || '[]');
    const updatedPlaylists = storedPlaylists.filter(p => p.id !== playlist.value.id);
    localStorage.setItem('musicPlayerPlaylists', JSON.stringify(updatedPlaylists));
    
    // Redirigir a la biblioteca
    router.push('/library');
  } catch (error) {
    console.error('Error deleting playlist:', error);
    alert('Error al eliminar la playlist');
  }
};

const savePlaylists = () => {
  try {
    const storedPlaylists = JSON.parse(localStorage.getItem('musicPlayerPlaylists') || '[]');
    const playlistIndex = storedPlaylists.findIndex(p => p.id === playlist.value.id);
    
    if (playlistIndex !== -1) {
      storedPlaylists[playlistIndex] = playlist.value;
      localStorage.setItem('musicPlayerPlaylists', JSON.stringify(storedPlaylists));
    }
  } catch (error) {
    console.error('Error saving playlist:', error);
  }
};

// Computed
const playlistCover = computed(() => {
  if (playlist.value && playlist.value.tracks.length > 0) {
    return playlist.value.tracks[0].cover;
  }
  return 'https://via.placeholder.com/300?text=Playlist';
});

const totalDuration = computed(() => {
  if (!playlist.value || !playlist.value.tracks.length) return 0;
  return playlist.value.tracks.reduce((total, track) => total + (track.duration || 0), 0);
});

// Métodos
const formatTime = (seconds) => {
  if (!seconds) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const formatDuration = (seconds) => {
  if (!seconds) return '';
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours} h ${mins} min`;
  }
  return `${mins} min`;
};

// Cargar datos al montar el componente
onMounted(() => {
  const playlistId = route.params.id;
  
  if (!playlistId) {
    isLoading.value = false;
    return;
  }
  
  try {
    const storedPlaylists = JSON.parse(localStorage.getItem('musicPlayerPlaylists') || '[]');
    const foundPlaylist = storedPlaylists.find(p => p.id === playlistId);
    
    if (foundPlaylist) {
      playlist.value = foundPlaylist;
      editName.value = foundPlaylist.name;
    }
    
    isLoading.value = false;
  } catch (error) {
    console.error('Error loading playlist:', error);
    isLoading.value = false;
  }
});
</script>

<style lang="scss" scoped>
.playlist-view {
  padding-bottom: 120px;
  position: relative;
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

.not-found {
  text-align: center;
  padding: 3rem 0;
  
  h2 {
    font-size: 1.8rem;
    margin-bottom: 1rem;
  }
  
  p {
    color: var(--secondary-color);
    margin-bottom: 1.5rem;
  }
  
  .back-btn {
    padding: 0.8rem 1.5rem;
    background-color: var(--accent-color);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
  }
}

.playlist-header {
  display: flex;
  margin-bottom: 2rem;
  
  .playlist-cover {
    width: 200px;
    height: 200px;
    margin-right: 2rem;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    }
  }
  
  .playlist-info {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    
    .playlist-type {
      font-size: 0.8rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }
    
    h1 {
      font-size: 3rem;
      margin: 0 0 0.5rem;
    }
    
    .playlist-details {
      color: var(--secondary-color);
      margin-bottom: 1.5rem;
    }
    
    .playlist-actions {
      display: flex;
      gap: 1rem;
      
      button {
        padding: 0.8rem 1.5rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 600;
        
        &.play-btn {
          background-color: var(--accent-color);
          color: white;
          
          &:disabled {
            background-color: var(--border-color);
            cursor: not-allowed;
          }
        }
        
        &.edit-btn {
          background-color: var(--background-color-light);
          color: var(--text-color);
        }
        
        &.delete-btn {
          background-color: #e53e3e;
          color: white;
        }
      }
    }
  }
}

.empty-playlist {
  text-align: center;
  padding: 3rem 0;
  
  p {
    color: var(--secondary-color);
    margin-bottom: 1.5rem;
  }
  
  .search-btn {
    padding: 0.8rem 1.5rem;
    background-color: var(--accent-color);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
  }
}

.tracks-container {
  .tracks-header {
    display: grid;
    grid-template-columns: 50px 1fr 1fr 100px 50px;
    padding: 0.5rem 1rem;
    border-bottom: 1px solid var(--border-color);
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--secondary-color);
  }
  
  .track-item {
    display: grid;
    grid-template-columns: 50px 1fr 1fr 100px 50px;
    padding: 0.8rem 1rem;
    border-radius: 4px;
    align-items: center;
    
    &:hover {
      background-color: var(--background-color-light);
    }
    
    .track-title-container {
      display: flex;
      align-items: center;
      
      .track-cover {
        width: 40px;
        height: 40px;
        object-fit: cover;
        margin-right: 1rem;
      }
      
      .track-details {
        display: flex;
        flex-direction: column;
        
        .title {
          font-weight: 500;
          margin-bottom: 0.2rem;
        }
        
        .artist {
          font-size: 0.8rem;
          color: var(--secondary-color);
        }
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
    }
    
    .track-actions {
      .action-btn {
        background: none;
        border: none;
        cursor: pointer;
        opacity: 0.7;
        
        &:hover {
          opacity: 1;
        }
      }
    }
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  
  .modal-content {
    background-color: var(--background-color);
    border-radius: 8px;
    padding: 2rem;
    width: 100%;
    max-width: 400px;
    
    h2 {
      margin-top: 0;
      margin-bottom: 1.5rem;
    }
    
    p {
      margin-bottom: 1.5rem;
      color: var(--secondary-color);
    }
    
    .edit-input {
      width: 100%;
      padding: 0.8rem;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      background-color: var(--background-color-light);
      color: var(--text-color);
      margin-bottom: 1.5rem;
      
      &:focus {
        outline: none;
        border-color: var(--accent-color);
      }
    }
    
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      
      button {
        padding: 0.8rem 1.5rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 600;
        
        &.cancel-btn {
          background-color: var(--background-color-light);
          color: var(--text-color);
        }
        
        &.save-btn {
          background-color: var(--accent-color);
          color: white;
        }
        
        &.delete-btn {
          background-color: #e53e3e;
          color: white;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .playlist-header {
    flex-direction: column;
    
    .playlist-cover {
      width: 150px;
      height: 150px;
      margin: 0 auto 1.5rem;
    }
    
    .playlist-info {
      text-align: center;
      
      h1 {
        font-size: 2rem;
      }
      
      .playlist-actions {
        justify-content: center;
      }
    }
  }
  
  .tracks-container {
    .tracks-header {
      grid-template-columns: 50px 1fr 100px 50px;
      
      .track-album {
        display: none;
      }
    }
    
    .track-item {
      grid-template-columns: 50px 1fr 100px 50px;
      
      .track-album {
        display: none;
      }
    }
  }
}
</style>