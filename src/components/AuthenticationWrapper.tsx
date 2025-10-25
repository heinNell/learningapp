
import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { motion } from 'framer-motion'
import {User, LogOut, Star, Trophy, Target} from 'lucide-react'

interface AuthenticationWrapperProps {
  children: React.ReactNode
  requireAuth?: boolean
  showUserInfo?: boolean
}

export const AuthenticationWrapper: React.FC<AuthenticationWrapperProps> = ({
  children,
  requireAuth = false,
  showUserInfo = true
}) => {
  const { user, isAuthenticated, loading, signIn, signOut } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 via-pink-400 to-red-400">
        <div className="text-white text-2xl font-bold">Loading...</div>
      </div>
    )
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 via-pink-400 to-red-400">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-12 shadow-2xl text-center max-w-md mx-4"
        >
          <div className="text-8xl mb-6">🎮</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Welcome to Kids Quiz Adventure!
          </h2>
          <p className="text-gray-600 mb-8">
            Sign in to save your progress, unlock achievements, and continue your learning journey!
          </p>
          
          <motion.button
            onClick={signIn}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 px-8 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            Sign In to Continue
          </motion.button>
          
          <p className="text-sm text-gray-500 mt-4">
            Your progress will be saved and synced across devices
          </p>
        </motion.div>
      </div>
    )
  }

  // Render children with optional user info
  return (
    <div className="min-h-screen">
      {/* User Info Header */}
      {showUserInfo && isAuthenticated && user && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/10 backdrop-blur-sm border-b border-white/20"
        >
          <div className="max-w-7xl mx-auto px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                  <User size={20} className="text-white" />
                </div>
                <div>
                  <div className="text-white font-semibold">
                    Welcome back, {user.userName}!
                  </div>
                  <div className="text-white/70 text-sm">
                    {user.userRole === 'ADMIN' ? 'Administrator' : 'Learning Explorer'}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                {/* Quick Stats */}
                <div className="hidden md:flex items-center space-x-4 text-white/90">
                  <div className="flex items-center space-x-1">
                    <Star size={16} className="text-yellow-300" />
                    <span className="text-sm font-medium">Stars</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Trophy size={16} className="text-orange-300" />
                    <span className="text-sm font-medium">Badges</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Target size={16} className="text-green-300" />
                    <span className="text-sm font-medium">Level</span>
                  </div>
                </div>

                {/* Sign Out Button */}
                <motion.button
                  onClick={signOut}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl transition-colors"
                >
                  <LogOut size={16} />
                  <span className="hidden sm:inline">Sign Out</span>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      {children}
    </div>
  )
}

export default AuthenticationWrapper