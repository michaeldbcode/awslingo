"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getLeaderboard } from "@/utils/api"

type LeaderboardEntry = {
  username: string
  correctAnswers: number
  totalTime: number
}

export function TopFiveLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await getLeaderboard()
        const transformedData: LeaderboardEntry[] = data
          .map((entry) => ({
            username: entry.username,
            correctAnswers: entry.score,
            totalTime: entry.completion_time
          }))
          .slice(0, 5) // Only take top 5
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
      <Card className="w-full max-w-md mx-auto mt-6 bg-blue-600 text-white">
        <CardContent className="p-4 text-center">
          Loading top scores...
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return null // Hide completely if there's an error
  }

  if (leaderboard.length === 0) {
    return (
      <Card className="w-full max-w-md mx-auto mt-6 bg-blue-600 text-white">
        <CardContent className="p-4 text-center">
          No quiz attempts yet. Be the first!
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-6 bg-blue-600 text-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold text-center">Current Top 5 Leaderboard</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-lg">
          <div className="divide-y divide-blue-500/30">
            {leaderboard.map((entry, index) => (
              <div 
                key={index}
                className="grid grid-cols-4 gap-2 py-2 items-center"
              >
                <div className="font-bold text-yellow-300">#{index + 1}</div>
                <div className="font-medium truncate">{entry.username}</div>
                <div className="text-center">
                  {entry.correctAnswers}
                  <span className="text-blue-200 text-sm ml-1">/ 20</span>
                </div>
                <div className="text-right font-mono text-sm">{formatTime(entry.totalTime)}</div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}