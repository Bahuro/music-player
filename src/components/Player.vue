<template>
  <div class="player" v-if="currentTrack">
    <div class="track-info">
      <img :src="currentTrack.cover" :alt="currentTrack.title" class="track-cover" />
      <div class="track-details">
        <h3 class="track-title">{{ currentTrack.title }}</h3>
        <p class="track-artist">{{ currentTrack.artist }}</p>
      </div>
    </div>
    
    <div class="player-controls">
      <button class="control-btn" @click="previousTrack">⏮️</button>
      <button class="play-btn" @click="togglePlay">
        {{ isPlaying ? '⏸️' : '▶️' }}
      </button>
      <button class="control-btn" @click="nextTrack">⏭️</button>
    </div>
    
    <div class="progress-bar">
      <span class="time current">{{ formatTime(currentTime) }}</span>
      <div class="progress-container" @click="seek">
        <div class="progress" :style="{ width: progress + '%' }"></div>
      </div>
      <span class="time duration">{{ formatTime(duration) }}</span>
    </div>
    
    <!-- Eliminamos el elemento audio ya que usaremos Howler -->
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { usePlayerStore } from '../stores/player';
import { Howl } from 'howler';
import { getWorkingAudioUrl, isSupportedAudioFormat } from '../utils/audioUtils';

const playerStore = usePlayerStore();

// Referencias
const currentTime = ref(0);
const duration = ref(0);
const volume = ref(0.8);
const sound = ref(null);
const loopMode = ref('none');

// Computed properties
const currentTrack = computed(() => playerStore.currentTrack);
const isPlaying = computed(() => playerStore.isPlaying);
const progress = computed(() => {
  if (duration.value === 0) return 0;
  return (currentTime.value / duration.value) * 100;
});

// Métodos
const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const togglePlay = () => {
  if (!sound.value) {
    setupAudio();
    return;
  }
  
  if (isPlaying.value) {
    sound.value.pause();
  } else {
    sound.value.play();
  }
  
  playerStore.isPlaying = !isPlaying.value;
};

const nextTrack = () => {
  playerStore.nextTrack();
};

const previousTrack = () => {
  playerStore.previousTrack();
};

const seek = (event) => {
  if (!sound.value || !duration.value) return;
  
  const container = event.currentTarget;
  const clickPosition = event.clientX - container.getBoundingClientRect().left;
  const containerWidth = container.clientWidth;
  const seekPercentage = clickPosition / containerWidth;
  
  sound.value.seek(duration.value * seekPercentage);
};

// Método para actualizar el progreso
const updateProgress = () => {
  if (sound.value && isPlaying.value) {
    currentTime.value = sound.value.seek();
    requestAnimationFrame(updateProgress);
  }
};

// Método para configurar el audio
const setupAudio = () => {
  if (!currentTrack.value) {
    console.error('No hay pista actual disponible');
    return;
  }
  
  console.log('Configurando audio para:', currentTrack.value.title);
  
  // Usar URLs de fallback diferentes según la canción
  let audioUrl;
  
  // Asignar diferentes URLs de fallback según el título de la canción
  if (currentTrack.value.title === "Wish You Were Here") {
    audioUrl = 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Scott_Buckley/Cinematic_Ambient_Electronic/Scott_Buckley_-_01_-_Epic_Journey.mp3';
  } else if (currentTrack.value.title === "RED LIGHT") {
    audioUrl = 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Chad_Crouch/Arps/Chad_Crouch_-_Shipping_Lanes.mp3';
  } else if (currentTrack.value.title === "What Is Love") {
    audioUrl = 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/Music_for_Video/Podington_Bear/Solo_Instruments/Podington_Bear_-_Starling.mp3';
  } else {
    audioUrl = 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Scott_Buckley/Cinematic_Ambient_Electronic/Scott_Buckley_-_01_-_Epic_Journey.mp3';
  }
  
  console.log('URL de audio (fallback):', audioUrl);
  
  if (sound.value) {
    sound.value.unload();
  }

  sound.value = new Howl({
    src: [audioUrl],
    html5: true,
    volume: volume.value,
    format: ['mp3'],
    onplay: () => {
      console.log('Reproduciendo:', currentTrack.value.title);
      playerStore.isPlaying = true;
      requestAnimationFrame(updateProgress);
    },
    onpause: () => {
      playerStore.isPlaying = false;
    },
    onend: () => {
      if (loopMode.value === 'one') {
        sound.value.play();
      } else {
        nextTrack();
      }
    },
    onload: () => {
      console.log('Audio cargado correctamente');
      duration.value = sound.value.duration();
    },
    onloaderror: (id, error) => {
      console.error('Error loading audio:', error);
    }
  });

  if (isPlaying.value) {
    sound.value.play();
  }
};

// Observar cambios en la pista actual para usar Howler
watch(currentTrack, (newTrack, oldTrack) => {
  if (newTrack) {
    console.log('Cambio de pista detectado:', newTrack.title);
    // Detener la reproducción anterior si existe
    if (sound.value) {
      sound.value.unload();
    }
    setupAudio();
  }
}, { immediate: true });
</script>

<style lang="scss" scoped>
.player {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 90px;
  background-color: #181818;
  border-top: 1px solid #282828;
  display: flex;
  align-items: center;
  padding: 0 1rem;
  z-index: 100;
  
  .track-info {
    display: flex;
    align-items: center;
    width: 30%;
    min-width: 180px;
    
    .track-cover {
      width: 56px;
      height: 56px;
      border-radius: 4px;
      margin-right: 1rem;
      object-fit: cover;
    }
    
    .track-details {
      overflow: hidden;
      
      .track-title {
        font-size: 0.9rem;
        margin: 0 0 0.2rem;
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
  }
  
  .player-controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    width: 40%;
    
    .control-btn, .play-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: var(--text-color);
      transition: transform 0.2s;
      
      &:hover {
        transform: scale(1.1);
      }
    }
    
    .play-btn {
      font-size: 2rem;
    }
  }
  
  .progress-bar {
    display: flex;
    align-items: center;
    width: 30%;
    gap: 0.5rem;
    
    .time {
      font-size: 0.8rem;
      color: var(--secondary-color);
      min-width: 40px;
      
      &.current {
        text-align: right;
      }
      
      &.duration {
        text-align: left;
      }
    }
    
    .progress-container {
      flex: 1;
      height: 4px;
      background-color: #5e5e5e;
      border-radius: 2px;
      cursor: pointer;
      position: relative;
      
      &:hover {
        .progress {
          background-color: var(--accent-color);
        }
      }
      
      .progress {
        height: 100%;
        background-color: white;
        border-radius: 2px;
        transition: width 0.1s linear;
      }
    }
  }
}

@media (max-width: 768px) {
  .player {
    flex-wrap: wrap;
    height: auto;
    padding: 0.5rem;
    
    .track-info {
      width: 100%;
      margin-bottom: 0.5rem;
    }
    
    .player-controls {
      width: 100%;
      order: 3;
    }
    
    .progress-bar {
      width: 100%;
      order: 2;
      margin-bottom: 0.5rem;
    }
  }
}
</style>