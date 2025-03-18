import EmotionTracker from "@/components/emotion-tracker"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950">
      <EmotionTracker />
    </main>
  )
}

