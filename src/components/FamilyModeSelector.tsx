
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FamilyMember, FamilySession, familyRoles, familyActivities } from '../data/familyModeData'
import { useVoice } from '../hooks/useVoice'

interface FamilyModeSelectorProps {
  onStartFamilySession: (session: FamilySession) => void
  soundEnabled: boolean
  highContrast: boolean
}

export const FamilyModeSelector: React.FC<FamilyModeSelectorProps> = ({
  onStartFamilySession,
  soundEnabled,
  highContrast
}) => {
  const { speak } = useVoice()
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null)
  const [sessionType, setSessionType] = useState<'collaborative' | 'turn-based' | 'team-challenge' | 'story-time'>('collaborative')
  const [showMemberSetup, setShowMemberSetup] = useState(false)
  const [newMember, setNewMember] = useState<Partial<FamilyMember>>({})

  useEffect(() => {
    // Load family members from localStorage
    const savedMembers = localStorage.getItem('family_members')
    if (savedMembers) {
      setFamilyMembers(JSON.parse(savedMembers))
    }
  }, [])

  useEffect(() => {
    // Save family members to localStorage
    localStorage.setItem('family_members', JSON.stringify(familyMembers))
  }, [familyMembers])

  const addFamilyMember = () => {
    if (newMember.name && newMember.role) {
      const member: FamilyMember = {
        id: `member_${Date.now()}`,
        name: newMember.name,
        role: newMember.role as FamilyMember['role'],
        avatar: familyRoles[newMember.role as keyof typeof familyRoles]?.avatar || '👤',
        age: newMember.age,
        preferences: {
          difficulty: 'medium',
          categories: ['animals', 'fruits', 'shapes'],
          participationStyle: 'active'
        },
        stats: {
          sessionsPlayed: 0,
          questionsAnswered: 0,
          helpGiven: 0,
          encouragementGiven: 0
        }
      }
      
      setFamilyMembers([...familyMembers, member])
      setNewMember({})
      setShowMemberSetup(false)

      if (soundEnabled) {
        speak(`Welcome to the family, ${member.name}! Let's learn together!`)
      }
    }
  }

  const removeFamilyMember = (memberId: string) => {
    setFamilyMembers(familyMembers.filter(m => m.id !== memberId))
  }

  const startFamilySession = () => {
    if (familyMembers.length < 2) {
      if (soundEnabled) {
        speak('We need at least 2 family members to start a family session!')
      }
      return
    }

    const session: FamilySession = {
      id: `session_${Date.now()}`,
      type: sessionType,
      participants: familyMembers,
      leader: familyMembers.find(m => m.role === 'parent')?.id || familyMembers[0].id,
      category: 'mixed',
      difficulty: 'adaptive',
      duration: 20,
      specialRules: {
        helpAllowed: true,
        discussionTime: 10,
        drawingMode: selectedActivity === 'collaborative_drawing',
        voiceAnswers: sessionType === 'story-time'
      }
    }

    onStartFamilySession(session)

    if (soundEnabled) {
      speak('Let\'s start our family learning adventure! Everyone ready?')
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className={`text-5xl font-bold mb-4 ${
          highContrast ? 'text-yellow-400' : 'text-white'
        }`}>
          👨‍👩‍👧‍👦 Family Learning Time 👨‍👩‍👧‍👦
        </h2>
        <p className={`text-xl ${
          highContrast ? 'text-white' : 'text-white/90'
        }`}>
          Learn together, grow together, celebrate together!
        </p>
      </motion.div>

      {/* Family Members Section */}
      <motion.div
        className={`mb-8 p-6 rounded-3xl ${
          highContrast 
            ? 'bg-black border-4 border-yellow-400' 
            : 'bg-white/10 backdrop-blur-lg border-2 border-white/20'
        }`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className={`text-2xl font-bold ${
            highContrast ? 'text-yellow-400' : 'text-white'
          }`}>
            Family Members ({familyMembers.length})
          </h3>
          <button
            onClick={() => setShowMemberSetup(true)}
            className={`px-6 py-3 rounded-2xl font-bold transition-all ${
              highContrast 
                ? 'bg-yellow-400 text-black hover:bg-yellow-300' 
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            + Add Family Member
          </button>
        </div>

        {/* Family Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {familyMembers.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-2xl relative ${
                highContrast 
                  ? 'bg-gray-800 border-2 border-yellow-400' 
                  : 'bg-white/10 border border-white/20'
              }`}
            >
              <button
                onClick={() => removeFamilyMember(member.id)}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs"
              >
                ×
              </button>
              
              <div className="text-center">
                <div className="text-4xl mb-2">{member.avatar}</div>
                <div className={`font-bold text-lg ${
                  highContrast ? 'text-yellow-400' : 'text-white'
                }`}>
                  {member.name}
                </div>
                <div className={`text-sm ${
                  highContrast ? 'text-white' : 'text-white/80'
                }`}>
                  {familyRoles[member.role]?.name}
                </div>
                {member.age && (
                  <div className={`text-xs ${
                    highContrast ? 'text-gray-400' : 'text-white/60'
                  }`}>
                    Age: {member.age}
                  </div>
                )}
                
                {/* Member Stats */}
                <div className={`mt-2 text-xs ${
                  highContrast ? 'text-gray-400' : 'text-white/60'
                }`}>
                  {member.stats.sessionsPlayed} sessions played
                </div>
              </div>
            </motion.div>
          ))}
          
          {familyMembers.length === 0 && (
            <div className={`col-span-full text-center p-8 ${
              highContrast ? 'text-white' : 'text-white/70'
            }`}>
              <div className="text-6xl mb-4">👨‍👩‍👧‍👦</div>
              <p>Add family members to start learning together!</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Session Type Selection */}
      <motion.div
        className={`mb-8 p-6 rounded-3xl ${
          highContrast 
            ? 'bg-black border-4 border-yellow-400' 
            : 'bg-white/10 backdrop-blur-lg border-2 border-white/20'
        }`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className={`text-2xl font-bold mb-6 ${
          highContrast ? 'text-yellow-400' : 'text-white'
        }`}>
          Choose Learning Style
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              type: 'collaborative' as const,
              name: 'Team Work',
              description: 'Work together on every question',
              icon: '🤝',
              color: 'from-blue-500 to-purple-500'
            },
            {
              type: 'turn-based' as const,
              name: 'Take Turns',
              description: 'Each person answers different questions',
              icon: '🔄',
              color: 'from-green-500 to-blue-500'
            },
            {
              type: 'team-challenge' as const,
              name: 'Challenge Mode',
              description: 'Compete in friendly challenges',
              icon: '🏆',
              color: 'from-yellow-500 to-orange-500'
            },
            {
              type: 'story-time' as const,
              name: 'Story Time',
              description: 'Learn through storytelling',
              icon: '📚',
              color: 'from-pink-500 to-purple-500'
            }
          ].map((mode) => (
            <motion.button
              key={mode.type}
              onClick={() => setSessionType(mode.type)}
              className={`p-4 rounded-2xl text-center transition-all ${
                sessionType === mode.type 
                  ? highContrast 
                    ? 'bg-yellow-400 text-black border-4 border-yellow-300' 
                    : 'bg-white/20 border-2 border-white scale-105'
                  : highContrast 
                    ? 'bg-gray-800 border-2 border-gray-600 hover:border-yellow-400' 
                    : 'bg-white/5 border border-white/20 hover:bg-white/10'
              }`}
              whileHover={{ scale: sessionType === mode.type ? 1.05 : 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-4xl mb-2">{mode.icon}</div>
              <div className={`font-bold text-lg mb-1 ${
                sessionType === mode.type && !highContrast ? 'text-white' :
                sessionType === mode.type && highContrast ? 'text-black' :
                highContrast ? 'text-yellow-400' : 'text-white'
              }`}>
                {mode.name}
              </div>
              <div className={`text-sm ${
                sessionType === mode.type && !highContrast ? 'text-white/90' :
                sessionType === mode.type && highContrast ? 'text-black' :
                highContrast ? 'text-white' : 'text-white/70'
              }`}>
                {mode.description}
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Special Activities */}
      <motion.div
        className={`mb-8 p-6 rounded-3xl ${
          highContrast 
            ? 'bg-black border-4 border-yellow-400' 
            : 'bg-white/10 backdrop-blur-lg border-2 border-white/20'
        }`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 }}
      >
        <h3 className={`text-2xl font-bold mb-6 ${
          highContrast ? 'text-yellow-400' : 'text-white'
        }`}>
          Special Activities
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {familyActivities.map((activity, index) => (
            <motion.button
              key={activity.id}
              onClick={() => setSelectedActivity(
                selectedActivity === activity.id ? null : activity.id
              )}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className={`p-4 rounded-2xl text-left transition-all ${
                selectedActivity === activity.id 
                  ? highContrast 
                    ? 'bg-yellow-400 text-black border-4 border-yellow-300' 
                    : 'bg-white/20 border-2 border-white'
                  : highContrast 
                    ? 'bg-gray-800 border-2 border-gray-600 hover:border-yellow-400' 
                    : 'bg-white/5 border border-white/20 hover:bg-white/10'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={`font-bold text-lg mb-2 ${
                selectedActivity === activity.id && !highContrast ? 'text-white' :
                selectedActivity === activity.id && highContrast ? 'text-black' :
                highContrast ? 'text-yellow-400' : 'text-white'
              }`}>
                {activity.name}
              </div>
              <div className={`text-sm mb-3 ${
                selectedActivity === activity.id && !highContrast ? 'text-white/90' :
                selectedActivity === activity.id && highContrast ? 'text-black' :
                highContrast ? 'text-white' : 'text-white/70'
              }`}>
                {activity.description}
              </div>
              <div className={`text-xs ${
                selectedActivity === activity.id && !highContrast ? 'text-white/80' :
                selectedActivity === activity.id && highContrast ? 'text-black/80' :
                highContrast ? 'text-gray-400' : 'text-white/60'
              }`}>
                {activity.duration} minutes • {activity.minParticipants}+ people
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Start Session Button */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <button
          onClick={startFamilySession}
          disabled={familyMembers.length < 2}
          className={`px-12 py-6 rounded-3xl font-bold text-2xl transition-all ${
            familyMembers.length >= 2
              ? highContrast 
                ? 'bg-yellow-400 text-black hover:bg-yellow-300' 
                : 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600'
              : 'bg-gray-500 text-gray-300 cursor-not-allowed'
          }`}
          whileHover={familyMembers.length >= 2 ? { scale: 1.05 } : undefined}
          whileTap={familyMembers.length >= 2 ? { scale: 0.95 } : undefined}
        >
          {familyMembers.length >= 2 
            ? '🚀 Start Family Learning!' 
            : '👨‍👩‍👧‍👦 Need 2+ Family Members'}
        </button>
        
        {familyMembers.length < 2 && (
          <p className={`mt-4 text-sm ${
            highContrast ? 'text-gray-400' : 'text-white/60'
          }`}>
            Add family members above to unlock family learning mode!
          </p>
        )}
      </motion.div>

      {/* Add Member Modal */}
      <AnimatePresence>
        {showMemberSetup && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={`max-w-md w-full p-6 rounded-3xl ${
                highContrast 
                  ? 'bg-black border-4 border-yellow-400' 
                  : 'bg-white'
              }`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <h3 className={`text-2xl font-bold mb-6 ${
                highContrast ? 'text-yellow-400' : 'text-gray-800'
              }`}>
                Add Family Member
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    highContrast ? 'text-white' : 'text-gray-700'
                  }`}>
                    Name
                  </label>
                  <input
                    type="text"
                    value={newMember.name || ''}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    className={`w-full p-3 rounded-2xl ${
                      highContrast 
                        ? 'bg-gray-800 text-white border-2 border-yellow-400' 
                        : 'bg-gray-100 text-gray-800 border border-gray-300'
                    }`}
                    placeholder="Enter name..."
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    highContrast ? 'text-white' : 'text-gray-700'
                  }`}>
                    Role
                  </label>
                  <select
                    value={newMember.role || ''}
                    onChange={(e) => setNewMember({ ...newMember, role: e.target.value as FamilyMember['role'] })}
                    className={`w-full p-3 rounded-2xl ${
                      highContrast 
                        ? 'bg-gray-800 text-white border-2 border-yellow-400' 
                        : 'bg-gray-100 text-gray-800 border border-gray-300'
                    }`}
                  >
                    <option value="">Select role...</option>
                    {Object.entries(familyRoles).map(([key, role]) => (
                      <option key={key} value={key}>
                        {role.avatar} {role.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    highContrast ? 'text-white' : 'text-gray-700'
                  }`}>
                    Age (optional)
                  </label>
                  <input
                    type="number"
                    value={newMember.age || ''}
                    onChange={(e) => setNewMember({ ...newMember, age: parseInt(e.target.value) || undefined })}
                    className={`w-full p-3 rounded-2xl ${
                      highContrast 
                        ? 'bg-gray-800 text-white border-2 border-yellow-400' 
                        : 'bg-gray-100 text-gray-800 border border-gray-300'
                    }`}
                    placeholder="Age..."
                  />
                </div>
              </div>
              
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setShowMemberSetup(false)}
                  className={`flex-1 py-3 rounded-2xl font-bold ${
                    highContrast 
                      ? 'bg-gray-700 text-white hover:bg-gray-600' 
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={addFamilyMember}
                  disabled={!newMember.name || !newMember.role}
                  className={`flex-1 py-3 rounded-2xl font-bold ${
                    newMember.name && newMember.role
                      ? highContrast 
                        ? 'bg-yellow-400 text-black hover:bg-yellow-300' 
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  Add Member
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
