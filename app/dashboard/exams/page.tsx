'use client'

import { ProtectedRoute } from '@/components/ui/protected-route'
import { useAuth } from '@/contexts/auth'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const sampleExams = [
  {
    id: 'frt75rg84tg7',
    title: 'JavaScript Fundamentals',
    description: 'Test your knowledge of JavaScript basics',
    duration: '45 minutes',
    questions: 25,
    difficulty: 'Beginner'
  },
  {
    id: 'math101basic',
    title: 'Mathematics 101',
    description: 'Basic algebra and arithmetic',
    duration: '60 minutes',
    questions: 30,
    difficulty: 'Intermediate'
  },
  {
    id: 'react_advanced',
    title: 'Advanced React Concepts',
    description: 'Hooks, Context, and performance optimization',
    duration: '90 minutes',
    questions: 40,
    difficulty: 'Advanced'
  }
]

export default function ExamsPage() {
  const { user, signOut } = useAuth()

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <Link href="/dashboard">
                  <Button variant="outline">
                    ← Dashboard
                  </Button>
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">
                  Available Exams
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">
                  {user?.user_metadata?.full_name || user?.email}
                </span>
                <Button onClick={signOut} variant="outline">
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sampleExams.map((exam) => (
              <div key={exam.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {exam.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    {exam.description}
                  </p>
                  
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span>{exam.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Questions:</span>
                      <span>{exam.questions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Difficulty:</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        exam.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                        exam.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {exam.difficulty}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <Link href={`/dashboard/exam/${exam.id}`}>
                    <Button className="w-full">
                      Start Exam
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {sampleExams.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-white rounded-lg shadow-md p-8">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No exams available
                </h3>
                <p className="text-gray-500">
                  Check back later for new exams and assessments.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}