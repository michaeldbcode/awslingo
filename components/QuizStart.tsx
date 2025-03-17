"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { validateUsername } from "@/utils/api"
import { TopFiveLeaderboard } from "./top-five-leaderboard" // Make sure path is correct

type QuizStartProps = {
  onStart: (username: string) => void
}

export default function QuizStart({ onStart }: QuizStartProps) {
  const [username, setUsername] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleStart = async () => {
    setIsLoading(true)
    setError("")

    try {
      const result = await validateUsername(username)
      if (!result.valid) {
        setError(result.error || "Failed to validate username")
        return
      }
      onStart(username.trim())
    } catch (error) {
      setError("Failed to validate username. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="w-full max-w-md mx-auto bg-blue-600 text-white">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">AWS SAA CO3 Certification Quiz</CardTitle>
          <p className="text-blue-100 text-center mt-2">
            Fun & short quiz of 20 official AWS SAA Certification sample questions to test your knowledge and see where you rank!
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                setError("")
              }}
              className="w-full bg-white/10 border-white/20 text-white placeholder:text-white/50"
              maxLength={15}
              disabled={isLoading}
            />
            {error && (
              <div className="text-red-300 text-sm mt-1">
                {error}
              </div>
            )}
            <div className="mt-4 text-blue-100">
              <span>Username requirements:</span>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>3-15 characters long</li>
                <li>Letters, numbers, underscores, and hyphens only</li>
                <li>Must be unique and appropriate</li>
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            <Button 
              onClick={handleStart}
              className="w-full bg-white hover:bg-blue-50 text-blue-600 transition-colors"
              disabled={!username.trim() || isLoading}
            >
              {isLoading ? "Validating..." : "Start Quiz"}
            </Button>
            
            <div className="text-sm text-blue-100 text-center">
              You will have one attempt to answer all questions.
              Your time will be recorded.
            </div>
          </div>
        </CardContent>
      </Card>

      <TopFiveLeaderboard />
    </div>
  )
}

