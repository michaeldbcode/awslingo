"use client"

import { useState } from "react"
import QuizStart from "@/components/QuizStart"
import { QuestionCard } from "@/components/question-card"

export default function QuizPage() {
  const [username, setUsername] = useState<string | null>(null)

  if (!username) {
    return (
      <div className="container mx-auto px-4 py-8">
        <QuizStart onStart={setUsername} />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <QuestionCard username={username} />
    </div>
  )
}