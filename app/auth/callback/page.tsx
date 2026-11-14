"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    // Your /system page already parses hash tokens and stores them.
    // We just forward there after OAuth completes.
    router.replace("/system")
  }, [router])

  return null
}
