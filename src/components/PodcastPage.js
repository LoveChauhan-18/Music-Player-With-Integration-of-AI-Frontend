import React, { useState, useEffect } from "react";
import { fetchPodcasts } from "../services/musicApi";
import "./PodcastPage.css";

export default function PodcastPage({ setIsPlaying }) {
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPodcast, setSelectedPodcast] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function loadPodcasts() {
      setLoading(true);
      const data = await fetchPodcasts();
      setPodcasts(data);
      setLoading(false);
    }
    loadPodcasts();
  }, []);

  const filteredPodcasts = podcasts.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.artist.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openPodcast = (podcast) => {
    setSelectedPodcast(podcast);
    // Pause background music when video starts
    setIsPlaying(false);
  };

  const closePodcast = () => {
    setSelectedPodcast(null);
  };

  return (
    <div className="page podcast-page">
      <div className="podcast-header">
        <h1 className="page-title gradient-text">Famous Indian Podcasts</h1>
        <p className="page-subtitle">Watch and learn from India's greatest minds.</p>
        
        <div className="podcast-search">
          <span className="search-icon">🔍</span>
          <input 
            type="text" 
            placeholder="Search podcasts or creators..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="podcast-grid">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="podcast-card skeleton-card">
              <div className="skeleton-thumb" />
              <div className="skeleton-line" style={{ width: "80%" }} />
              <div className="skeleton-line" style={{ width: "60%" }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="podcast-grid">
          {filteredPodcasts.map((podcast) => (
            <div 
              key={podcast.id} 
              className="podcast-card"
              onClick={() => openPodcast(podcast)}
            >
              <div className="podcast-thumb-wrapper">
                <img src={podcast.artwork} alt={podcast.title} className="podcast-thumb" />
                <div className="play-overlay">
                  <span className="play-icon">▶</span>
                </div>
                {podcast.duration > 0 && (
                  <span className="duration-tag">{Math.floor(podcast.duration / 60)}m</span>
                )}
              </div>
              <div className="podcast-info">
                <h3 className="podcast-title">{podcast.title}</h3>
                <p className="podcast-artist">{podcast.artist}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video Modal */}
      {selectedPodcast && (
        <div className="video-modal-overlay" onClick={closePodcast}>
          <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={closePodcast}>✕</button>
            <div className="video-wrapper">
              <iframe
                src={`https://www.youtube.com/embed/${selectedPodcast.id}?autoplay=1&enablejsapi=1&rel=0`}
                title={selectedPodcast.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <div className="modal-info">
              <h2 className="modal-title">{selectedPodcast.title}</h2>
              <p className="modal-artist">{selectedPodcast.artist}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
