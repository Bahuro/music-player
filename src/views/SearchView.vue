<template>
  <div class="search-view">
    <div class="search-header">
      <h1>Búsqueda</h1>
      <div class="search-container">
        <input 
          type="text" 
          v-model="searchQuery" 
          @input="handleSearchInput"
          @keyup.enter="performSearch"
          placeholder="Busca artistas, canciones o álbumes" 
          class="search-input"
          ref="searchInput"
        />
        <button @click="performSearch" class="search-btn">Buscar</button>
      </div>
    </div>

    <div v-if="isSearching" class="loading-section">
      <div class="loader"></div>
      <p>Buscando "{{ searchQuery }}"...</p>
    </div>

    <div v-else-if="hasSearched && !hasResults" class="no-results">
      <div class="no-results-icon">🔍</div>
      <h2>No se encontraron resultados</h2>
      <p>No encontramos coincidencias para "{{ lastSearchQuery }}". Intenta con otra búsqueda.</p>
    </div>

    <template v-else-if="hasSearched">
      <section v-if="tracks.length > 0" class="results-section">
        <h2>Canciones</h2>
        <div class="tracks-list">
          <div 
            v-for="(track, index) in tracks" 
            :key="track.id"
            class="track-item"
            @click="playTrack(track, tracks)"
          >
            <div class="track-number">{{ index + 1 }}</div>
            <img :src="track.cover" :alt="track.title" class="track-cover" />
            <div class="track-details">
              <h3 class="track-title">{{ track.title }}</h3>
              <p class="track-artist">{{ track.artist }}</p>
            </div>
            <div class="track-album">{{ track.album }}</div>
            <div class="track-duration">{{ formatTime(track.duration) }}</div>
            <button class="play-btn" @click.stop="playTrack(track, tracks)">
              <span>▶️</span>
            </button>
          </div>
        </div>
      </section>

      <section v-if="artists.length > 0" class="results-section">
        <h2>Artistas</h2>
        <div class="artists-grid">
          <div 
            v-for="artist in artists" 
            :key="artist.id"
            class="artist-card"
            @click="navigateToArtist(artist)"
          >
            <img :src="artist.image" :alt="artist.name" class="artist-image" />
            <h3 class="artist-name">{{ artist.name }}</h3>
            <p class="artist-type">Artista</p>
          </div>
        </div>
      </section>

      <section v-if="albums.length > 0" class="results-section">
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
              <p class="album-artist">{{ album.artist }}</p>
            </div>
          </div>
        </div>
      </section>
    </template>

    <div v-else class="search-suggestions">
      <h2>Búsquedas populares</h2>
      <div class="suggestions-grid">
        <button 
          v-for="suggestion in searchSuggestions" 
          :key="suggestion"
          class="suggestion-btn"
          @click="searchQuery = suggestion; performSearch()"
        >
          {{ suggestion }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePlayerStore } from '../stores/player';
import { debounce } from 'lodash';

const route = useRoute();
const router = useRouter();
const playerStore = usePlayerStore();

// State
const searchQuery = ref('');
const isSearching = ref(false);
const hasSearched = ref(false);
const lastSearchQuery = ref('');
const tracks = ref([]);
const artists = ref([]);
const albums = ref([]);
const searchInput = ref(null);

// Search suggestions
const searchSuggestions = [
  'Rock Clásico',
  'Pop Latino',
  'Hip Hop 2024',
  'Electrónica',
  'Jazz Suave',
  'Indie Rock',
  'Música Relajante',
  'Éxitos del Momento'
];

// Computed
const hasResults = computed(() => {
  return tracks.value.length > 0 || artists.value.length > 0 || albums.value.length > 0;
});

// Methods
const formatTime = (seconds) => {
  if (!seconds) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const handleSearchInput = debounce(async () => {
  if (searchQuery.value.length >= 2) {
    performSearch();
  }
}, 300);

const performSearch = async () => {
  if (!searchQuery.value.trim()) return;
  
  // Verificar si el usuario está autenticado
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  
  if (!isLoggedIn) {
    alert('Debes iniciar sesión para buscar música');
    router.push('/login');
    return;
  }
  
  isSearching.value = true;
  hasSearched.value = true;
  lastSearchQuery.value = searchQuery.value;
  
  try {
    // Aquí iría la llamada real a la API
    // Por ahora, simulamos una búsqueda con datos de ejemplo
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const results = generateMockSearchResults(searchQuery.value);
    tracks.value = results.tracks;
    artists.value = results.artists;
    albums.value = results.albums;
  } catch (error) {
    console.error('Error performing search:', error);
  } finally {
    isSearching.value = false;
  }
};

const playTrack = (track, trackList) => {
  // Verificar si el usuario está autenticado
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  
  if (!isLoggedIn) {
    alert('Debes iniciar sesión para reproducir música');
    router.push('/login');
    return;
  }
  
  // Asegurarse de que la canción y la lista son válidas
  if (!track || !trackList || trackList.length === 0) {
    console.error('Canción o lista inválida');
    return;
  }
  
  // Encontrar el índice correcto de la canción en la lista
  const startIndex = trackList.findIndex(t => t.id === track.id);
  
  if (startIndex !== -1) {
    // Crear copias para evitar problemas de referencia
    const tracksCopy = JSON.parse(JSON.stringify(trackList));
    playerStore.setQueue(tracksCopy, startIndex);
  }
};

const navigateToArtist = (artist) => {
  // Verificar si el usuario está autenticado
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  
  if (!isLoggedIn) {
    alert('Debes iniciar sesión para ver detalles del artista');
    router.push('/login');
    return;
  }
  
  router.push({ name: 'artist', params: { id: artist.id } });
};

const navigateToAlbum = (album) => {
  // Verificar si el usuario está autenticado
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  
  if (!isLoggedIn) {
    alert('Debes iniciar sesión para ver detalles del álbum');
    router.push('/login');
    return;
  }
  
  router.push({ name: 'album', params: { id: album.id } });
};

// Mock data generator
const generateMockSearchResults = (query) => {
  const results = {
    tracks: [],
    artists: [],
    albums: []
  };
  
  // Generate mock tracks
  for (let i = 1; i <= 10; i++) {
    results.tracks.push({
      id: `track-${i}`,
      title: `${query} Song ${i}`,
      artist: `Artist ${i}`,
      album: `Album ${i}`,
      duration: 180 + Math.floor(Math.random() * 120),
      cover: `https://picsum.photos/id/${i * 10}/300/300`,
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
    });
  }
  
  // Generate mock artists
  for (let i = 1; i <= 6; i++) {
    results.artists.push({
      id: `artist-${i}`,
      name: `${query} Artist ${i}`,
      image: `https://picsum.photos/id/${i * 20}/300/300`,
      type: 'artist'
    });
  }
  
  // Generate mock albums
  for (let i = 1; i <= 8; i++) {
    results.albums.push({
      id: `album-${i}`,
      title: `${query} Album ${i}`,
      artist: `Artist ${i}`,
      cover: `https://picsum.photos/id/${i * 30}/300/300`
    });
  }
  
  return results;
};

// Watch for route changes
watch(
  () => route.query.q,
  (newQuery) => {
    if (newQuery) {
      searchQuery.value = newQuery;
      performSearch();
    }
  },
  { immediate: true }
);

onMounted(() => {
  if (route.query.q) {
    searchQuery.value = route.query.q;
    performSearch();
  }
  searchInput.value?.focus();
});
</script>

<style lang="scss" scoped>
.search-view {
  padding-bottom: 120px;
}

.search-header {
  margin-bottom: 2rem;
  
  h1 {
    font-size: 2rem;
    margin-bottom: 1rem;
  }
  .search-container {
    display: flex;
    max-width: 600px;
    gap: 0.5rem;
    .search-input {
      flex: 1;
      padding: 0.8rem 1.2rem;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      font-size: 1rem;
      background-color: var(--card-bg);
      color: var(--text-color);
      
      &:focus {
        outline: none;
        border-color: var(--accent-color);
      }
    }
    .search-btn {
      padding: 0.8rem 1.5rem;
      background-color: var(--accent-color);
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.3s;
      
      &:hover {
        background-color: #19a34a; /* Reemplazado darken(#1db954, 10%) por un color fijo */
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

.no-results {
  text-align: center;
  padding: 3rem 0;
  .no-results-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }
  
  h2 {
    margin-bottom: 0.5rem;
  }
  
  p {
    color: var(--secondary-color);
  }
}

.results-section {
  margin-bottom: 2rem;
  
  h2 {
    margin-bottom: 1rem;
    font-size: 1.5rem;
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

.artists-grid, .albums-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.5rem;
}

.artist-card {
  text-align: center;
  cursor: pointer;
  transition: transform 0.3s;
  
  &:hover {
    transform: translateY(-5px);
  }
  .artist-image {
    width: 180px;
    height: 180px;
    border-radius: 50%;
    object-fit: cover;
    margin-bottom: 1rem;
  }
  .artist-name {
    font-size: 1rem;
    margin: 0 0 0.3rem;
  }
  .artist-type {
    color: var(--secondary-color);
    font-size: 0.8rem;
    margin: 0;
  }
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
    .album-artist {
      color: var(--secondary-color);
      font-size: 0.8rem;
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}
.search-suggestions {
  h2 {
    margin-bottom: 1rem;
  }
  
  .suggestions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
    
    .suggestion-btn {
      background-color: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 1rem;
      text-align: center;
      cursor: pointer;
      transition: background-color 0.2s;
      
      &:hover {
        background-color: var(--hover-color);
      }
    }
  }
}

@media (max-width: 768px) {
  .tracks-list .track-item {
    grid-template-columns: 40px 50px 1fr 50px;
    
    .track-album {
      display: none;
    }
    
    .track-duration {
      display: none;
    }
  }
  
  .artists-grid, .albums-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }
  
  .artist-card .artist-image {
    width: 140px;
    height: 140px;
  }
}
</style>