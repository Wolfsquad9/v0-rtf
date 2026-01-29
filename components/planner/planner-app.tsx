"use client"

import { PlannerProvider, usePlanner } from "@/hooks/use-planner"
import { PlannerLayout } from "./planner-layout"
import { PlannerList } from "./planner-list"
import { Onboarding } from "./onboarding"

function PlannerContent() {
  const { state, isLoading, initializeFramework } = usePlanner()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-[10px] font-bold uppercase tracking-[0.5em] text-muted-foreground animate-pulse">
          Initializing Transformation Protocol...
        </div>
      </div>
    )
  }

  if (!state) {
    return <Onboarding onSelect={initializeFramework} />
  }

  return (
    <PlannerLayout>
      <PlannerList />
    </PlannerLayout>
  )
}

export function PlannerApp() {
  return (
    <PlannerProvider>
      <PlannerContent />
    </PlannerProvider>
  )
}
