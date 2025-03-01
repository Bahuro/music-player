# Guía para hacer Push a GitHub

## Antes de hacer Push

Antes de subir tu proyecto de Music Player a GitHub, debes tener en cuenta lo siguiente:

### 1. Archivos sensibles

- Tu archivo `.gitignore` ya está configurado para excluir:
  - Archivos `.env` que contienen variables de entorno sensibles
  - La carpeta `node_modules`
  - Archivos de construcción y caché

### 2. Variables de entorno

- Tu aplicación utiliza `VITE_JAMENDO_CLIENT_ID` como variable de entorno para la API de Jamendo
- Asegúrate de crear un archivo `.env` local (que no se subirá a GitHub) con tu clave de API:

```
VITE_JAMENDO_CLIENT_ID=tu_client_id_de_jamendo
```

- Para despliegues, configura las variables de entorno en tu plataforma de hosting

## Pasos para hacer Push a GitHub

### Si aún no has inicializado Git en tu proyecto:

1. **Inicializa un repositorio Git local**:

```bash
git init
```

2. **Agrega tus archivos al staging area**:

```bash
git add .
```

3. **Haz tu primer commit**:

```bash
git commit -m "Versión inicial del reproductor de música"
```

4. **Crea un repositorio en GitHub**:
   - Ve a [GitHub](https://github.com/)
   - Inicia sesión en tu cuenta
   - Haz clic en el botón "+" en la esquina superior derecha y selecciona "New repository"
   - Nombra tu repositorio (por ejemplo, "music-player")
   - No inicialices el repositorio con README, .gitignore o licencia
   - Haz clic en "Create repository"

5. **Conecta tu repositorio local con GitHub**:

```bash
git remote add origin https://github.com/TU_USUARIO/music-player.git
```

6. **Sube tu código a GitHub**:

```bash
git push -u origin main
```
(Si tu rama principal se llama "master" en lugar de "main", usa `git push -u origin master`)

### Si ya has inicializado Git y solo quieres hacer push de cambios:

1. **Verifica los cambios**:

```bash
git status
```

2. **Agrega los cambios al staging area**:

```bash
git add .
```

3. **Haz un commit con un mensaje descriptivo**:

```bash
git commit -m "Descripción de los cambios realizados"
```

4. **Sube los cambios a GitHub**:

```bash
git push
```

## Buenas prácticas

- Haz commits frecuentes con mensajes descriptivos
- Actualiza tu `.gitignore` si añades nuevos archivos sensibles
- Considera usar ramas para desarrollar nuevas características
- Mantén actualizada la documentación de tu proyecto

## Solución de problemas comunes

### Error de autenticación

Si encuentras errores de autenticación, GitHub ahora utiliza tokens de acceso personal en lugar de contraseñas:

1. Ve a GitHub → Settings → Developer settings → Personal access tokens
2. Genera un nuevo token con los permisos necesarios
3. Usa este token como contraseña cuando Git lo solicite

### Conflictos de merge

Si hay conflictos entre tu código local y el repositorio remoto:

1. Primero haz `git pull` para obtener los cambios remotos
2. Resuelve los conflictos manualmente en los archivos marcados
3. Añade los archivos resueltos con `git add`
4. Completa el merge con `git commit`
5. Finalmente haz `git push`