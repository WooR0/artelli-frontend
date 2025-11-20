import { useState, useEffect } from 'react'
import './IntroSequence.css'

function IntroSequence({ onComplete, onBack, onOverview, initialAnimated, onAnimationStart }) {
  const [isAnimating, setIsAnimating] = useState(initialAnimated || false)

  useEffect(() => {
    if (initialAnimated) {
      setIsAnimating(true)
    }
  }, [initialAnimated])

  const handleEnter = () => {
    setIsAnimating(true)
    if (onAnimationStart) {
      onAnimationStart()
    }
  }

  const handleMenuClick = () => {
    onComplete()
  }

  const handleOverviewClick = () => {
    if (onOverview) {
      onOverview()
    }
  }

  return (
    <div className="intro-viewport">
      <div className="intro-shell">
        <div className={`intro-container ${isAnimating ? 'animating' : ''}`}>
          {/* 배경 이미지 */}
          <div className="intro-bg-wrapper">
            <div className="intro-bg-image"></div>
            <div className="intro-overlay"></div>
            {onBack && (
              <button className="back-button" onClick={onBack} aria-label="뒤로가기">
                <img src="/images/back-button.svg" alt="뒤로가기" width="48" height="48" />
              </button>
            )}
          </div>

          {/* 타이틀 */}
          <div className="intro-title">
            <h1 className="intro-main-title">
              Echoes<br/>of Impression
            </h1>
            <p className="intro-subtitle">— 인상의 잔향</p>
          </div>

          {/* 입장 정보 (애니메이션 시작 전에만 표시) */}
          {!isAnimating && (
            <>
              <div className="intro-info">
                <p className="intro-location">노들 갤러리 1관</p>
                <p className="intro-date">12/13 - 12/20</p>
              </div>
              <button className="intro-enter-button" onClick={handleEnter}>
                <div className="enter-icon">
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                    <circle cx="20" cy="20" r="19" stroke="#DDDDDD" strokeWidth="1"/>
                    <circle cx="20" cy="20" r="16" stroke="#FCFCFC" strokeWidth="3"/>
                  </svg>
                </div>
                <span className="enter-text">입장하기</span>
              </button>
            </>
          )}

          {/* 헤더 (항상 렌더링, CSS로 애니메이션 제어) */}
          <div className="intro-header">
            <div className="intro-header-title">
              <span className="header-title-en">Echoes of Impression</span>
              <span className="header-title-ko">: 인상의 잔향</span>
            </div>
            <div className="intro-header-location">노들갤러리 1관</div>
          </div>
          
          {/* 메뉴 버튼 */}
          <div className="intro-menu">
            <button className="intro-menu-button" onClick={handleOverviewClick}>전시 개요</button>
            <div className="intro-menu-divider"></div>
            <button className="intro-menu-button" onClick={handleMenuClick}>작품 설명 보러가기</button>
            <div className="intro-menu-divider"></div>
            <button className="intro-menu-button">작품들의 작별인사</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default IntroSequence
