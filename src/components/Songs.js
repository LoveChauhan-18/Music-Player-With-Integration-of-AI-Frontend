import React, { useEffect, useState } from "react";
import API from "../services/api";

function Songs() {
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    API.get("songs/").then((res) => setSongs(res.data));
  }, []);

  return (
    <div>
      <h2>Songs</h2>
      {songs.map((song) => (
        <div key={song.id}>
          {song.title} - {song.artist.name}
        </div>
      ))}
    </div>
  );
}

export default Songs;