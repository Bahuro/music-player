<template>
  <div class="home-view">
    <section class="welcome-section">
      <h1>¡Bienvenido a tu reproductor de música!</h1>
      <p class="welcome-message">Descubre nueva música, crea tus playlists y disfruta de tus canciones favoritas.</p>
      
      <!-- Añadir barra de búsqueda -->
      <div class="search-bar">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Buscar canciones, artistas o álbumes..." 
          @keyup.enter="goToSearch"
        />
        <button @click="goToSearch">Buscar</button>
      </div>
    </section>

    <section v-if="isLoading" class="loading-section">
      <div class="loader"></div>
      <p>Cargando recomendaciones...</p>
    </section>

    <template v-else>
      <section class="featured-section">
        <h2>Destacados para ti</h2>
        <div class="tracks-grid">
          <TrackCard 
            v-for="track in featuredTracks" 
            :key="track.id"
            :track="track"
            :trackList="featuredTracks"
            @play="playTrack"
          />
        </div>
      </section>

      <section class="recent-section">
        <h2>Escuchado recientemente</h2>
        <div class="tracks-grid">
          <TrackCard 
            v-for="track in recentTracks" 
            :key="track.id"
            :track="track"
            :trackList="recentTracks"
            @play="playTrack"
          />
        </div>
      </section>

      <section class="genres-section">
        <h2>Géneros populares</h2>
        <div class="genres-grid">
          <GenreCard 
            v-for="genre in genres" 
            :key="genre.id"
            :genre="genre"
            @click="navigateToGenre(genre)"
          />
        </div>
      </section>

      <section class="new-releases-section">
        <h2>Nuevos lanzamientos</h2>
        <div class="tracks-grid">
          <TrackCard 
            v-for="track in newReleases" 
            :key="track.id"
            :track="track"
            :trackList="newReleases"
            @play="playTrack"
          />
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { usePlayerStore } from '../stores/player';
import TrackCard from '../components/TrackCard.vue';
import GenreCard from '../components/GenreCard.vue';
import { getFeaturedTracks, getNewReleases, getGenres } from '../services/jamendoService';

const router = useRouter();
const playerStore = usePlayerStore();

// Estado
const searchQuery = ref('');
const isLoading = ref(true);
const featuredTracks = ref([]);
const newReleases = ref([]);
const genres = ref([]);
const recentTracks = ref([]); // Nuevo estado para tracks recientes

// Método para ir a la página de búsqueda
const goToSearch = () => {
  if (searchQuery.value.trim()) {
    // Verificar si el usuario está autenticado
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if (isLoggedIn) {
      router.push({ name: 'search', query: { q: searchQuery.value.trim() } });
    } else {
      // Redirigir al login si no está autenticado
      alert('Debes iniciar sesión para buscar música');
      router.push('/login');
    }
  }
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
  
  // Asegurarse de que la canción y la lista son válidas
  if (!track || !trackList || trackList.length === 0) {
    console.error('Canción o lista inválida');
    return;
  }
  
  // Encontrar el índice correcto
  const startIndex = trackList.findIndex(t => t.id === track.id);
  
  console.log('Reproduciendo:', track.title);
  console.log('Lista actual:', trackList.map(t => t.title));
  console.log('Índice inicial:', startIndex);
  
  // Establecer la cola de reproducción con una copia profunda de la lista
  if (startIndex !== -1) {
    // Crear copias para evitar problemas de referencia
    const tracksCopy = JSON.parse(JSON.stringify(trackList));
    playerStore.setQueue(tracksCopy, startIndex);
  }
};

// Método para navegar a un género
const navigateToGenre = (genre) => {
  // Verificar si el usuario está autenticado
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  
  if (!isLoggedIn) {
    alert('Debes iniciar sesión para explorar géneros');
    router.push('/login');
    return;
  }
  
  router.push({ name: 'genre', params: { id: genre.id } });
};

// Cargar datos al montar el componente
onMounted(async () => {
  try {
    isLoading.value = true;
    console.log('Cargando datos de la API...');
    
    // Cargar datos reales de la API de Jamendo
    const featured = await getFeaturedTracks(8);
    console.log('Canciones destacadas cargadas:', featured);
    
    const releases = await getNewReleases(8);
    console.log('Nuevos lanzamientos cargados:', releases);
    
    const genresList = await getGenres();
    console.log('Géneros cargados:', genresList);
    
    // Asignar los valores asegurándose de que sean arrays
    featuredTracks.value = Array.isArray(featured) ? featured : [];
    newReleases.value = Array.isArray(releases) ? releases : [];
    genres.value = Array.isArray(genresList) ? genresList : [];
    
    // Cargar tracks recientes del localStorage o usar algunos por defecto
    try {
      const recentFromStorage = localStorage.getItem('recentTracks');
      recentTracks.value = recentFromStorage ? JSON.parse(recentFromStorage) : [];
      
      // Si no hay tracks recientes, usar algunos de los destacados
      if (recentTracks.value.length === 0 && featuredTracks.value.length > 0) {
        recentTracks.value = featuredTracks.value.slice(0, 4);
      }
    } catch (error) {
      console.error('Error loading recent tracks:', error);
      recentTracks.value = [];
    }
    
    isLoading.value = false;
  } catch (error) {
    console.error('Error loading home data:', error);
    isLoading.value = false;
    // Inicializar con arrays vacíos en caso de error
    featuredTracks.value = [];
    newReleases.value = [];
    genres.value = [];
    recentTracks.value = [];
  }
});
</script>

<style lang="scss" scoped>
.home-view {
  padding-bottom: 120px;
}

.welcome-section {
  margin-bottom: 2rem;
  
  h1 {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
  }
  
  .welcome-message {
    font-size: 1.1rem;
    color: var(--secondary-color);
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

.tracks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
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

.genres-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.genre-card {
  height: 100px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.3s;
  
  &:hover {
    transform: scale(1.05);
  }
  
  .genre-name {
    color: white;
    font-size: 1.2rem;
    text-shadow: 0 1px 2px rgba(0,0,0,0.3);
  }
}

@media (max-width: 768px) {
  .welcome-section {
    h1 {
      font-size: 2rem;
    }
  }
  
  .featured-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }
  
  .albums-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }
}
</style>