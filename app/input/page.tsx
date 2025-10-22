"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import TeachersForm from "@/components/forms/teachers-form"
import DisciplinesForm from "@/components/forms/disciplines-form"
import TeacherDisciplineForm from "@/components/forms/teacher-discipline-form"
import PrerequisitesForm from "@/components/forms/prerequisites-form"
import RepprovalRatesForm from "@/components/forms/repproval-rates-form"
import WorkloadForm from "@/components/forms/workload-form"
import ReviewForm from "@/components/forms/review-form"
import StepIndicator from "@/components/step-indicator"

export default function InputPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    teachers: [],
    disciplines: [],
    teacherDisciplines: [],
    prerequisites: [],
    repprovalRates: {},
    workloads: {},
  })

  const totalSteps = 7

  const updateFormData = (field, data) => {
    setFormData((prev) => ({
      ...prev,
      [field]: data,
    }))
  }

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
      window.scrollTo(0, 0)
    } else {
      submitData()
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      window.scrollTo(0, 0)
    }
  }

  const submitData = async () => {
    try {
      localStorage.setItem("timetableData", JSON.stringify(formData))
      router.push("/results")
    } catch (error) {
      console.error("Error submitting data:", error)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <TeachersForm data={formData.teachers} updateData={(data) => updateFormData("teachers", data)} />
      case 2:
        return (
          <DisciplinesForm data={formData.disciplines} updateData={(data) => updateFormData("disciplines", data)} />
        )
      case 3:
        return (
          <TeacherDisciplineForm
            teachers={formData.teachers}
            disciplines={formData.disciplines}
            data={formData.teacherDisciplines}
            updateData={(data) => updateFormData("teacherDisciplines", data)}
          />
        )
      case 4:
        return (
          <PrerequisitesForm
            disciplines={formData.disciplines}
            data={formData.prerequisites}
            updateData={(data) => updateFormData("prerequisites", data)}
          />
        )
      case 5:
        return (
          <RepprovalRatesForm
            disciplines={formData.disciplines}
            data={formData.repprovalRates}
            updateData={(data) => updateFormData("repprovalRates", data)}
          />
        )
      case 6:
        return (
          <WorkloadForm
            disciplines={formData.disciplines}
            data={formData.workloads}
            updateData={(data) => updateFormData("workloads", data)}
          />
        )
      case 7:
        return <ReviewForm formData={formData} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <Card className="max-w-4xl mx-auto p-6 shadow-lg">
          <div className="mb-8">
            <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
          </div>

          {renderStepContent()}

          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
              Back
            </Button>

            <Button onClick={handleNext} className="bg-blue-700 hover:bg-blue-800">
              {currentStep === totalSteps ? "Generate Timetable" : "Next"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
