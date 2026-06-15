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
    return getJSON(STORAGE_KEY, []);
  } catch { return []; }
}

export function savePlaylist(playlist: Playlist) {
  const all = getPlaylists();
  const idx = all.findIndex(p => p.id === playlist.id);
  if (idx >= 0) all[idx] = playlist;
  else all.push(playlist);
  setJSON(STORAGE_KEY, all);
}

export function deletePlaylist(id: string) {
  setJSON(STORAGE_KEY, getPlaylists().filter(p => p.id !== id));
}
