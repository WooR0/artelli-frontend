import { useState } from 'react'
import './ApiKeySetup.css'

function ApiKeySetup({ onSubmit }) {
  const [openaiKey, setOpenaiKey] = useState('')
  const [elevenlabsKey, setElevenlabsKey] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!openaiKey.trim() || !elevenlabsKey.trim()) {
      setError('모든 API 키를 입력해주세요.')
      return
    }

    if (!openaiKey.startsWith('sk-')) {
      setError('올바른 OpenAI API 키 형식이 아닙니다.')
      return
    }

    setError('')
    onSubmit({
      openaiKey: openaiKey.trim(),
      elevenlabsKey: elevenlabsKey.trim()
    })
  }

  return (
    <div className="setup-container">
      <div className="setup-card">
        <div className="setup-header">
          <h1>🎙️ 실시간 AI 음성 채팅</h1>
          <p>API 키를 입력하여 시작하세요</p>
        </div>

        <form onSubmit={handleSubmit} className="setup-form">
          <div className="form-group">
            <label htmlFor="openai-key">
              <span className="label-icon">🤖</span>
              OpenAI API Key
            </label>
            <input
              id="openai-key"
              type="password"
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              placeholder="sk-..."
              className="form-input"
              autoComplete="off"
            />
            <small className="form-hint">
              <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">
                OpenAI에서 API 키 발급받기
              </a>
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="elevenlabs-key">
              <span className="label-icon">🔊</span>
              ElevenLabs API Key
            </label>
            <input
              id="elevenlabs-key"
              type="password"
              value={elevenlabsKey}
              onChange={(e) => setElevenlabsKey(e.target.value)}
              placeholder="엔터..."
              className="form-input"
              autoComplete="off"
            />
            <small className="form-hint">
              <a href="https://elevenlabs.io/app/settings/api-keys" target="_blank" rel="noopener noreferrer">
                ElevenLabs에서 API 키 발급받기
              </a>
            </small>
          </div>

          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          <button type="submit" className="submit-button">
            시작하기
          </button>
        </form>

        <div className="setup-footer">
          <p>
            <strong>프로토타입 안내:</strong> API 키는 브라우저에 저장되지 않으며, 
            세션 동안만 사용됩니다.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ApiKeySetup

