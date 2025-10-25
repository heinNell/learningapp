import { useCallback, useEffect, useState } from 'react'

// Safety constants to prevent browser crashes
const SAFE_RATE_LIMITS = { min: 0.8, max: 1.2 }
const SAFE_PITCH_LIMITS = { min: 0.8, max: 1.3 }

export const useVoice = () => {
  const [isSupported, setIsSupported] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])

  useEffect(() => {
    setIsSupported('speechSynthesis' in window)
    
    // Enhanced voice loading with timeout protection
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices()
      // Prioritize local voices for stability
      const sortedVoices = availableVoices.sort((a, b) => {
        if (a.localService && !b.localService) return -1
        if (!a.localService && b.localService) return 1
        return 0
      })
      setVoices(sortedVoices)
    }

    loadVoices()
    
    // Handle async voice loading with timeout
    const voiceTimeout = setTimeout(loadVoices, 1000)
    
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = () => {
        clearTimeout(voiceTimeout)
        loadVoices()
      }
    }

    return () => {
      clearTimeout(voiceTimeout)
      speechSynthesis.onvoiceschanged = null
    }
  }, [])

  const speak = useCallback((text: string, options?: { 
    rate?: number; 
    pitch?: number; 
    volume?: number; 
    isExcited?: boolean;
    retryCount?: number;
  }) => {
    if (!isSupported || !text) return

    const retryCount = options?.retryCount || 0
    const maxRetries = 2

    // Cancel any ongoing speech
    speechSynthesis.cancel()
    
    // Increased delay for better stability
    setTimeout(() => {
      const expressiveText = makeTextExpressive(text, options?.isExcited || false)
      const utterance = new SpeechSynthesisUtterance(expressiveText)
    
      // **CRITICAL FIX**: Clamp values to safe ranges
      if (options?.isExcited) {
        utterance.rate = Math.min(Math.max(options?.rate || 0.85, SAFE_RATE_LIMITS.min), SAFE_RATE_LIMITS.max)
        utterance.pitch = Math.min(Math.max(options?.pitch || 1.15, SAFE_PITCH_LIMITS.min), SAFE_PITCH_LIMITS.max)
        utterance.volume = Math.min(options?.volume || 0.95, 1.0)
      } else {
        utterance.rate = Math.min(Math.max(options?.rate || 0.9, SAFE_RATE_LIMITS.min), SAFE_RATE_LIMITS.max)
        utterance.pitch = Math.min(Math.max(options?.pitch || 1.1, SAFE_PITCH_LIMITS.min), SAFE_PITCH_LIMITS.max)
        utterance.volume = Math.min(options?.volume || 0.85, 1.0)
      }

      // **ENHANCED VOICE SELECTION**: Prioritize local voices
      const preferredVoiceNames = [
        // Local voices first (most stable)
        'Microsoft Zira Desktop',
        'Microsoft David Desktop', 
        'Samantha',
        'Karen',
        'Victoria',
        'Fiona',
        // Cloud voices as fallback
        'Google UK English Female',
        'Google US English Female',
        'Anna',
        'Amelie'
      ]

      let selectedVoice: SpeechSynthesisVoice | null = null

      // First pass: Look for local voices only
      for (const name of preferredVoiceNames) {
        selectedVoice = voices.find(voice => 
          voice.name.includes(name) && voice.localService
        ) || null
        if (selectedVoice) break
      }

      // Second pass: Any preferred voice
      if (!selectedVoice) {
        for (const name of preferredVoiceNames) {
          selectedVoice = voices.find(voice => voice.name.includes(name)) || null
          if (selectedVoice) break
        }
      }

      // Fallback to any local English voice
      if (!selectedVoice) {
        selectedVoice = voices.find(voice => 
          voice.lang.startsWith('en') && voice.localService
        ) || null
      }

      // Final fallback to any English voice
      if (!selectedVoice) {
        selectedVoice = voices.find(voice => voice.lang.startsWith('en')) || null
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice
        console.log('Using voice:', selectedVoice.name, '(Local:', selectedVoice.localService, ')')
      }

      utterance.onstart = () => setIsSpeaking(true)
      
      utterance.onend = () => {
        setIsSpeaking(false)
      }
      
      // **ENHANCED ERROR HANDLING WITH RETRY**
      utterance.onerror = (event) => {
        console.log('Speech error details:', {
          error: event.error,
          voice: selectedVoice?.name,
          isLocal: selectedVoice?.localService,
          retryCount
        })

        setIsSpeaking(false)

        // Retry with safer settings on certain errors
        if ((event.error === 'interrupted' || event.error === 'synthesis-failed') && 
            retryCount < maxRetries) {
          
          console.log(`Retrying speech (attempt ${retryCount + 1}/${maxRetries})`)
          
          setTimeout(() => {
            speak(text, {
              ...options,
              rate: 0.9,  // Use safer values for retry
              pitch: 1.0,
              volume: 0.8,
              retryCount: retryCount + 1
            })
          }, 200 * (retryCount + 1)) // Increasing delay
        }
      }

      try {
        speechSynthesis.speak(utterance)
      } catch (error) {
        console.error('Failed to speak:', error)
        setIsSpeaking(false)
        
        // Try with basic settings as last resort
        if (retryCount === 0) {
          setTimeout(() => {
            const basicUtterance = new SpeechSynthesisUtterance(text)
            basicUtterance.rate = 1.0
            basicUtterance.pitch = 1.0
            basicUtterance.volume = 0.8
            speechSynthesis.speak(basicUtterance)
          }, 300)
        }
      }
    }, 150) // Increased delay for stability
  }, [isSupported, voices])

  const stop = useCallback(() => {
    speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [])

  const getAvailableVoices = useCallback(() => {
    return voices
      .filter(voice => voice.lang.startsWith('en'))
      .map(voice => ({
        name: voice.name,
        lang: voice.lang,
        isLocal: voice.localService
      }))
  }, [voices])

  return { speak, stop, isSpeaking, isSupported, getAvailableVoices }
}

// **IMPROVED EXPRESSIVE TEXT FUNCTION**
function makeTextExpressive(text: string, isExcited: boolean): string {
  let expressive = text

  if (isExcited) {
    // More conservative emphasis to prevent synthesis issues
    expressive = expressive.replace(/\b(wow|amazing|fantastic|excellent|great|perfect)\b/gi, 
      (match) => match.charAt(0).toUpperCase() + match.slice(1).toLowerCase())
    
    // Shorter pauses to prevent timing issues
    expressive = expressive.replace(/!/g, '! ') 
    expressive = expressive.replace(/\?/g, '? ')
    
    // Gentler emphasis
    expressive = expressive.replace(/\b(You're|That's)\b/g, '$1')
  }

  // Conservative pause handling
  expressive = expressive.replace(/\.\s+/g, '. ')
  expressive = expressive.replace(/,\s+/g, ', ')
  
  // Remove excessive punctuation that might cause issues
  expressive = expressive.replace(/\.{3,}/g, '...')
  expressive = expressive.replace(/!{2,}/g, '!')
  
  return expressive.trim()
}
