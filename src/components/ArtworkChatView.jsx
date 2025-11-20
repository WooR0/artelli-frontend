import { useState, useMemo } from 'react'
import './ArtworkChatView.css'
import { getArtworkDetail } from '../data/artworkDetails'

function ArtworkChatView({ 
  artwork, 
  onBack,
  isConnected,
  messages,
  onAudioData,
  onRecordingComplete,
  onRecordingStart,
  onTextMessage,
  isListening,
  setIsListening
}) {
  const [textInput, setTextInput] = useState('')

  const artworkDetail = getArtworkDetail(artwork.slug)
  const displayTitle = artworkDetail?.title || artwork.title
  const displayArtist = artworkDetail?.artist || artwork.artist
  const displayYear = artworkDetail?.year || artwork.year
  const displayMedium = artworkDetail?.medium || '캔버스에 유채, 000 x 000'
  const ctaColor = artworkDetail?.ctaColor || '#89AB9C'
  const sections = artworkDetail?.sections || []

  // 이미 제공된 섹션 제목들을 추적
  const providedSections = useMemo(() => {
    const provided = new Set()
    messages
      .filter(msg => msg.role === 'assistant')
      .forEach(msg => {
        // 메시지에서 섹션 제목 추출 (예: "제작 배경\n\n내용..." 형식)
        const lines = msg.content.split('\n')
        const firstLine = lines[0].trim()
        // sections에 있는 제목인지 확인
        if (sections.some(section => section.title === firstLine)) {
          provided.add(firstLine)
        }
      })
    return provided
  }, [messages, sections])

  // 아직 제공하지 않은 섹션 찾기
  const getNextSection = () => {
    return sections.find(section => !providedSections.has(section.title))
  }

  const handleTextSubmit = (e) => {
    e.preventDefault()
    if (textInput.trim() && isConnected) {
      onTextMessage(textInput.trim())
      setTextInput('')
    }
  }

  const handlePlayButton = () => {
    if (!isConnected) return
    
    const nextSection = getNextSection()
    if (nextSection) {
      // 섹션 제목과 내용을 함께 메시지로 전송
      const sectionMessage = `${nextSection.title}\n\n${nextSection.content}`
      onTextMessage(`[AUTO_INFO]${sectionMessage}`)
    }
    // 모든 섹션을 제공했으면 아무것도 하지 않음 (버튼은 비활성화되지 않지만 메시지가 생성되지 않음)
  }

  const handleRightButtonClick = () => {
    if (textInput.trim()) {
      // 입력이 있으면 전송
      handleTextSubmit({ preventDefault: () => {} })
    } else {
      // 입력이 없으면 플레이 버튼 기능
      handlePlayButton()
    }
  }

  const hasInput = textInput.trim().length > 0

  return (
    <div className="chat-viewport">
      <div className="chat-shell">
        <div className="chat-container">
          {/* 상단 이미지 헤더 */}
          <div className="chat-header-image">
            <img src={artwork.imageUrl} alt={artwork.title} />
            <div className="chat-header-overlay"></div>
            <div className="chat-header-info">
              <h1 className="chat-header-title">{displayTitle}</h1>
              <div className="chat-header-meta">
                <span className="chat-header-artist">{displayArtist}</span>
                <span className="chat-header-dot">•</span>
                <span className="chat-header-year">{displayYear}</span>
              </div>
            </div>
          </div>

          {/* 뒤로가기 버튼 - 독립적으로 위치 */}
          {onBack && (
            <button className="back-button" onClick={onBack} aria-label="뒤로가기">
              <img src="/images/back-button.svg" alt="뒤로가기" width="48" height="48" />
            </button>
          )}

          {/* 채팅 메시지 영역 */}
          <div className="chat-messages-area">
            <div className="chat-messages-scroll">
              {[...messages].reverse().map((msg, index) => {
                if (msg.role === 'system') return null
                
                return (
                  <div 
                    key={messages.length - 1 - index} 
                    className={`chat-message ${msg.role === 'user' ? 'chat-message-user' : 'chat-message-assistant'}`}
                  >
                    <div 
                      className="chat-bubble"
                      style={msg.role === 'assistant' ? { background: ctaColor } : {}}
                    >
                      {msg.content}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 하단 입력 영역 */}
          <div className="chat-input-bar">
            <div className="chat-input-gradient"></div>
            <form onSubmit={handleTextSubmit} className="chat-input-form">
              <button
                type="button"
                className="chat-mic-button"
                disabled={!isConnected}
                aria-label="음성 입력"
              >
                🎙️
              </button>
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder=""
                className="chat-input-field"
                disabled={!isConnected}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && hasInput) {
                    handleTextSubmit(e)
                  }
                }}
              />
              <button
                type="button"
                className={`chat-right-button ${hasInput ? 'send-button' : 'play-button'}`}
                disabled={!isConnected}
                onClick={handleRightButtonClick}
                aria-label={hasInput ? '전송' : '자동 정보 제공'}
              >
                {hasInput ? (
                  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
                    <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" fill="currentColor"/>
                  </svg>
                ) : (
                  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none">
                    <path d="M8 5v14l11-7z" fill="currentColor"/>
                  </svg>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ArtworkChatView

