/**
 * Sound Effects Manager
 * Handles all celebration and feedback sound effects with proper timing and layering
 */

export type SoundEffectType = 
  | 'correct'           // Quick positive chime
  | 'incorrect'         // Gentle "try again" tone
  | 'badge'             // Achievement unlock sound
  | 'level-up'          // Level up fanfare
  | 'star'              // Star collection sound
  | 'confetti'          // Celebration whoosh
  | 'applause'          // Clapping sound
  | 'cheer'             // Crowd cheer
  | 'fanfare'           // Victory trumpet
  | 'magic-sparkle'     // Magical twinkle
  | 'success'           // General success sound

export interface SoundEffect {
  type: SoundEffectType
  path: string
  volume: number
  delay: number  // Milliseconds to delay before playing
}

class SoundEffectManager {
  private audioCache: Map<string, HTMLAudioElement> = new Map()
  private enabled: boolean = true

  constructor() {
    this.preloadSounds()
  }

  /**
   * Preload commonly used sounds for instant playback
   */
  private preloadSounds() {
    const commonSounds = [
      '/audio/celebrations/correct-answer.mp3',
      '/audio/celebrations/amazing.mp3',
      '/audio/celebrations/fantastic.mp3',
      '/audio/celebrations/applause.mp3'
    ]

    commonSounds.forEach(path => {
      const audio = new Audio(path)
      audio.preload = 'auto'
      audio.onerror = () => {
        // Silently handle missing files - won't break app
        console.info(`Sound file not found: ${path} (optional enhancement)`)
      }
      this.audioCache.set(path, audio)
    })
  }

  /**
   * Enable or disable sound effects globally
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled
    if (!enabled) {
      this.stopAll()
    }
  }

  /**
   * Play a single sound effect
   */
  play(type: SoundEffectType, volume: number = 0.7): Promise<void> {
    if (!this.enabled) return Promise.resolve()

    const soundPaths: Record<SoundEffectType, string> = {
      'correct': '/audio/celebrations/correct-answer.mp3',
      'incorrect': '/audio/feedback/incorrect.mp3',
      'badge': '/audio/celebrations/badge-earned.mp3',
      'level-up': '/audio/celebrations/level-up.mp3',
      'star': '/audio/celebrations/magic-sparkle.mp3',
      'confetti': '/audio/celebrations/confetti.mp3',
      'applause': '/audio/celebrations/applause.mp3',
      'cheer': '/audio/celebrations/cheer-crowd.mp3',
      'fanfare': '/audio/celebrations/trumpet-fanfare.mp3',
      'magic-sparkle': '/audio/celebrations/magic-sparkle.mp3',
      'success': '/audio/celebrations/success.mp3'
    }

    const path = soundPaths[type]
    let audio = this.audioCache.get(path)

    if (!audio) {
      audio = new Audio(path)
      audio.onerror = () => {
        console.info(`Sound file not yet uploaded: ${path}`)
      }
      this.audioCache.set(path, audio)
    }

    audio.volume = volume
    
    return audio.play().catch(error => {
      // Handle autoplay restrictions gracefully
      if (error.name !== 'NotAllowedError') {
        console.info('Sound playback info:', error.message)
      }
    })
  }

  /**
   * Play a sequence of sound effects with timing
   */
  async playSequence(effects: SoundEffect[]): Promise<void> {
    if (!this.enabled) return

    for (const effect of effects) {
      await new Promise(resolve => setTimeout(resolve, effect.delay))
      await this.play(effect.type, effect.volume)
    }
  }

  /**
   * Play layered celebration (multiple sounds with timing)
   */
  playCorrectAnswerCelebration(): void {
    if (!this.enabled) return

    const celebration: SoundEffect[] = [
      { type: 'correct', path: '', volume: 0.6, delay: 0 },        // Immediate ding
      { type: 'magic-sparkle', path: '', volume: 0.5, delay: 200 }, // Quick sparkle
      { type: 'cheer', path: '', volume: 0.4, delay: 500 }          // Delayed cheer
    ]

    this.playSequence(celebration)
  }

  /**
   * Play badge achievement celebration
   */
  playBadgeCelebration(): void {
    if (!this.enabled) return

    const celebration: SoundEffect[] = [
      { type: 'badge', path: '', volume: 0.7, delay: 0 },
      { type: 'applause', path: '', volume: 0.5, delay: 300 },
      { type: 'fanfare', path: '', volume: 0.6, delay: 800 }
    ]

    this.playSequence(celebration)
  }

  /**
   * Play level up celebration
   */
  playLevelUpCelebration(): void {
    if (!this.enabled) return

    const celebration: SoundEffect[] = [
      { type: 'level-up', path: '', volume: 0.8, delay: 0 },
      { type: 'fanfare', path: '', volume: 0.6, delay: 400 },
      { type: 'applause', path: '', volume: 0.5, delay: 1000 }
    ]

    this.playSequence(celebration)
  }

  /**
   * Stop all playing sounds
   */
  stopAll(): void {
    this.audioCache.forEach(audio => {
      audio.pause()
      audio.currentTime = 0
    })
  }

  /**
   * Clear the audio cache (useful for memory management)
   */
  clearCache(): void {
    this.stopAll()
    this.audioCache.clear()
  }
}

// Export singleton instance
export const soundEffectManager = new SoundEffectManager()
