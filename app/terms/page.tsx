import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Terms of Service
          </h1>
          <p className="text-lg text-gray-600">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="prose max-w-none">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="text-gray-600 mb-6">
              By accessing and using ProofBench, you accept and agree to be bound by the terms 
              and provision of this agreement.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              2. Use License
            </h2>
            <p className="text-gray-600 mb-6">
              Permission is granted to temporarily download one copy of ProofBench per device 
              for personal, non-commercial transitory viewing only.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              3. User Account
            </h2>
            <p className="text-gray-600 mb-6">
              When you create an account with us, you must provide information that is accurate, 
              complete, and current at all times. You are responsible for safeguarding the 
              password and for your account activities.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              4. Privacy Policy
            </h2>
            <p className="text-gray-600 mb-6">
              Your privacy is important to us. Our Privacy Policy explains how we collect, 
              use, and protect your information when you use our service.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              5. Prohibited Uses
            </h2>
            <p className="text-gray-600 mb-6">
              You may not use our service for any illegal or unauthorized purpose, nor may 
              you, in the use of the service, violate any laws in your jurisdiction.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              6. Contact Information
            </h2>
            <p className="text-gray-600">
              If you have any questions about these Terms of Service, please contact us 
              through our support channels.
            </p>
          </div>
        </div>

        <div className="text-center">
          <div className="space-x-4">
            <Link href="/about-us">
              <Button variant="outline" size="lg">
                About Us
              </Button>
            </Link>
            <Link href="/">
              <Button size="lg">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}