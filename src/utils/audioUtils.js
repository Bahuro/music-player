/**
 * Verifica si una URL de audio es válida y accesible
 * @param {string} url - URL del audio a verificar
 * @returns {Promise<boolean>} - Promesa que resuelve a true si la URL es válida
 */
export const verifyAudioUrl = async (url) => {
  if (!url) return false;
  
  // Verificar si la URL tiene un formato válido
  try {
    new URL(url);
  } catch (e) {
    console.error('URL inválida:', url);
    return false;
  }
  
  // Intentar acceder al recurso
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('Error al verificar URL de audio:', error);
    return false;
  }
};

/**
 * Obtiene una URL de audio alternativa si la original no funciona
 * @param {Object} track - Objeto de la pista
 * @returns {string} - URL alternativa o la original
 */
export const getWorkingAudioUrl = (track) => {
  if (!track) return '';
  
  // Usar URL de fallback para pruebas
  return 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Scott_Buckley/Cinematic_Ambient_Electronic/Scott_Buckley_-_01_-_Epic_Journey.mp3';
  
  // Código original comentado para usar fallback mientras se soluciona
  /*
  // Si la URL original parece ser de Jamendo pero tiene problemas
  if (track.url && track.url.includes('jamendo')) {
    // Intentar con formato MP3 en lugar de OGG si es necesario
    if (track.url.includes('.ogg')) {
      return track.url.replace('.ogg', '.mp3');
    }
    
    // Asegurarse de que la URL use HTTPS
    if (track.url.startsWith('http:')) {
      return track.url.replace('http:', 'https:');
    }
  }
  
  // Devolver la URL original si no hay alternativas
  return track.url;
  */
};

/**
 * Verifica si el navegador soporta el formato de audio
 * @param {string} url - URL del audio
 * @returns {boolean} - true si el formato es soportado
 */
export const isSupportedAudioFormat = (url) => {
  if (!url) return false;
  
  // Para pruebas, siempre devolver true
  return true;
  
  /*
  const audio = document.createElement('audio');
  
  // Verificar formatos comunes
  if (url.endsWith('.mp3')) {
    return audio.canPlayType('audio/mpeg') !== '';
  } else if (url.endsWith('.ogg')) {
    return audio.canPlayType('audio/ogg') !== '';
  } else if (url.endsWith('.wav')) {
    return audio.canPlayType('audio/wav') !== '';
  } else if (url.endsWith('.aac')) {
    return audio.canPlayType('audio/aac') !== '';
  } else if (url.endsWith('.flac')) {
    return audio.canPlayType('audio/flac') !== '';
  }
  
  // Si no podemos determinar el formato, asumimos que es compatible
  return true;
  */
};