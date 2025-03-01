<template>
  <div class="track-card">
    <div class="cover-container" @click="handlePlay">
      <img :src="track.cover" :alt="track.title" class="track-cover" />
      <div class="play-overlay">
        <button class="play-btn">
          <span>▶️</span>
        </button>
      </div>
    </div>
    <div class="track-info">
      <h3 class="track-title">{{ track.title }}</h3>
      <p class="track-artist">{{ track.artist }}</p>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  track: {
    type: Object,
    required: true
  },
  trackList: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['play']);

const handlePlay = () => {
  // Emitir solo la canción y su lista
  emit('play', props.track, props.trackList);
};
</script>

<style lang="scss" scoped>
.track-card {
  cursor: pointer;
  transition: transform 0.3s;
  
  &:hover {
    transform: translateY(-5px);
    
    .play-overlay {
      opacity: 1;
    }
  }
  
  .cover-container {
    position: relative;
    margin-bottom: 0.8rem;
    
    .track-cover {
      width: 100%;
      aspect-ratio: 1;
      object-fit: cover;
      border-radius: 8px;
    }
    
    .play-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.3);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s;
      
      .play-btn {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background-color: var(--accent-color);
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: transform 0.2s;
        
        &:hover {
          transform: scale(1.1);
        }
        
        span {
          font-size: 1.5rem;
        }
      }
    }
  }
  
  .track-info {
    .track-title {
      font-size: 0.9rem;
      margin: 0 0 0.3rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .track-artist {
      color: var(--secondary-color);
      font-size: 0.8rem;
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}
</style>