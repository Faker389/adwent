"use client"
import { useSearchParams, useRouter } from "next/navigation"
import { ResetPasswordForm } from "../../components/ResetPassPage"
import { Suspense, useState } from "react"

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const oobCode = searchParams.get("oobCode")
  const [alert, setAlert] = useState<{ message: string; type: "error" | "success" | "warning" } | null>(null)

  const showAlert = (message: string, type: "error" | "success" | "warning") => {
    setAlert({ message, type })
    setTimeout(() => setAlert(null), 5000)
  }

  if (!oobCode) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-red-950 via-red-900 to-red-950 p-4">
        <div className="bg-gradient-to-b from-red-900/90 to-red-950/90 backdrop-blur-lg border-2 border-yellow-400/50 rounded-3xl p-8 shadow-2xl text-center">
          <h2 className="font-christmas text-3xl font-bold text-yellow-400 mb-4">Nieprawidłowy Link</h2>
          <p className="text-red-200 font-serif mb-6">Link resetowania hasła jest nieprawidłowy lub wygasł.</p>
          <button
            onClick={() => router.push("/")}
            className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-bold py-3 px-6 rounded-xl"
          >
            Wróć do strony głównej
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-950 via-red-900 to-red-950 p-4">
      <div className="w-full max-w-md">
        {alert && (
          <div
            className={`mb-4 p-4 rounded-2xl border-2 ${
              alert.type === "success"
                ? "bg-green-900/50 border-green-400 text-green-200"
                : alert.type === "error"
                  ? "bg-red-900/50 border-red-400 text-red-200"
                  : "bg-yellow-900/50 border-yellow-400 text-yellow-200"
            }`}
          >
            {alert.message}
          </div>
        )}
        <ResetPasswordForm oobCode={oobCode} showAlert={showAlert} />
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-950 via-red-900 to-red-950">
          <div className="text-yellow-400 text-2xl font-christmas">Ładowanie...</div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  )
}
