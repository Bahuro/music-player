<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { usePlayerStore } from '../stores/player';
import { Howl } from 'howler';

const playerStore = usePlayerStore();

// Estado local
const sound = ref(null);
const volume = ref(0.5); // Volumen inicial al 50%
const duration = ref(0);
const currentTime = ref(0);
const isPlaying = ref(false);
const isMuted = ref(false);
const previousVolume = ref(0.5);
const loopMode = ref('none'); // 'none', 'one', 'all'

// Computed properties
const currentTrack = computed(() => playerStore.currentTrack);
const progress = computed(() => (currentTime.value / duration.value) * 100 || 0);

// Watchers
watch(volume, (newVolume) => {
  if (sound.value) {
    sound.value.volume(newVolume);
  }
});

watch(() => playerStore.currentTrack, (newTrack) => {
  if (newTrack) {
    setupAudio();
  }
});

// Método para configurar el audio
const setupAudio = () => {
  if (!currentTrack.value) {
    console.error('No hay pista actual disponible');
    return;
  }
  
  if (sound.value) {
    sound.value.unload();
  }

  sound.value = new Howl({
    src: [currentTrack.value.url],
    html5: true,
    volume: volume.value,
    format: ['mp3'],
    onplay: () => {
      isPlaying.value = true;
      playerStore.isPlaying = true;
      requestAnimationFrame(updateProgress);
    },
    onpause: () => {
      isPlaying.value = false;
      playerStore.isPlaying = false;
    },
    onend: () => {
      if (loopMode.value === 'one') {
        sound.value.play();
      } else {
        playerStore.nextTrack();
      }
    },
    onload: () => {
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

// Métodos de control
const togglePlay = () => {
  if (!sound.value) return;
  
  if (sound.value.playing()) {
    sound.value.pause();
  } else {
    sound.value.play();
  }
};

const updateProgress = () => {
  if (sound.value && sound.value.playing()) {
    currentTime.value = sound.value.seek();
    requestAnimationFrame(updateProgress);
  }
};

const seek = (event) => {
  if (!sound.value) return;
  
  const progressBar = event.target;
  const percent = event.offsetX / progressBar.offsetWidth;
  const seekTime = duration.value * percent;
  
  sound.value.seek(seekTime);
  currentTime.value = seekTime;
};

const toggleMute = () => {
  if (!sound.value) return;
  
  if (isMuted.value) {
    volume.value = previousVolume.value;
    isMuted.value = false;
  } else {
    previousVolume.value = volume.value;
    volume.value = 0;
    isMuted.value = true;
  }
};

const setVolume = (event) => {
  const newVolume = parseFloat(event.target.value);
  volume.value = newVolume;
  if (newVolume > 0) {
    isMuted.value = false;
  }
};

const toggleLoopMode = () => {
  const modes = ['none', 'one', 'all'];
  const currentIndex = modes.indexOf(loopMode.value);
  loopMode.value = modes[(currentIndex + 1) % modes.length];
  playerStore.setLoopMode(loopMode.value);
};

// Formateo de tiempo
const formatTime = (seconds) => {
  if (!seconds) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Cleanup al desmontar
onMounted(() => {
  // Restaurar volumen guardado
  const savedVolume = localStorage.getItem('playerVolume');
  if (savedVolume !== null) {
    volume.value = parseFloat(savedVolume);
  }
});

// Guardar volumen cuando cambie
watch(volume, (newVolume) => {
  localStorage.setItem('playerVolume', newVolume.toString());
});
</script>

<template>
  <div class="music-player" :class="{ 'is-playing': isPlaying }">
    <div class="progress-bar" @click="seek">
      <div class="progress" :style="{ width: `${progress}%` }"></div>
    </div>
    
    <div class="player-content">
      <div class="track-info">
        <img 
          v-if="currentTrack" 
          :src="currentTrack.cover" 
          :alt="currentTrack.title" 
          class="track-cover"
        />
        <div class="track-details">
          <span class="track-title">{{ currentTrack?.title || 'No track selected' }}</span>
          <span class="track-artist">{{ currentTrack?.artist || '' }}</span>
        </div>
      </div>
      
      <div class="player-controls">
        <div class="time-info">
          <span class="current-time">{{ formatTime(currentTime) }}</span>
          <span class="duration">{{ formatTime(duration) }}</span>
        </div>
        
        <div class="main-controls">
          <button 
            class="control-btn shuffle" 
            :class="{ active: playerStore.isShuffled }"
            @click="playerStore.toggleShuffle(!playerStore.isShuffled)"
          >
            🔀
          </button>
          
          <button 
            class="control-btn previous" 
            @click="playerStore.previousTrack"
            :disabled="!playerStore.hasPrevious"
          >
            ⏮️
          </button>
          
          <button class="control-btn play-pause" @click="togglePlay">
            {{ isPlaying ? '⏸️' : '▶️' }}
          </button>
          
          <button 
            class="control-btn next" 
            @click="playerStore.nextTrack"
            :disabled="!playerStore.hasNext"
          >
            ⏭️
          </button>
          
          <button 
            class="control-btn loop" 
            :class="loopMode"
            @click="toggleLoopMode"
          >
            {{ loopMode === 'one' ? '🔂' : '🔁' }}
          </button>
        </div>
      </div>
      
      <div class="volume-controls">
        <button class="volume-btn" @click="toggleMute">
          {{ isMuted ? '🔇' : volume.value > 0.5 ? '🔊' : '🔉' }}
        </button>
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.01" 
          :value="volume"
          @input="setVolume"
          class="volume-slider"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.music-player {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--background-color);
  border-top: 1px solid var(--border-color);
  padding: 0.5rem;
  z-index: 1000;
  
  .progress-bar {
    width: 100%;
    height: 4px;
    background: var(--border-color);
    cursor: pointer;
    position: absolute;
    top: 0;
    left: 0;
    transform: translateY(-50%);
    
    .progress {
      height: 100%;
      background: var(--accent-color);
      transition: width 0.1s linear;
    }
  }
  
  .player-content {
    display: grid;
    grid-template-columns: 1fr 2fr 1fr;
    align-items: center;
    gap: 1rem;
    padding: 0.5rem;
    
    .track-info {
      display: flex;
      align-items: center;
      gap: 1rem;
      
      .track-cover {
        width: 50px;
        height: 50px;
        object-fit: cover;
        border-radius: 4px;
      }
      
      .track-details {
        display: flex;
        flex-direction: column;
        
        .track-title {
          font-weight: 500;
          margin-bottom: 0.2rem;
        }
        
        .track-artist {
          font-size: 0.8rem;
          color: var(--secondary-color);
        }
      }
    }
    
    .player-controls {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      
      .time-info {
        display: flex;
        justify-content: space-between;
        width: 100%;
        font-size: 0.8rem;
        color: var(--secondary-color);
      }
      
      .main-controls {
        display: flex;
        align-items: center;
        gap: 1rem;
        
        .control-btn {
          background: none;
          border: none;
          cursor: pointer;
          opacity: 0.7;
          transition: opacity 0.2s;
          
          &:hover {
            opacity: 1;
          }
          
          &:disabled {
            opacity: 0.3;
            cursor: not-allowed;
          }
          
          &.active {
            color: var(--accent-color);
            opacity: 1;
          }
          
          &.play-pause {
            font-size: 1.5rem;
          }
        }
      }
    }
    
    .volume-controls {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      justify-content: flex-end;
      
      .volume-btn {
        background: none;
        border: none;
        cursor: pointer;
        opacity: 0.7;
        
        &:hover {
          opacity: 1;
        }
      }
      
      .volume-slider {
        width: 100px;
        height: 4px;
        -webkit-appearance: none;
        background: var(--border-color);
        border-radius: 2px;
        outline: none;
        
        &::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: var(--accent-color);
          cursor: pointer;
        }
        
        &::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border: none;
          border-radius: 50%;
          background: var(--accent-color);
          cursor: pointer;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .music-player .player-content {
    grid-template-columns: 1fr;
    gap: 0.5rem;
    
    .track-info {
      justify-content: center;
    }
    
    .volume-controls {
      justify-content: center;
    }
  }
}
</style>