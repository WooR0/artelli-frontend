import { useState } from 'react'
import './ArtworkChat.css'
import ChatDisplay from './ChatDisplay'
import AudioRecorder from './AudioRecorder'
import { getArtworkDetail } from '../data/artworkDetails'

function ArtworkChat({ 
  artwork, 
  onBack,
  onStartChat
}) {
  const [isLiked, setIsLiked] = useState(false)

  const handleChatStart = () => {
    onStartChat()
  }

  const handleLikeToggle = () => {
    setIsLiked(!isLiked)
  }

  const artworkDetail = getArtworkDetail(artwork.slug)
  const displayTitle = artworkDetail?.title || artwork.title
  const displayArtist = artworkDetail?.artist || artwork.artist
  const displayYear = artworkDetail?.year || artwork.year
  const displayMedium = artworkDetail?.medium || '캔버스에 유채, 000 x 000'
  const ctaColor = artworkDetail?.ctaColor || '#89AB9C'
  const sections = artworkDetail?.sections || []

  return (
    <div className="artwork-detail-viewport">
      <div className="artwork-detail-shell">
        <div className="artwork-detail-container">
          {/* Header - 작품 이미지 + 반투명 오버레이 */}
          <div className="artwork-hero-image">
            <img 
              src={artwork.imageUrl} 
              alt={artwork.title}
            />
            <div className="artwork-hero-overlay"></div>
          </div>

          {/* 뒤로가기 버튼 - 독립적으로 위치 */}
          {onBack && (
            <button className="back-button" onClick={onBack} aria-label="뒤로가기">
              <img src="/images/back-button.svg" alt="뒤로가기" width="48" height="48" />
            </button>
          )}

          {/* Top area - 작품 정보 + 아이콘 */}
          <div className="artwork-top-area">
            <div className="artwork-info-header">
              <h1 className="artwork-title">{displayTitle}</h1>
              <div className="artwork-meta">
                <span className="artwork-artist">{displayArtist}</span>
                <span className="artwork-dot">•</span>
                <span className="artwork-year">{displayYear}</span>
              </div>
              <p className="artwork-medium">{displayMedium}</p>
            </div>

            <div className="artwork-actions">
              <button 
                className={`heart-button ${isLiked ? 'liked' : ''}`}
                onClick={handleLikeToggle}
                aria-label={isLiked ? '좋아요 취소' : '좋아요'}
              >
                <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
                  <path 
                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" 
                    fill={isLiked ? '#FF6B6B' : 'none'}
                    stroke={isLiked ? '#FF6B6B' : '#111111'}
                    strokeWidth="1.5"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Scroll area - 본문 */}
          <div className="artwork-content-scroll">
            <div className="artwork-content">
              {sections.map((section, index) => (
                <section key={index} className="content-section">
                  <h2 className="section-title">{section.title}</h2>
                  <p className="section-text">{section.content}</p>
                </section>
              ))}
            </div>
          </div>

          {/* Bottom area - CTA 버튼 */}
          <div className="artwork-bottom-bar">
            <button 
              className="chat-cta-button" 
              style={{ background: ctaColor }}
              onClick={handleChatStart}
            >
              작품과 대화하기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ArtworkChat

