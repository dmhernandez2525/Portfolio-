import { Button } from "@/components/ui/button"
import type { TutorialStep } from "@/types/game-enhancement"

interface GameTutorialOverlayProps {
  open: boolean
  steps: TutorialStep[]
  currentStep: number
  onClose: () => void
  onNext: () => void
  onPrevious: () => void
}

export function GameTutorialOverlay({
  open,
  steps,
  currentStep,
  onClose,
  onNext,
  onPrevious,
}: GameTutorialOverlayProps) {
  if (!open || steps.length === 0) return null
  const step = steps[currentStep] ?? steps[0]

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/60 p-4 md:items-center">
      <div className="w-full max-w-md rounded-xl border border-border bg-background p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Tutorial {currentStep + 1}/{steps.length}
        </p>
        <h3 className="mt-1 text-lg font-semibold">{step.title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={onPrevious} disabled={currentStep === 0}>
            Previous
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Skip
            </Button>
            <Button size="sm" onClick={onNext}>
              {currentStep === steps.length - 1 ? "Finish" : "Next"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
