import { useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { LoginForm } from "@/components/auth/LoginForm"

export default function Login() {
  const { isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()

  if (!isLoading && isAuthenticated) {
    navigate("/", { replace: true })
    return null
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <LoginForm />
    </div>
  )
}