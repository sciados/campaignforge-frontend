'use client'

import { useState, useEffect, createContext, useContext, useCallback } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  const validateToken = useCallback(async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/validate`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        setIsAuthenticated(true)
      } else {
        localStorage.removeItem('authToken')
        setUser(null)
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error('Token validation failed:', error)
      localStorage.removeItem('authToken')
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }, [API_BASE_URL])

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (token) {
      validateToken(token)
    } else {
      setIsLoading(false)
    }
  }, [validateToken])

  const login = async (email, password) => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      if (response.ok) {
        const data = await response.json()
        const { user: userData, access_token } = data
        
        localStorage.setItem('authToken', access_token)
        setUser(userData)
        setIsAuthenticated(true)
        
        return { success: true, user: userData }
      } else {
        const errorData = await response.json()
        return { 
          success: false, 
          error: errorData.detail || 'Login failed' 
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { 
        success: false, 
        error: 'Network error - please try again' 
      }
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData) => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      })

      if (response.ok) {
        const data = await response.json()
        const { user: newUser, access_token } = data
        
        localStorage.setItem('authToken', access_token)
        setUser(newUser)
        setIsAuthenticated(true)
        
        return { success: true, user: newUser }
      } else {
        const errorData = await response.json()
        return { 
          success: false, 
          error: errorData.detail || 'Registration failed' 
        }
      }
    } catch (error) {
      console.error('Registration error:', error)
      return { 
        success: false, 
        error: 'Network error - please try again' 
      }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('authToken')
    setUser(null)
    setIsAuthenticated(false)
  }

  const updateUser = (userData) => {
    setUser(prev => prev ? { ...prev, ...userData } : null)
  }

  const refreshToken = async () => {
    const token = localStorage.getItem('authToken')
    if (token) {
      await validateToken(token)
    }
  }

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    refreshToken
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}