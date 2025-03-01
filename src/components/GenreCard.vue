<template>
  <div class="genre-card" @click="$emit('click', genre)">
    <div class="genre-cover-container">
      <img :src="genre.cover" :alt="genre.name" class="genre-cover" />
      <div class="genre-overlay"></div>
    </div>
    <div class="genre-info">
      <h3 class="genre-name">{{ genre.name }}</h3>
      <p class="genre-count">{{ genre.trackCount }} canciones</p>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

defineProps({
  genre: {
    type: Object,
    required: true
  }
});

defineEmits(['click']);
</script>

<style lang="scss" scoped>
.genre-card {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s;
  
  &:hover {
    transform: scale(1.05);
    
    .genre-overlay {
      background-color: rgba(0, 0, 0, 0.3);
    }
  }
  
  .genre-cover-container {
    position: relative;
    width: 100%;
    padding-top: 100%; // Mantener relación de aspecto 1:1
    
    .genre-cover {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .genre-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      transition: background-color 0.3s;
    }
  }
  
  .genre-info {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    padding: 1rem;
    
    .genre-name {
      color: white;
      font-size: 1.1rem;
      font-weight: 700;
      margin: 0 0 0.2rem;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
    }
    
    .genre-count {
      color: rgba(255, 255, 255, 0.8);
      font-size: 0.8rem;
      margin: 0;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
    }
  }
}
</style>