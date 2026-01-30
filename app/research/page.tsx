import { Suspense } from "react"
import ResearchClient from "./research-client"

export default function ResearchPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ResearchClient />
    </Suspense>
  )
}

export function Loading() {
  return null
}
