import { CheckCircle2 } from "lucide-react"

interface StepIndicatorProps {
  currentStep: number
  totalSteps: number
}

export default function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  const steps = ["Teachers", "Disciplines", "Assignments", "Prerequisites", "Repproval Rates", "Workloads", "Review"]

  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-blue-800 mb-6 text-center">Input University Data</h1>

      <div className="hidden md:flex justify-between items-center">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                index + 1 === currentStep
                  ? "bg-blue-700 text-white"
                  : index + 1 < currentStep
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-400"
              }`}
            >
              {index + 1 < currentStep ? <CheckCircle2 className="h-6 w-6" /> : <span>{index + 1}</span>}
            </div>
            <span
              className={`text-xs ${
                index + 1 === currentStep
                  ? "font-medium text-blue-700"
                  : index + 1 < currentStep
                    ? "text-green-700"
                    : "text-gray-500"
              }`}
            >
              {step}
            </span>
          </div>
        ))}
      </div>

      <div className="md:hidden flex items-center justify-center mb-4">
        <span className="text-sm text-gray-600">
          Step {currentStep} of {totalSteps}:{" "}
          <span className="font-medium text-blue-700">{steps[currentStep - 1]}</span>
        </span>
      </div>

      <div className="md:hidden flex justify-between items-center px-4">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full ${
              index + 1 === currentStep ? "bg-blue-700" : index + 1 < currentStep ? "bg-green-500" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  )
}
