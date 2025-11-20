import { useState, useRef, useEffect } from 'react'
import './AudioRecorder.css'

function AudioRecorder({ 
  isConnected, 
  onAudioData, 
  onRecordingComplete,
  onRecordingStart,
  isListening,
  setIsListening 
}) {
  const [isRecording, setIsRecording] = useState(false)
  const [error, setError] = useState('')
  const mediaRecorderRef = useRef(null)
  const audioContextRef = useRef(null)
  const streamRef = useRef(null)
  const processorRef = useRef(null)
  const recordingRef = useRef(false)

  // 마이크 권한 요청 및 녹음 시작
  const startRecording = async () => {
    try {
      setError('')
      
      if (typeof onRecordingStart === 'function') {
        onRecordingStart()
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 24000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })

      streamRef.current = stream

      // AudioContext 설정
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 24000
      })

      const source = audioContextRef.current.createMediaStreamSource(stream)
      const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1)

      processorRef.current = processor

      processor.onaudioprocess = (e) => {
        if (!recordingRef.current) return

        const inputData = e.inputBuffer.getChannelData(0)
        
        // Float32 -> PCM16 변환
        const pcm16 = new Int16Array(inputData.length)
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]))
          pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff
        }

        // Base64 인코딩
        const base64 = btoa(
          String.fromCharCode(...new Uint8Array(pcm16.buffer))
        )

        onAudioData(base64)
      }

      source.connect(processor)
      processor.connect(audioContextRef.current.destination)

      recordingRef.current = true
      setIsRecording(true)
      setIsListening(true)

    } catch (err) {
      console.error('Recording error:', err)
      recordingRef.current = false
      setError('마이크 접근 권한이 필요합니다.')
    }
  }

  // 녹음 중지
  const stopRecording = () => {
    recordingRef.current = false
    setIsRecording(false)
    setIsListening(false)

    if (processorRef.current) {
      processorRef.current.disconnect()
      processorRef.current = null
    }

    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }

    onRecordingComplete()
  }

  // 토글
  const toggleRecording = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  // 정리
  useEffect(() => {
    return () => {
      if (isRecording) {
        stopRecording()
      }
    }
  }, [])

  return (
    <div className="audio-recorder">
      {error && (
        <div className="recorder-error">
          ⚠️ {error}
        </div>
      )}

      <div className="recorder-controls">
        <button
          className={`mic-button ${isRecording ? 'recording' : ''}`}
          onClick={toggleRecording}
          disabled={!isConnected}
          aria-label={isRecording ? '녹음 중지' : '녹음 시작'}
        >
          {isRecording ? (
            <>
              <span className="mic-icon recording-pulse">🎙️</span>
              <span className="mic-label">녹음 중...</span>
            </>
          ) : (
            <>
              <span className="mic-icon">🎙️</span>
              <span className="mic-label">말하기</span>
            </>
          )}
        </button>

        {isRecording && (
          <div className="recording-indicator">
            <div className="wave-animation">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
      </div>

      <div className="recorder-hint">
        {!isConnected && '연결 대기 중...'}
        {isConnected && !isRecording && '버튼을 눌러 말하기'}
        {isRecording && '말을 마치면 버튼을 다시 누르세요'}
      </div>
    </div>
  )
}

export default AudioRecorder

