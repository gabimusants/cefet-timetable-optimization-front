"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { HelpCircle, Save } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Slider } from "@/components/ui/slider"

interface Discipline {
  id: string
  name: string
  code: string
  semester: number
}

interface RepprovalRatesFormProps {
  disciplines: Discipline[]
  data: Record<string, number>
  updateData: (data: Record<string, number>) => void
}

export default function RepprovalRatesForm({ disciplines, data, updateData }: RepprovalRatesFormProps) {
  const [rates, setRates] = useState<Record<string, number>>(data || {})
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const initialRates = { ...rates }
    let updated = false

    disciplines.forEach((discipline) => {
      if (initialRates[discipline.id] === undefined) {
        initialRates[discipline.id] = 0
        updated = true
      }
    })

    if (updated) {
      setRates(initialRates)
      updateData(initialRates)
    }
  }, [disciplines, rates, updateData])

  const handleRateChange = (disciplineId: string, value: number[]) => {
    const newRate = value[0]

    setRates((prev) => ({
      ...prev,
      [disciplineId]: newRate,
    }))

    if (errors[disciplineId]) {
      setErrors((prev) => ({
        ...prev,
        [disciplineId]: "",
      }))
    }
  }

  const handleSaveAll = () => {
    const newErrors: Record<string, string> = {}

    disciplines.forEach((discipline) => {
      const rate = rates[discipline.id]
      if (rate === undefined) {
        newErrors[discipline.id] = "Repproval rate is required"
      } else if (rate < 0 || rate > 100) {
        newErrors[discipline.id] = "Rate must be between 0 and 100"
      }
    })

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      updateData(rates)
    }
  }

  const handleInputChange = (disciplineId: string, value: string) => {
    const numValue = Number.parseFloat(value)

    if (isNaN(numValue)) {
      setRates((prev) => ({
        ...prev,
        [disciplineId]: 0,
      }))
    } else {
      const clampedValue = Math.min(Math.max(numValue, 0), 100)
      setRates((prev) => ({
        ...prev,
        [disciplineId]: clampedValue,
      }))
    }

    if (errors[disciplineId]) {
      setErrors((prev) => ({
        ...prev,
        [disciplineId]: "",
      }))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Discipline Repproval Rates</h2>
          <p className="text-sm text-gray-500 mt-1">Set the historical repproval rate for each discipline</p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon">
                <HelpCircle className="h-5 w-5 text-gray-500" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>
                Enter the historical repproval rate (percentage of students who fail) for each discipline. This helps
                the algorithm optimize the timetable to balance difficult courses.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {disciplines.length === 0 ? (
        <div className="text-center py-8 border rounded-md bg-yellow-50 text-yellow-700">
          <p className="font-medium">Missing required data</p>
          <p className="text-sm mt-1">Please add disciplines first before setting repproval rates.</p>
        </div>
      ) : (
        <>
          <div className="flex justify-end mb-4">
            <Button onClick={handleSaveAll} className="bg-blue-700 hover:bg-blue-800">
              <Save className="h-4 w-4 mr-2" /> Save All Rates
            </Button>
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Discipline</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead className="w-[300px]">Repproval Rate (%)</TableHead>
                  <TableHead className="w-[80px]">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {disciplines.map((discipline) => (
                  <TableRow key={discipline.id}>
                    <TableCell>
                      {discipline.name} ({discipline.code})
                    </TableCell>
                    <TableCell>Semester {discipline.semester}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-4">
                        <Slider
                          value={[rates[discipline.id] || 0]}
                          min={0}
                          max={100}
                          step={1}
                          onValueChange={(value) => handleRateChange(discipline.id, value)}
                          className={errors[discipline.id] ? "border-red-500" : ""}
                        />
                      </div>
                      {errors[discipline.id] && <p className="text-red-500 text-xs mt-1">{errors[discipline.id]}</p>}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={rates[discipline.id] || 0}
                        onChange={(e) => handleInputChange(discipline.id, e.target.value)}
                        className="w-16"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  )
}
