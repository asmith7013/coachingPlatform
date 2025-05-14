import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton'
import { Card } from '@components/composed/cards/Card'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="mt-2 text-gray-600">Sign in to your account to continue</p>
        </div>
        
        <div className="space-y-4">
          <GoogleSignInButton />
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Or continue with
              </span>
            </div>
          </div>
          
          <p className="text-center text-sm text-gray-600">
            By signing in, you agree to our{' '}
            <a href="/terms" className="font-medium text-primary-600 hover:text-primary-500">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="font-medium text-primary-600 hover:text-primary-500">
              Privacy Policy
            </a>
          </p>
        </div>
      </Card>
    </div>
  )
} 