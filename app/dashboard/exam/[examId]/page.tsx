'use client'

import { ProtectedRoute } from '@/components/ui/protected-route'
import { useAuth } from '@/contexts/auth'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useParams } from 'next/navigation'

// Mock exam data
const examData = {
  'frt75rg84tg7': {
    title: 'JavaScript Fundamentals',
    description: 'Test your knowledge of JavaScript basics',
    duration: '45 minutes',
    questions: [
      {
        id: 1,
        question: 'What is the correct way to declare a variable in JavaScript?',
        options: ['var x = 5;', 'variable x = 5;', 'v x = 5;', 'declare x = 5;'],
        correct: 0
      },
      {
        id: 2,
        question: 'Which operator is used for strict equality comparison?',
        options: ['==', '===', '=', '!='],
        correct: 1
      }
    ]
  },
  'math101basic': {
    title: 'Mathematics 101',
    description: 'Basic algebra and arithmetic',
    duration: '60 minutes',
    questions: [
      {
        id: 1,
        question: 'What is 2 + 2?',
        options: ['3', '4', '5', '6'],
        correct: 1
      }
    ]
  },
  'react_advanced': {
    title: 'Advanced React Concepts',
    description: 'Hooks, Context, and performance optimization',
    duration: '90 minutes',
    questions: [
      {
        id: 1,
        question: 'Which hook is used for side effects in React?',
        options: ['useState', 'useEffect', 'useContext', 'useMemo'],
        correct: 1
      }
    ]
  }
}

export default function ExamPage() {
  const { user, signOut } = useAuth()
  const params = useParams()
  const examId = params.examId as string
  
  const exam = examData[examId as keyof typeof examData]

  if (!exam) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-4">
                <div className="flex items-center space-x-4">
                  <Link href="/dashboard/exams">
                    <Button variant="outline">
                      ← Back to Exams
                    </Button>
                  </Link>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Exam Not Found
                  </h1>
                </div>
              </div>
            </div>
          </header>
          
          <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <h2 className="text-xl text-gray-900 mb-4">
                The exam you're looking for doesn't exist.
              </h2>
              <Link href="/dashboard/exams">
                <Button>
                  Browse Available Exams
                </Button>
              </Link>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <Link href="/dashboard/exams">
                  <Button variant="outline">
                    ← Back to Exams
                  </Button>
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">
                  {exam.title}
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
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                {exam.title}
              </h2>
              <p className="text-gray-600 mb-4">
                {exam.description}
              </p>
              <div className="text-sm text-gray-500">
                <span>Duration: {exam.duration}</span>
                <span className="mx-2">•</span>
                <span>{exam.questions.length} Questions</span>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-yellow-800 mb-2">
                  Exam Instructions
                </h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Read each question carefully before answering</li>
                  <li>• You can review and change your answers before submitting</li>
                  <li>• Once submitted, you cannot modify your responses</li>
                  <li>• Make sure you have a stable internet connection</li>
                </ul>
              </div>

              <div className="text-center">
                <Button size="lg" className="px-8">
                  Begin Exam
                </Button>
                <p className="text-sm text-gray-500 mt-2">
                  Click to start the timer and begin your exam
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}