import { useState } from 'react'
import './ArtworkGallery.css'
import { getAllArtworks } from '../data/artworks'

function ArtworkGallery({ onSelectArtwork, onBack }) {
  const artworks = getAllArtworks()
  const [selectedSlug, setSelectedSlug] = useState(null)

  const handleSelect = (artwork) => {
    setSelectedSlug(artwork.slug)
    // 약간의 딜레이 후 전환 (애니메이션 효과)
    setTimeout(() => {
      onSelectArtwork(artwork)
    }, 300)
  }

  return (
    <div className="gallery-viewport">
      <div className="gallery-shell">
        <div className="gallery-container">
          {/* 상단 헤더 */}
          <div className="gallery-header">
            {onBack && (
              <button className="back-button" onClick={onBack} aria-label="뒤로가기">
                <img src="/images/back-button.svg" alt="뒤로가기" width="48" height="48" />
              </button>
            )}
            <div className="gallery-header-content">
              <div className="gallery-header-title-wrapper">
                <span className="gallery-main-title">Echoes of Impression</span>
                <span className="gallery-main-title-ko">: 인상의 잔향</span>
              </div>
              <p className="gallery-location">노들갤러리 1관</p>
            </div>
          </div>

          {/* 작품 썸네일 그리드 */}
          <div className="gallery-artwork-grid-wrapper">
            <div className="gallery-artwork-grid">
              {artworks.map((artwork, index) => {
                const isSelected = selectedSlug === artwork.slug
                const isDimmed = selectedSlug && !isSelected

                return (
                  <div
                    key={artwork.slug}
                    className={`gallery-artwork-icon ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelect(artwork)}
                    data-index={index + 1}
                    style={{
                      backgroundColor: artwork.ctaColor || '#111111',
                      opacity: isDimmed ? 0.35 : 1
                    }}
                  >
                    <span
                      className="gallery-icon-number"
                      style={{
                        color: isSelected ? '#FCFCFC' : (isDimmed ? '#E5E5E5' : '#FCFCFC')
                      }}
                    >
                      {index + 1}
                    </span>
                  </div>
                )
              })}
              {!selectedSlug && (
                <img 
                  className="gallery-selected-marker" 
                  src="/Mark.svg" 
                  alt="선택 마크" 
                  width="24" 
                  height="24" 
                />
              )}
            </div>
          </div>

          {/* 하단 작품 리스트 */}
          <div className="gallery-artwork-list">
            {artworks.map((artwork, index) => (
              <button
                key={artwork.slug}
                className={`gallery-artwork-item ${selectedSlug === artwork.slug ? 'selected' : ''}`}
                onClick={() => handleSelect(artwork)}
              >
                <div 
                  className="gallery-item-number"
                  style={{
                    backgroundColor: selectedSlug === artwork.slug 
                      ? (artwork.ctaColor || '#FCFCFC') 
                      : '#FCFCFC',
                    borderColor: selectedSlug === artwork.slug 
                      ? (artwork.ctaColor || '#BBBBBB') 
                      : (selectedSlug ? '#999999' : '#BBBBBB'),
                    color: selectedSlug === artwork.slug 
                      ? '#FCFCFC' 
                      : '#111111'
                  }}
                >{index + 1}</div>
                <div className="gallery-item-text">
                  <span 
                    className="gallery-item-title"
                    style={{
                      color: (selectedSlug && selectedSlug !== artwork.slug) ? '#999999' : '#111111'
                    }}
                  >{artwork.title}</span>
                  <span 
                    className="gallery-item-dot"
                    style={{
                      backgroundColor: (selectedSlug && selectedSlug !== artwork.slug) ? '#999999' : '#111111'
                    }}
                  ></span>
                  <span 
                    className="gallery-item-artist"
                    style={{
                      color: (selectedSlug && selectedSlug !== artwork.slug) ? '#999999' : '#111111'
                    }}
                  >{artwork.artist}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ArtworkGallery

