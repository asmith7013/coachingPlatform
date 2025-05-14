import { useClerk } from '@clerk/nextjs'
import { Button } from '@/components/core/Button'

export function SignOutButton() {
  const { signOut } = useClerk()
  
  const handleSignOut = () => {
    signOut()
  }
  
  return (
    <Button
      onClick={handleSignOut}
      intent="secondary"
      className="w-full justify-start"
    >
      <svg
        className="w-5 h-5 mr-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
        />
      </svg>
      Sign out
    </Button>
  )
} 