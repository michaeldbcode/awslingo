"use client"

import Link from "next/link"
import { Home } from "lucide-react"
import { useEffect, useState } from "react"

export function Navbar() {
  const [quizInProgress, setQuizInProgress] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)

  useEffect(() => {
    // Initial check
    const checkQuizState = () => {
      const completed = localStorage.getItem("quizCompleted") === "true"
      const inProgress = localStorage.getItem("quizInProgress") === "true"
      console.log("Quiz state:", { completed, inProgress })
      
      setQuizCompleted(completed)
      setQuizInProgress(inProgress)
    }

    // Check initially
    checkQuizState()

    // Listen for changes to localStorage
    const handleStorageChange = (e: StorageEvent) => {
      console.log("Storage event:", e.key, e.newValue)
      checkQuizState()
    }

    window.addEventListener('storage', handleStorageChange)

    // Also check on focus
    window.addEventListener('focus', checkQuizState)

    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('focus', checkQuizState)
    }
  }, [])

  // Only show leaderboard if quiz is NOT in progress OR is completed
  const showLeaderboard = !quizInProgress || quizCompleted

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="w-12"></div>
          {showLeaderboard && (
            <Link 
              href="/leaderboard"
              className="text-xl font-semibold hover:text-blue-100 transition-colors"
            >
              View Full Leaderboard
            </Link>
          )}
          <Link 
            href="/" 
            className="p-2 hover:bg-blue-700 rounded-full transition-colors"
          >
            <Home className="h-6 w-6" />
          </Link>
        </div>
      </div>
    </nav>
  )
}