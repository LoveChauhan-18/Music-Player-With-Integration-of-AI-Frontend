import React, { useEffect, useState } from "react";
import API from "../services/api";

function Playlist() {
  const [playlists, setPlaylists] = useState([]);
  const [name, setName] = useState("");

  const fetchPlaylists = async () => {
    const res = await API.get("playlists/");
    setPlaylists(res.data);
  };

  const createPlaylist = async () => {
    await API.post("playlists/", { name });
    fetchPlaylists();
  };

  useEffect(() => {
    fetchPlaylists();
  }, []);

  return (
    <div>
      <h2>Playlist</h2>
      <input placeholder="Playlist name"
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={createPlaylist}>Create</button>

      {playlists.map((p) => (
        <div key={p.id}>{p.name}</div>
      ))}
    </div>
  );
}

export default Playlist;