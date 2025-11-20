import { useState, useEffect, useRef } from 'react'
import './App.css'
import IntroSequence from './components/IntroSequence'
import ArtworkGallery from './components/ArtworkGallery'
import ArtworkChat from './components/ArtworkChat'
import ArtworkChatView from './components/ArtworkChatView'
import ExhibitionOverview from './components/ExhibitionOverview'
import { getRandomGreeting } from './data/artworks'

function App() {
  // 앱 상태: 'intro' | 'overview' | 'gallery' | 'detail' | 'chat'
  const [appState, setAppState] = useState('intro')
  const [previousState, setPreviousState] = useState(null) // 이전 화면 기억
  const [introAnimated, setIntroAnimated] = useState(false) // intro 애니메이션 상태 기억
  const [selectedArtwork, setSelectedArtwork] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState([])
  const [isListening, setIsListening] = useState(false)
  const artworkMessagesRef = useRef({}) // 작품별 대화 내역 저장
  const wsRef = useRef(null)
  const audioContextRef = useRef(null)
  const audioQueueRef = useRef([])
  const isPlayingRef = useRef(false)
  const mp3ChunksRef = useRef([]) // ElevenLabs MP3 청크 저장
  const hasAudioDataRef = useRef(false)
  const activeOutputTextRef = useRef(false)
  const fallbackTextRef = useRef(false)

  // WebSocket 연결
  const connectWebSocket = async (artwork, skipGreeting = false) => {
    try {
      // 기존 연결이 있으면 닫기
      if (wsRef.current) {
        wsRef.current.close()
      }

      const wsUrl = `ws://localhost:3001/voice`
      const ws = new WebSocket(wsUrl)
      
      ws.onopen = () => {
        console.log('WebSocket connected')
        // API 키는 백엔드 .env에서 가져오므로 작품 정보만 전송
        ws.send(JSON.stringify({
          type: 'setup',
          artworkId: artwork.slug,
          voiceId: artwork.elevenlabsVoice,
          voice: artwork.voice,
          systemPrompt: artwork.systemPrompt
        }))
      }

      ws.onmessage = async (event) => {
        const data = JSON.parse(event.data)
        
        if (data.type === 'setup_complete') {
          setIsConnected(true)
          // 인사말은 대화 내역이 없을 때만 추가
          if (!skipGreeting) {
            const greeting = getRandomGreeting(artwork.greeting) || `안녕하세요, ${artwork.title}입니다. 편하게 이야기 나눠요.`
            addMessage('assistant', greeting, { responseId: 'intro', final: true })
          }
        }
        
        if (data.type === 'openai_event') {
          handleOpenAIEvent(data.event)
        }
        
        if (data.type === 'audio_response') {
          console.log('Received audio chunk', data.format || 'pcm16')
          if (data.format === 'mp3') {
            // MP3 청크를 배열에 추가
            mp3ChunksRef.current.push(data.audio)
          } else {
            await playAudioChunk(data.audio) // PCM16 (기존 방식)
          }
        }
        
        if (data.type === 'audio_response_done') {
          console.log('Audio streaming completed')
          // 모든 MP3 청크를 모아서 재생
          if (mp3ChunksRef.current.length > 0) {
            await playMP3Audio(mp3ChunksRef.current)
            mp3ChunksRef.current = [] // 청크 배열 초기화
          }
        }

        if (data.type === 'error') {
          console.error('WebSocket error:', data.error)
          addMessage('system', `에러: ${data.error}`)
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        addMessage('system', '연결 오류가 발생했습니다.')
      }

      ws.onclose = () => {
        console.log('WebSocket disconnected')
        setIsConnected(false)
        addMessage('system', '연결이 종료되었습니다.')
      }

      wsRef.current = ws
      hasAudioDataRef.current = false
    } catch (error) {
      console.error('Failed to connect:', error)
      addMessage('system', '연결에 실패했습니다.')
    }
  }

  // OpenAI 이벤트 처리
  const handleOpenAIEvent = (event) => {
    console.log('OpenAI event:', event.type, event)
    
    switch(event.type) {
      case 'conversation.item.input_audio_transcription.completed':
        addMessage('user', event.transcript)
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'transcript',
            text: event.transcript
          }))
        }
        break
      
      case 'response.text.delta':
        if (!activeOutputTextRef.current) {
          const responseId = getResponseId(event) || `fallback-${event.id || Date.now()}`
          console.log('Text delta (fallback):', event.delta)
          fallbackTextRef.current = true
          streamAssistantMessage(event.delta, responseId)
        }
        break
      
      case 'response.text.done':
        if (!activeOutputTextRef.current && fallbackTextRef.current) {
          const responseId = getResponseId(event) || `fallback-${event.id || Date.now()}`
          console.log('Text done (fallback):', event.text)
          finalizeAssistantMessage(event.text, responseId)
          fallbackTextRef.current = false
        }
        break

      case 'response.output_text.delta':
        {
          const responseId = getResponseId(event) || `output-${event.id || Date.now()}`
          console.log('Output text delta:', event.delta)
          activeOutputTextRef.current = true
          fallbackTextRef.current = false
          streamAssistantMessage(event.delta, responseId)
        }
        break

      case 'response.output_text.done':
        {
          const responseId = getResponseId(event) || `output-${event.id || Date.now()}`
          const finalText = event.text || event.output_text
          console.log('Output text done:', finalText)
          finalizeAssistantMessage(finalText, responseId)
          activeOutputTextRef.current = false
          fallbackTextRef.current = false
        }
        break
      
      case 'response.audio.delta':
        // 오디오 델타 (텍스트와 음성 모두 포함된 응답)
        console.log('Audio delta received (will be handled by backend)')
        break
      
      case 'response.done':
        console.log('Response complete')
        activeOutputTextRef.current = false
        fallbackTextRef.current = false
        break
      
      case 'error':
        console.error('OpenAI error:', event.error)
        addMessage('system', `AI 에러: ${event.error.message}`)
        break
      
      default:
        // 디버깅을 위해 알 수 없는 이벤트도 로그
        console.log('Unhandled event type:', event.type)
    }
  }

  // MP3 오디오 재생 (ElevenLabs) - 모든 청크를 모아서 재생
  const playMP3Audio = async (chunks) => {
    try {
      // 모든 청크를 하나로 합치기
      const allBytes = []
      for (const chunk of chunks) {
        const binaryString = atob(chunk)
        const bytes = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i)
        }
        allBytes.push(...bytes)
      }

      // MP3를 Blob으로 변환
      const blob = new Blob([new Uint8Array(allBytes)], { type: 'audio/mpeg' })
      const url = URL.createObjectURL(blob)
      
      // Audio 객체로 재생
      const audio = new Audio(url)
      
      audio.onended = () => {
        URL.revokeObjectURL(url)
        console.log('MP3 playback completed')
      }
      
      audio.onerror = (error) => {
        console.error('Audio playback error:', error)
        URL.revokeObjectURL(url)
      }
      
      await audio.play()
    } catch (error) {
      console.error('MP3 playback error:', error)
    }
  }

  // MP3 오디오 재생 (ElevenLabs) - 단일 청크 (사용 안 함, 참고용)
  const playMP3Chunk = async (base64Audio) => {
    try {
      // Base64 디코딩
      const binaryString = atob(base64Audio)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }

      // MP3를 Blob으로 변환
      const blob = new Blob([bytes], { type: 'audio/mpeg' })
      const url = URL.createObjectURL(blob)
      
      // Audio 객체로 재생
      const audio = new Audio(url)
      
      audio.onended = () => {
        URL.revokeObjectURL(url)
      }
      
      audio.onerror = (error) => {
        console.error('Audio playback error:', error)
        URL.revokeObjectURL(url)
      }
      
      await audio.play()
    } catch (error) {
      console.error('MP3 playback error:', error)
    }
  }

  // PCM16 오디오 재생 (OpenAI Realtime API - 더 이상 사용 안 함)
  const playAudioChunk = async (base64Audio) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 24000
      })
    }

    const audioContext = audioContextRef.current
    
    // Base64 디코딩
    const binaryString = atob(base64Audio)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }

    // PCM16 -> Float32 변환
    const pcm16 = new Int16Array(bytes.buffer)
    const float32 = new Float32Array(pcm16.length)
    for (let i = 0; i < pcm16.length; i++) {
      float32[i] = pcm16[i] / 32768.0
    }

    // AudioBuffer 생성
    const audioBuffer = audioContext.createBuffer(1, float32.length, 24000)
    audioBuffer.getChannelData(0).set(float32)

    // 재생 큐에 추가
    audioQueueRef.current.push(audioBuffer)
    
    if (!isPlayingRef.current) {
      playNextAudio()
    }
  }

  // 다음 오디오 재생
  const playNextAudio = () => {
    if (audioQueueRef.current.length === 0) {
      isPlayingRef.current = false
      return
    }

    isPlayingRef.current = true
    const audioBuffer = audioQueueRef.current.shift()
    const source = audioContextRef.current.createBufferSource()
    source.buffer = audioBuffer
    source.connect(audioContextRef.current.destination)
    
    source.onended = () => {
      playNextAudio()
    }
    
    source.start()
  }

  const getResponseId = (event) => event?.response?.id || event?.response_id || event?.id || event?.item?.id || null

  // 메시지 추가
  const addMessage = (role, content, options = {}) => {
    setMessages(prev => [
      ...prev,
      { role, content, timestamp: Date.now(), ...options }
    ])
  }

  const streamAssistantMessage = (delta, responseId) => {
    if (!delta) return
    const id = responseId || `res-${Date.now()}`
    setMessages(prev => {
      const newMessages = [...prev]
      const existingIndex = newMessages.findIndex(
        (msg) => msg.role === 'assistant' && msg.responseId === id && !msg.final
      )

      if (existingIndex !== -1) {
        newMessages[existingIndex] = {
          ...newMessages[existingIndex],
          content: (newMessages[existingIndex].content || '') + delta
        }
      } else {
        newMessages.push({
          role: 'assistant',
          content: delta,
          timestamp: Date.now(),
          final: false,
          responseId: id
        })
      }

      return newMessages
    })
  }

  const finalizeAssistantMessage = (text, responseId) => {
    if (text == null) return
    const id = responseId || `res-${Date.now()}`
    setMessages(prev => {
      const newMessages = [...prev]
      const existingIndex = newMessages.findIndex(
        (msg) => msg.role === 'assistant' && msg.responseId === id
      )

      if (existingIndex !== -1) {
        newMessages[existingIndex] = {
          ...newMessages[existingIndex],
          content: text,
          final: true
        }
      } else {
        newMessages.push({
          role: 'assistant',
          content: text,
          timestamp: Date.now(),
          final: true,
          responseId: id
        })
      }

      return newMessages
    })
  }

  // API 키 설정 완료 (더 이상 필요 없음)
  // const handleApiKeysSubmit = (keys) => {
  //   setApiKeys(keys)
  //   setAppState('gallery')
  // }

  // 작품 선택 (작품 상세 화면으로)
  const handleSelectArtwork = async (artwork) => {
    // 현재 작품의 대화 내역 저장
    if (selectedArtwork) {
      artworkMessagesRef.current[selectedArtwork.slug] = messages
    }
    
    // 새 작품의 대화 내역 복원 (없으면 빈 배열)
    const savedMessages = artworkMessagesRef.current[artwork.slug] || []
    setMessages(savedMessages)
    setSelectedArtwork(artwork)
    setAppState('detail')
  }

  // 작품 상세에서 채팅 시작
  const handleStartChat = async () => {
    if (selectedArtwork) {
      // 대화 내역이 있는지 확인
      const savedMessages = artworkMessagesRef.current[selectedArtwork.slug]
      const hasMessages = savedMessages && savedMessages.length > 0
      
      // WebSocket 연결 (대화 내역이 있으면 인사말 생략)
      await connectWebSocket(selectedArtwork, hasMessages)
      setAppState('chat')
    }
  }

  // 갤러리로 돌아가기
  const handleBackToGallery = () => {
    // 현재 작품의 대화 내역 저장
    if (selectedArtwork) {
      artworkMessagesRef.current[selectedArtwork.slug] = messages
    }
    
    if (wsRef.current) {
      wsRef.current.close()
    }
    setSelectedArtwork(null)
    setIsConnected(false)
    setAppState('gallery')
  }

  // 오디오 데이터 전송
  const handleAudioData = (audioData) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      hasAudioDataRef.current = true
      wsRef.current.send(JSON.stringify({
        type: 'audio',
        audio: audioData
      }))
    }
  }

  // 녹음 완료
  const handleRecordingComplete = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return
    }

    if (hasAudioDataRef.current) {
      wsRef.current.send(JSON.stringify({
        type: 'commit'
      }))
      hasAudioDataRef.current = false
    } else {
      console.log('No audio captured; skipping commit')
    }
  }

  // 텍스트 메시지 전송
  const handleTextMessage = (text) => {
    // 자동 정보 제공 메시지 처리
    if (text.startsWith('[AUTO_INFO]')) {
      const content = text.replace('[AUTO_INFO]', '')
      addMessage('assistant', content, { responseId: 'auto-info', final: true })
      return
    }

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log('Sending text message:', text)
      // 사용자 메시지 추가
      addMessage('user', text)
      
      // 백엔드로 텍스트 메시지 전송
      wsRef.current.send(JSON.stringify({
        type: 'text',
        text: text
      }))
    } else {
      console.error('WebSocket not connected')
    }
  }

  // 정리
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  // 인트로 시퀀스
  if (appState === 'intro') {
    return <IntroSequence 
      initialAnimated={introAnimated}
      onAnimationStart={() => setIntroAnimated(true)}
      onComplete={() => setAppState('gallery')} 
      onOverview={() => {
        setPreviousState('intro')
        setAppState('overview')
      }}
    />
  }

  // 전시 개요
  if (appState === 'overview') {
    return <ExhibitionOverview onBack={() => {
      // 이전 화면으로 돌아가기 (기본값은 gallery)
      setAppState(previousState || 'gallery')
      setPreviousState(null)
    }} />
  }

  // 작품 선택 단계
  if (appState === 'gallery') {
    return <ArtworkGallery onSelectArtwork={handleSelectArtwork} onBack={() => setAppState('intro')} />
  }

  // 작품 상세 화면
  if (appState === 'detail' && selectedArtwork) {
    return (
      <ArtworkChat
        artwork={selectedArtwork}
        onBack={handleBackToGallery}
        onStartChat={handleStartChat}
      />
    )
  }

  // 채팅 화면
  if (appState === 'chat' && selectedArtwork) {
    return (
      <ArtworkChatView
        artwork={selectedArtwork}
        onBack={handleBackToGallery}
        isConnected={isConnected}
        messages={messages}
        onAudioData={handleAudioData}
        onRecordingComplete={handleRecordingComplete}
        onRecordingStart={() => {
          hasAudioDataRef.current = false
        }}
        onTextMessage={handleTextMessage}
        isListening={isListening}
        setIsListening={setIsListening}
      />
    )
  }

  return null
}

export default App

