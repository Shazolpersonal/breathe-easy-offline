export interface PlaylistStep {
  techniqueId: string;
  durationMinutes: number;
}

export interface Playlist {
  id: string;
  name: string;
  steps: PlaylistStep[];
}

const STORAGE_KEY = "breathe_playlists";

export function getPlaylists(): Playlist[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function savePlaylist(playlist: Playlist) {
  const all = getPlaylists();
  const idx = all.findIndex(p => p.id === playlist.id);
  if (idx >= 0) all[idx] = playlist;
  else all.push(playlist);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function deletePlaylist(id: string) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(getPlaylists().filter(p => p.id !== id)));
}
