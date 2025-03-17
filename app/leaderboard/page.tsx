"use client"

import { Leaderboard } from "@/components/leaderboard"
import { useRouter } from "next/navigation"

export default function LeaderboardPage() {
  // No need to check for quiz completion anymore
  
  return (
    <div className="container mx-auto py-8 px-4">
      <Leaderboard />
    </div>
  )
}