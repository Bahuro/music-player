# Music Player Application

A modern, responsive music player application built with Vue.js that integrates with the Jamendo API to stream music tracks.

## Features

- 🎵 Stream music from Jamendo's extensive library
- 🔍 Search for tracks, artists, and albums
- 🎸 Browse music by genres
- 📱 Responsive design for desktop and mobile devices
- 🎧 Full-featured audio player with play/pause, skip, and volume controls
- 📋 Create and manage playlists
- 🌙 Light/dark theme support
- 🔄 Fallback to local tracks when API is unavailable

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Jamendo API Client ID (get one from [Jamendo Developer](https://developer.jamendo.com/))

### Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/music-player.git
cd music-player
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory and add your Jamendo API Client ID:

```
VITE_JAMENDO_CLIENT_ID=your_client_id_here
```

4. Start the development server:

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
npm run build
# or
yarn build
```

## Docker Deployment

You can also run the application using Docker:

```bash
# Build the Docker image
docker build -t music-player .

# Run the container
docker run -p 5173:5173 -e VITE_JAMENDO_CLIENT_ID=your_client_id_here music-player
```

## Potential Improvements

- User authentication and profile management
- Offline mode with cached tracks
- Audio visualization features
- Social sharing capabilities
- Integration with additional music APIs
- Mobile app versions using frameworks like Capacitor or React Native
- Collaborative playlists
- Music recommendations based on listening history
- Lyrics display for tracks

## Technologies Used

- Vue.js
- Vite
- Pinia for state management
- Axios for API requests
- Vue Router

---

Built with ❤️ for music lovers everywhere.
