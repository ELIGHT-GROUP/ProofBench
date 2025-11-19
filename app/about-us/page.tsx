import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            About ProofBench
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We're building the future of learning and assessment platforms.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-12">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Our Mission
            </h2>
            <p className="text-gray-600 mb-4">
              ProofBench is designed to revolutionize how students and professionals 
              approach learning and testing. We believe in creating an accessible, 
              intuitive platform that makes assessment engaging and effective.
            </p>
            <p className="text-gray-600">
              Our goal is to provide tools that help learners track their progress, 
              identify areas for improvement, and achieve their educational objectives.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              What We Offer
            </h2>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                Interactive learning experiences
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                Comprehensive progress tracking
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                Personalized study recommendations
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                Advanced analytics and reporting
              </li>
            </ul>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-gray-600 mb-6">
            Join thousands of learners who are already using ProofBench to achieve their goals.
          </p>
          <div className="space-x-4">
            <Link href="/login">
              <Button size="lg">
                Sign Up Now
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" size="lg">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}