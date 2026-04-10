import React, { useState, useEffect } from "react";
import { fetchAnime } from "../services/musicApi";
import "./AnimePage.css";

export default function AnimePage({ setIsPlaying }) {
  const [seriesList, setSeriesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function loadAnime() {
      setLoading(true);
      const data = await fetchAnime();
      setSeriesList(data);
      setLoading(false);
    }
    loadAnime();
  }, []);

  const openEpisode = (episode) => {
    setSelectedEpisode(episode);
    setIsPlaying(false);
  };

  const closeEpisode = () => setSelectedEpisode(null);

  const filteredSeries = seriesList.filter(s => 
    s.series.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEpisodes = selectedSeries?.episodes.filter(e =>
    e.title.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="page anime-page">
      <div className="anime-header">
        <h1 className="page-title gradient-text-orange">
          {selectedSeries ? selectedSeries.series : "Anime Hub"}
        </h1>
        <p className="page-subtitle">
          {selectedSeries ? `Choose an episode from ${selectedSeries.series}` : "Experience the world of legendary anime heroes."}
        </p>

        <div className="anime-actions">
          {selectedSeries && (
            <button className="btn btn-secondary back-btn" onClick={() => setSelectedSeries(null)}>
              ← Back to Anime
            </button>
          )}
          <div className="anime-search">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder={selectedSeries ? "Search episodes..." : "Search shows..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="anime-grid">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="anime-card skeleton-card">
              <div className="skeleton-thumb" style={{ aspectRatio: selectedSeries ? "16/9" : "2/3" }} />
              <div className="skeleton-line" style={{ width: "80%" }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="anime-grid">
          {!selectedSeries ? (
            // SERIES VIEW - Deduplicate
            Array.from(new Set(filteredSeries.map(s => s.series))).map(seriesName => {
              const s = filteredSeries.find(x => x.series === seriesName);
              return (
                <div key={s.series} className="anime-card series-card" onClick={() => setSelectedSeries(s)}>
                  <div className="anime-thumb-wrapper series-thumb">
                    <img 
                      src={s.artwork} 
                      alt={s.series} 
                      className="anime-thumb" 
                      onError={(e) => { e.target.src = "https://placehold.co/400x600/1e1e2e/orange?text=Anime"; }}
                    />
                    <div className="episode-count-badge">{s.episodes.length} Episodes</div>
                  </div>
                  <div className="anime-info">
                    <h3 className="anime-title">{s.series}</h3>
                  </div>
                </div>
              );
            })
          ) : (
            // EPISODE VIEW - Deduplicate by ID
            (() => {
              const seen = new Set();
              return filteredEpisodes.filter(e => {
                if (seen.has(e.id)) return false;
                seen.add(e.id);
                return true;
              }).map((episode) => (
                <div key={episode.id} className="anime-card episode-card" onClick={() => openEpisode(episode)}>
                  <div className="anime-thumb-wrapper">
                    <img 
                      src={episode.artwork} 
                      alt={episode.title} 
                      className="anime-thumb" 
                      onError={(e) => { e.target.src = "https://placehold.co/600x337/1e1e2e/orange?text=Episode"; }}
                    />
                    <div className="play-overlay">
                      <span className="play-icon">▶</span>
                    </div>
                    {episode.duration > 0 && (
                      <span className="duration-tag">{Math.floor(episode.duration / 60)}m</span>
                    )}
                  </div>
                  <div className="anime-info">
                    <h3 className="anime-title episode-title">{episode.title}</h3>
                  </div>
                </div>
              ));
            })()
          )}
        </div>
      )}

      {/* Video Modal */}
      {selectedEpisode && (
        <div className="video-modal-overlay" onClick={closeEpisode}>
          <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={closeEpisode}>✕</button>
            <div className="video-wrapper">
              <iframe
                src={`https://www.youtube.com/embed/${selectedEpisode.id}?autoplay=1&enablejsapi=1&rel=0`}
                title={selectedEpisode.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <div className="modal-info">
              <h2 className="modal-title">{selectedEpisode.title}</h2>
              <p className="modal-artist">{selectedSeries?.series}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
