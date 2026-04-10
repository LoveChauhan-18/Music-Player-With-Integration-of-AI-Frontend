import React, { useState, useEffect } from "react";
import { fetchCartoons } from "../services/musicApi";
import "./CartoonPage.css";

export default function CartoonPage({ setIsPlaying }) {
  const [seriesList, setSeriesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCount, setVisibleCount] = useState(20);

  useEffect(() => {
    setVisibleCount(20);
  }, [selectedSeries, searchTerm]);

  useEffect(() => {
    async function loadCartoons() {
      setLoading(true);
      const data = await fetchCartoons();
      setSeriesList(data);
      setLoading(false);
    }
    loadCartoons();
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

  // Series List
  const uniqueSeriesNames = Array.from(new Set(filteredSeries.map(s => s.series)));
  const visibleSeriesNames = uniqueSeriesNames.slice(0, visibleCount);

  // Episodes List
  const seenEps = new Set();
  const uniqueEpisodes = filteredEpisodes.filter(e => {
    if (seenEps.has(e.id)) return false;
    seenEps.add(e.id);
    return true;
  });
  const visibleUniqueEpisodes = uniqueEpisodes.slice(0, visibleCount);

  return (
    <div className="page cartoon-page">
      <div className="cartoon-header">
        <h1 className="page-title gradient-text-cyan">
          {selectedSeries ? selectedSeries.series : "Cartoon Universe"}
        </h1>
        <p className="page-subtitle">
          {selectedSeries ? `Choose an episode from ${selectedSeries.series}` : "Your favorite animated shows, all in one place."}
        </p>

        <div className="cartoon-actions">
          {selectedSeries && (
            <button className="btn btn-secondary back-btn" onClick={() => setSelectedSeries(null)}>
              ← Back to Shows
            </button>
          )}
          <div className="cartoon-search">
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
        <div className="cartoon-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="cartoon-card skeleton-card">
              <div className="skeleton-thumb" style={{ aspectRatio: selectedSeries ? "16/9" : "1/1" }} />
              <div className="skeleton-line" style={{ width: "80%" }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="cartoon-grid">
          {!selectedSeries ? (
            // SERIES VIEW - Deduplicate just in case
            visibleSeriesNames.map(seriesName => {
              const s = filteredSeries.find(x => x.series === seriesName);
              return (
                <div key={s.series} className="cartoon-card series-card" onClick={() => setSelectedSeries(s)}>
                  <div className="cartoon-thumb-wrapper series-thumb">
                    <img 
                      src={s.artwork} 
                      alt={s.series} 
                      className="cartoon-thumb" 
                      onError={(e) => { e.target.src = "https://placehold.co/400x400/1e1e2e/cyan?text=Series"; }}
                    />
                    <div className="episode-count-badge">{s.episodes.length} Episodes</div>
                  </div>
                  <div className="cartoon-info">
                    <h3 className="cartoon-title">{s.series}</h3>
                  </div>
                </div>
              );
            })
          ) : (
            // EPISODE VIEW - Deduplicate episodes by ID
            visibleUniqueEpisodes.map((episode) => (
              <div key={episode.id} className="cartoon-card episode-card" onClick={() => openEpisode(episode)}>
                  <div className="cartoon-thumb-wrapper">
                    <img 
                      src={episode.artwork} 
                      alt={episode.title} 
                      className="cartoon-thumb" 
                      onError={(e) => { e.target.src = "https://placehold.co/600x337/1e1e2e/cyan?text=Episode"; }}
                    />
                    <div className="play-overlay">
                      <span className="play-icon">▶</span>
                    </div>
                    {episode.duration > 0 && (
                      <span className="duration-tag">{Math.floor(episode.duration / 60)}m</span>
                    )}
                  </div>
                  <div className="cartoon-info">
                    <h3 className="cartoon-title episode-title">{episode.title}</h3>
                  </div>
                </div>
            ))
          )}
        </div>
      )}

      {!loading && !selectedSeries && visibleCount < uniqueSeriesNames.length && (
        <div style={{ textAlign: "center", marginTop: 40, paddingBottom: 40 }}>
          <button 
            className="btn btn-secondary" 
            onClick={() => setVisibleCount(prev => prev + 20)}
            style={{ padding: "12px 32px", fontSize: 16 }}
          >
            Load More Shows
          </button>
        </div>
      )}
      {!loading && selectedSeries && visibleCount < uniqueEpisodes.length && (
        <div style={{ textAlign: "center", marginTop: 40, paddingBottom: 40 }}>
          <button 
            className="btn btn-secondary" 
            onClick={() => setVisibleCount(prev => prev + 20)}
            style={{ padding: "12px 32px", fontSize: 16 }}
          >
            Load More Episodes
          </button>
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
