<template>
  <div class="music-player">
    <div class="player-content">
      <div class="track-info">
        <img :src="currentTrack.cover || '/default-cover.jpg'" alt="Album cover" class="cover-art" />
        <div class="track-details">
          <h3 class="track-title">{{ currentTrack.title }}</h3>
          <p class="track-artist">{{ currentTrack.artist }}</p>
        </div>
        <button @click="toggleFavorite" class="favorite-btn">
          <span v-if="isFavorite">❤️</span>
          <span v-else>🤍</span>
        </button>
      </div>

      <div class="player-controls">
        <div class="main-controls">
          <button @click="shuffle" class="control-btn" :class="{ active: isShuffled }">
            🔀
          </button>
          <button @click="previous" class="control-btn">⏮️</button>
          <button @click="togglePlay" class="play-btn">
            {{ isPlaying ? '⏸️' : '▶️' }}
          </button>
          <button @click="next" class="control-btn">⏭️</button>
          <button @click="toggleLoop" class="control-btn" :class="{ active: loopMode !== 'none' }">
            {{ loopMode === 'one' ? '🔂' : '🔁' }}
          </button>
        </div>

        <div class="progress-container">
          <span class="time">{{ formatTime(currentTime) }}</span>
          <div class="progress-bar" @click="seek">
            <div class="progress" :style="{ width: `${progress}%` }"></div>
          </div>
          <span class="time">{{ formatTime(duration) }}</span>
        </div>
      </div>

      <div class="volume-controls">
        <button @click="toggleMute" class="volume-btn">
          {{ isMuted ? '🔇' : volume > 0.5 ? '🔊' : '🔉' }}
        </button>
        <input
          type="range"
          min="0"
          max="100"
          v-model="volumeValue"
          @input="changeVolume"
          class="volume-slider"
        />
        <button @click="toggleQueue" class="queue-btn">
          📋
        </button>
      </div>
    </div>

    <div v-if="showQueue" class="queue-panel">
      <h3>Up Next</h3>
      <ul class="queue-list">
        <li
          v-for="(track, index) in queue"
          :key="index"
          :class="{ 'current-track': index === currentIndex }"
          @click="playTrack(index)"
        >
          <img :src="track.cover || '/default-cover.jpg'" alt="Cover" class="queue-cover" />
          <div class="queue-track-info">
            <span class="queue-title">{{ track.title }}</span>
            <span class="queue-artist">{{ track.artist }}</span>
          </div>
          <span class="queue-duration">{{ formatTime(track.duration) }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { Howl } from 'howler';
import { usePlayerStore } from '../../stores/player';

const playerStore = usePlayerStore();

// Player state
const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const volume = ref(0.8);
const isMuted = ref(false);
const isShuffled = ref(false);
const loopMode = ref('none'); // 'none', 'all', 'one'
const showQueue = ref(false);
const sound = ref(null);

// Computed properties
const currentTrack = computed(() => playerStore.currentTrack || {});
const queue = computed(() => playerStore.queue);
const currentIndex = computed(() => playerStore.currentIndex);
const progress = computed(() => (duration.value ? (currentTime.value / duration.value) * 100 : 0));
const volumeValue = computed(() => volume.value * 100);
const isFavorite = computed(() => playerStore.favorites.some(track => track.id === currentTrack.value.id));

// Methods
const togglePlay = () => {
  if (!sound.value) return;
  
  if (isPlaying.value) {
    sound.value.pause();
  } else {
    sound.value.play();
  }
  
  isPlaying.value = !isPlaying.value;
};

const next = () => {
  playerStore.nextTrack();
};

const previous = () => {
  playerStore.previousTrack();
};

const seek = (event) => {
    if (!sound.value) return;
    
    const container = event.currentTarget;
    const clickPosition = event.clientX - container.getBoundingClientRect().left;
    const containerWidth = container.offsetWidth;
    const seekPercentage = clickPosition / containerWidth;
    const seekTime = duration.value * seekPercentage;
    
    sound.value.seek(seekTime);
    currentTime.value = seekTime;
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const changeVolume = () => {
    volume.value = volumeValue.value / 100;
    if (sound.value) {
      sound.value.volume(volume.value);
    }
    if (volume.value > 0) {
      isMuted.value = false;
    }
    // Save volume to localStorage immediately when changed
    localStorage.setItem('playerVolume', volume.value.toString());
  };

  const toggleMute = () => {
    isMuted.value = !isMuted.value;
    if (sound.value) {
      sound.value.mute(isMuted.value);
    }
  };

  const toggleLoop = () => {
    if (loopMode.value === 'none') {
      loopMode.value = 'all';
    } else if (loopMode.value === 'all') {
      loopMode.value = 'one';
    } else {
      loopMode.value = 'none';
    }
    playerStore.setLoopMode(loopMode.value);
  };

  const shuffle = () => {
    isShuffled.value = !isShuffled.value;
    playerStore.toggleShuffle(isShuffled.value);
  };

  const toggleFavorite = () => {
    playerStore.toggleFavorite(currentTrack.value);
  };

  const toggleQueue = () => {
    showQueue.value = !showQueue.value;
  };

  const playTrack = (index) => {
    playerStore.playTrack(index);
  };

  const setupAudio = () => {
    if (sound.value) {
      sound.value.unload();
    }

    if (!currentTrack.value || !currentTrack.value.url) return;

    // Get the current volume from localStorage to ensure consistency
    const savedVolume = localStorage.getItem('playerVolume');
    if (savedVolume !== null) {
      volume.value = parseFloat(savedVolume);
    }

    sound.value = new Howl({
      src: [currentTrack.value.url],
      html5: true,
      volume: volume.value,
      onplay: () => {
        isPlaying.value = true;
        // Ensure volume is set correctly when playing
        sound.value.volume(volume.value);
        if (isMuted.value) {
          sound.value.mute(true);
        }
        requestAnimationFrame(updateProgress);
      },
      onpause: () => {
        isPlaying.value = false;
      },
      onend: () => {
        if (loopMode.value === 'one') {
          sound.value.play();
        } else {
          next();
        }
      },
      onload: () => {
        duration.value = sound.value.duration();
      },
      onloaderror: (id, error) => {
        console.error('Error loading audio:', error);
        next(); // Skip to next track if there's an error
      }
    });

    if (isPlaying.value) {
      sound.value.play();
    }
  };

  const updateProgress = () => {
    if (sound.value && isPlaying.value) {
      currentTime.value = sound.value.seek();
      requestAnimationFrame(updateProgress);
    }
  };

  // Watch for track changes
  watch(() => playerStore.currentTrack, (newTrack) => {
    if (newTrack) {
      setupAudio();
    }
  }, { immediate: true });

  // Watch for loop mode changes from store
  watch(() => playerStore.loopMode, (newMode) => {
    loopMode.value = newMode;
  });

  // Watch for shuffle changes from store
  watch(() => playerStore.isShuffled, (newValue) => {
    isShuffled.value = newValue;
  });

  // Cleanup on component unmount
  onUnmounted(() => {
    if (sound.value) {
      sound.value.unload();
    }
  });

  // Initialize audio on mount
  onMounted(() => {
    if (currentTrack.value && currentTrack.value.url) {
      setupAudio();
    }
    
    // Restore volume from localStorage if available
    const savedVolume = localStorage.getItem('playerVolume');
    if (savedVolume !== null) {
      volume.value = parseFloat(savedVolume);
    }
  });

  // Save volume to localStorage when it changes
  watch(volume, (newVolume) => {
    localStorage.setItem('playerVolume', newVolume.toString());
  });
</script>

<style lang="scss" scoped>
.music-player {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: var(--player-bg);
  border-top: 1px solid var(--border-color);
  padding: 0.5rem;
  z-index: 100;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.player-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0.5rem;
}

.track-info {
  display: flex;
  align-items: center;
  width: 25%;
  min-width: 200px;
  
  .cover-art {
    width: 56px;
    height: 56px;
    border-radius: 4px;
    object-fit: cover;
    margin-right: 1rem;
  }
  
  .track-details {
    overflow: hidden;
    
    .track-title {
      font-size: 0.9rem;
      font-weight: 600;
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
  
  .favorite-btn {
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    margin-left: 1rem;
    padding: 0.3rem;
    border-radius: 50%;
    transition: transform 0.2s;
    
    &:hover {
      transform: scale(1.1);
    }
  }
}

.player-controls {
  flex: 1;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  .main-controls {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.5rem;
    
    .control-btn {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      font-size: 1rem;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 50%;
      transition: all 0.2s ease;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      
      &:hover {
        background-color: var(--hover-color);
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
      }
      
      &:active {
        transform: translateY(0);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }
      
      &.active {
        color: var(--accent-color);
        border-color: var(--accent-color);
        background-color: rgba(25, 163, 74, 0.1);
      }
    }
    .play-btn {
      background: var(--accent-color);
      color: white;
      border: none;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.3rem;
      cursor: pointer;
      transition: all 0.3s ease;
      background-color: #19a34a;
      box-shadow: 0 3px 10px rgba(25, 163, 74, 0.3);
      
      &:hover {
        transform: scale(1.08);
        background-color: #158f3e;
        box-shadow: 0 5px 15px rgba(25, 163, 74, 0.4);
      }
      
      &:active {
        transform: scale(0.95);
        box-shadow: 0 2px 5px rgba(25, 163, 74, 0.3);
      }
    }
  }
  .progress-container {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    
    .time {
      font-size: 0.7rem;
      color: var(--secondary-color);
      min-width: 35px;
    }
    .progress-bar {
      flex: 1;
      height: 4px;
      background-color: var(--progress-bg);
      border-radius: 2px;
      cursor: pointer;
      position: relative;
      &:hover {
        height: 6px;
        .progress {
          height: 6px;
        }
      }
      .progress {
        position: absolute;
        left: 0;
        top: 0;
        height: 4px;
        background-color: var(--accent-color);
        border-radius: 2px;
      }
    }
  }
}
.volume-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 20%;
  min-width: 150px;
  justify-content: flex-end;
  .volume-btn, .queue-btn {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    font-size: 1rem;
    cursor: pointer;
    padding: 0.4rem;
    border-radius: 50%;
    transition: all 0.2s ease;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    &:hover {
      background-color: var(--hover-color);
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }
    &:active {
      transform: translateY(0);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
  }
  .volume-slider {
    width: 80px;
    height: 6px;
    -webkit-appearance: none;
    appearance: none;
    background: var(--progress-bg);
    border-radius: 3px;
    outline: none;
    cursor: pointer;
    transition: height 0.2s ease;
    
    &:hover {
      height: 8px;
    }
    
    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: var(--accent-color);
      cursor: pointer;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      
      &:hover {
        transform: scale(1.1);
        box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
      }
    }
    
    &::-moz-range-thumb {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: var(--accent-color);
      cursor: pointer;
      border: none;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      
      &:hover {
        transform: scale(1.1);
        box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
      }
    }
  }
}
.queue-panel {
  position: absolute;
  bottom: 100%;
  right: 0;
  width: 350px;
  max-height: 400px;
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px 8px 0 0;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  overflow-y: auto;
  h3 {
    margin-top: 0;
    margin-bottom: 1rem;
    font-size: 1rem;
  }
  .queue-list {
    list-style: none;
    padding: 0;
    margin: 0;
    li {
      display: flex;
      align-items: center;
      padding: 0.5rem;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s;
      &:hover {
        background-color: var(--hover-color);
      }
      &.current-track {
        background-color: var(--hover-color);
        .queue-title {
          color: var(--accent-color);
        }
      }
      .queue-cover {
        width: 40px;
        height: 40px;
        border-radius: 4px;
        object-fit: cover;
        margin-right: 0.8rem;
      }
      .queue-track-info {
        flex: 1;
        overflow: hidden;
        .queue-title {
          display: block;
          font-size: 0.85rem;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .queue-artist {
          display: block;
          font-size: 0.75rem;
          color: var(--secondary-color);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
      .queue-duration {
        font-size: 0.75rem;
        color: var(--secondary-color);
        margin-left: 0.5rem;
      }
    }
  }
}
// Responsive adjustments
@media (max-width: 768px) {
  .player-content {
    flex-direction: column;
    gap: 1rem;
  }
  .track-info {
    width: 100%;
    justify-content: center;
  }
  .player-controls {
    width: 100%;
  }
  .volume-controls {
    width: 100%;
    justify-content: center;
  }
  .queue-panel {
    width: 100%;
    max-height: 300px;
  }
}
</style>