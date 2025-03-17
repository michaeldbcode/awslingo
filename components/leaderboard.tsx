"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getLeaderboard } from "@/utils/api"

type LeaderboardEntry = {
  username: string
  correctAnswers: number
  totalTime: number
}

type APILeaderboardEntry = {
  username: string
  score: number
  completion_time: number
}

export function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await getLeaderboard()
        // Transform the API data to match our component's type
        const transformedData: LeaderboardEntry[] = data.map((entry: APILeaderboardEntry) => ({
          username: entry.username,
          correctAnswers: entry.score,
          totalTime: entry.completion_time
        }))
        setLeaderboard(transformedData)
      } catch (err) {
        setError("Failed to load leaderboard")
        console.error("Leaderboard error:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeaderboard()
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto bg-blue-600 text-white shadow-xl">
        <CardContent className="p-8 text-center">
          Loading leaderboard...
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full max-w-4xl mx-auto bg-blue-600 text-white shadow-xl">
        <CardContent className="p-8 text-center">
          {error}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-4xl mx-auto bg-blue-600 text-white shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">AWS Quiz Leaderboard</CardTitle>
        <p className="text-blue-100 text-center mt-2">Rankings based on correct answers and completion time</p>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-lg">
          {/* Header */}
          <div className="grid grid-cols-12 gap-2 p-4 bg-blue-700 font-semibold text-blue-50">
            <div className="col-span-2">Rank</div>
            <div className="col-span-4">Username</div>
            <div className="col-span-3 text-center">Correct</div>
            <div className="col-span-3 text-right">Time</div>
            </div>
          
          {/* Entries */}
          <div className="divide-y divide-blue-500/30">
            {leaderboard.map((entry, index) => (
              <div 
              key={index}
              className="grid grid-cols-12 gap-2 p-4 items-center hover:bg-blue-500/20 transition-colors"
            >
              <div className="col-span-2 font-bold text-yellow-300">#{index + 1}</div>
              <div className="col-span-4 font-medium truncate" title={entry.username}>{entry.username}</div>
              <div className="col-span-3 text-center">
                {entry.correctAnswers}
                <span className="text-blue-200 text-sm ml-1">/ 20</span>
              </div>
              <div className="col-span-3 text-right font-mono">{formatTime(entry.totalTime)}</div>
            </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}