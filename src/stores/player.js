import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const usePlayerStore = defineStore('player', () => {
  // Estado
  const currentTrack = ref(null);
  const queue = ref([]);
  const currentIndex = ref(-1);
  const isShuffled = ref(false);
  const loopMode = ref('none'); // 'none', 'all', 'one'
  const favorites = ref([]);
  const originalQueue = ref([]); // Para mantener el orden original cuando se desactiva shuffle

  // Getters
  const isPlaying = computed(() => !!currentTrack.value);
  const hasPrevious = computed(() => currentIndex.value > 0 || loopMode.value !== 'none');
  const hasNext = computed(() => currentIndex.value < queue.value.length - 1 || loopMode.value !== 'none');
  // Acciones
  // Modificar la función setQueue
  // Acciones
    function setQueue(tracks, startIndex = 0) {
      console.log('Setting queue with', tracks.length, 'tracks, starting at index', startIndex);
      
      // Validar los parámetros
      if (!Array.isArray(tracks) || tracks.length === 0) {
        console.error('Invalid tracks array:', tracks);
        return;
      }
      
      if (startIndex < 0 || startIndex >= tracks.length) {
        console.error('Invalid start index:', startIndex, 'for tracks length:', tracks.length);
        startIndex = 0;
      }
      
      // Guardar la cola original
      originalQueue.value = [...tracks];
      
      if (isShuffled.value) {
        // Implementación del modo shuffle...
      } else {
        // Modo normal: usar la lista tal cual
        queue.value = [...tracks];
        currentIndex.value = startIndex;
      }
      
      // Establecer la pista actual
      currentTrack.value = queue.value[currentIndex.value];
      console.log('Current track set to:', currentTrack.value.title);
      
      // Guardar en historial reciente
      addToRecentlyPlayed(currentTrack.value);
    }
  function addToRecentlyPlayed(track) {
    if (!track) return;
    
    try {
      let recentTracks = JSON.parse(localStorage.getItem('recentlyPlayed') || '[]');
      
      // Remover la canción si ya existe
      recentTracks = recentTracks.filter(t => t.id !== track.id);
      
      // Añadir al principio
      recentTracks.unshift(track);
      
      // Mantener solo las últimas 20 canciones
      recentTracks = recentTracks.slice(0, 20);
      
      localStorage.setItem('recentlyPlayed', JSON.stringify(recentTracks));
    } catch (error) {
      console.error('Error saving recently played:', error);
    }
  }
  function playTrack(index) {
    if (index >= 0 && index < queue.value.length) {
      currentIndex.value = index;
      currentTrack.value = queue.value[index];
      addToRecentlyPlayed(currentTrack.value);
    }
  }
  function nextTrack() {
    if (queue.value.length === 0) return;
    
    if (currentIndex.value < queue.value.length - 1) {
      currentIndex.value++;
    } else if (loopMode.value === 'all') {
      currentIndex.value = 0;
    } else {
      return; // No hay siguiente canción y no está en modo loop
    }
    
    currentTrack.value = queue.value[currentIndex.value];
  }
  function previousTrack() {
    if (queue.value.length === 0) return;
    
    if (currentIndex.value > 0) {
      currentIndex.value--;
    } else if (loopMode.value === 'all') {
      currentIndex.value = queue.value.length - 1;
    } else {
      return; // No hay canción anterior y no está en modo loop
    }
    
    currentTrack.value = queue.value[currentIndex.value];
  }
  function toggleShuffle(shuffleState) {
    isShuffled.value = shuffleState;
    
    if (queue.value.length === 0) return;
    
    if (shuffleState) {
      // Guardar la cola original si no está guardada
      if (originalQueue.value.length === 0) {
        originalQueue.value = [...queue.value];
      }
      
      // Obtener la canción actual
      const currentTrackId = currentTrack.value?.id;
      
      // Mezclar la cola
      let newQueue = [...queue.value];
      shuffleArray(newQueue);
      
      // Poner la canción actual al principio
      if (currentTrackId) {
        const currentIndex = newQueue.findIndex(track => track.id === currentTrackId);
        if (currentIndex !== -1) {
          const current = newQueue.splice(currentIndex, 1)[0];
          newQueue.unshift(current);
        }
      }
      
      queue.value = newQueue;
      currentIndex.value = 0;
    } else {
      // Restaurar la cola original si existe
      if (originalQueue.value.length > 0) {
        // Encontrar el índice de la canción actual en la cola original
        const currentTrackId = currentTrack.value?.id;
        const newIndex = originalQueue.value.findIndex(track => track.id === currentTrackId);
        
        queue.value = [...originalQueue.value];
        currentIndex.value = newIndex !== -1 ? newIndex : 0;
      }
    }
  }
  function setLoopMode(mode) {
    loopMode.value = mode;
  }
  function toggleFavorite(track) {
    // Verificar si el usuario está autenticado
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if (!isLoggedIn) {
      alert('Debes iniciar sesión para añadir favoritos');
      return false;
    }
    
    if (!track || !track.id) return false;
    
    const index = favorites.value.findIndex(t => t.id === track.id);
    
    if (index === -1) {
      favorites.value.push(track);
      // Guardar en localStorage
      saveFavoritesToStorage();
      return true;
    } else {
      favorites.value.splice(index, 1);
      // Actualizar localStorage
      saveFavoritesToStorage();
      return false;
    }
  }
  function saveFavoritesToStorage() {
    try {
      localStorage.setItem('musicPlayerFavorites', JSON.stringify(favorites.value));
    } catch (error) {
      console.error('Error saving favorites to localStorage:', error);
    }
  }
  function loadFavoritesFromStorage() {
    try {
      const storedFavorites = localStorage.getItem('musicPlayerFavorites');
      if (storedFavorites) {
        favorites.value = JSON.parse(storedFavorites);
      }
    } catch (error) {
      console.error('Error loading favorites from localStorage:', error);
    }
  }
  // Función auxiliar para mezclar un array
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  // Cargar favoritos al inicializar el store
  loadFavoritesFromStorage();
  return {
    // Estado
    currentTrack,
    queue,
    currentIndex,
    isShuffled,
    loopMode,
    favorites,
    
    // Getters
    isPlaying,
    hasPrevious,
    hasNext,
    
    // Acciones
    setQueue,
    playTrack,
    nextTrack,
    previousTrack,
    toggleShuffle,
    setLoopMode,
    toggleFavorite,
    loadFavoritesFromStorage
  };
});