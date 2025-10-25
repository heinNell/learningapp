import { useCallback, useEffect, useState } from 'react'

export const useVoice = () => {
  const [isSupported, setIsSupported] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])

  useEffect(() => {
    setIsSupported('speechSynthesis' in window)
    
    // Load voices
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices()
      setVoices(availableVoices)
    }

    loadVoices()
    
    // Some browsers load voices asynchronously
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices
    }
  }, [])

  const speak = useCallback((text: string, options?: { rate?: number; pitch?: number; volume?: number }) => {
    if (!isSupported || !text) return

    // Cancel any ongoing speech
    speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    
    // More enthusiastic and fluent settings
    utterance.rate = options?.rate || 1.1  // Faster, more energetic (was 0.8)
    utterance.pitch = options?.pitch || 1.3  // Higher pitch, more cheerful (was 1.1)
    utterance.volume = options?.volume || 1

    // Find the best child-friendly voice (prioritized list)
    const preferredVoiceNames = [
      'Google UK English Female',
      'Google US English Female',
      'Samantha',
      'Karen',
      'Victoria',
      'Fiona',
      'Amelie',
      'Anna',
      'Google हिन्दी', // if you need multilingual
      'Microsoft Zira Desktop', // Windows
      'Microsoft David Desktop', // Windows
    ]

    let selectedVoice: SpeechSynthesisVoice | null = null

    // Try to find preferred voices first
    for (const name of preferredVoiceNames) {
      selectedVoice = voices.find(voice => voice.name.includes(name)) || null
      if (selectedVoice) break
    }

    // Fallback to any English female voice
    if (!selectedVoice) {
      selectedVoice = voices.find(voice => 
        voice.lang.startsWith('en') && 
        (voice.name.toLowerCase().includes('female') || 
         voice.name.toLowerCase().includes('woman'))
      ) || null
    }

    // Fallback to any English voice
    if (!selectedVoice) {
      selectedVoice = voices.find(voice => voice.lang.startsWith('en')) || null
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice
      console.log('Using voice:', selectedVoice.name) // For debugging
    }

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = (event) => {
      console.error('Speech error:', event)
      setIsSpeaking(false)
    }

    speechSynthesis.speak(utterance)
  }, [isSupported, voices])

  const stop = useCallback(() => {
    speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [])

  // Add a method to list available voices (useful for debugging)
  const getAvailableVoices = useCallback(() => {
    return voices.filter(voice => voice.lang.startsWith('en'))
  }, [voices])

  return { speak, stop, isSpeaking, isSupported, getAvailableVoices }
}