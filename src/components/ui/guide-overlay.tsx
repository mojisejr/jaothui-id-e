"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface GuideStep {
  id: string
  title: string
  description: string
  target: string // CSS selector for target element
  position: "top" | "bottom" | "left" | "right"
}

interface GuideOverlayProps {
  steps: GuideStep[]
  currentStep: number
  onComplete: () => void
  onSkip: () => void
  onNext: () => void
  onPrevious: () => void
  isVisible: boolean
}

export function GuideOverlay({
  steps,
  currentStep,
  onComplete,
  onSkip,
  onNext,
  onPrevious,
  isVisible
}: GuideOverlayProps) {
  if (!isVisible || currentStep >= steps.length) return null

  const step = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1
  const isFirstStep = currentStep === 0

  return (
    <div className="fixed inset-0 z-50 bg-black/20 animate-in fade-in-0">
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-6 shadow-lg">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">{step.title}</h3>
              <span className="text-sm text-muted-foreground">
                {currentStep + 1} / {steps.length}
              </span>
            </div>
            <p className="text-muted-foreground">{step.description}</p>
          </div>
          
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={onSkip}
              className="text-sm min-h-[44px]"
            >
              ข้าม
            </Button>
            
            <div className="flex gap-2">
              {!isFirstStep && (
                <Button
                  variant="outline"
                  onClick={onPrevious}
                  className="text-sm min-h-[44px]"
                >
                  ย้อนกลับ
                </Button>
              )}
              
              <Button
                onClick={isLastStep ? onComplete : onNext}
                className="text-sm min-h-[44px]"
              >
                {isLastStep ? "เริ่มต้นใช้งาน" : "ถัดไป"}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
