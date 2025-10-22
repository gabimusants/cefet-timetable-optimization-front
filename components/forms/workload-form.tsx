"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { HelpCircle, Save } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Discipline {
  id: string
  name: string
  code: string
  semester: number
}

interface WorkloadFormProps {
  disciplines: Discipline[]
  data: Record<string, number>
  updateData: (data: Record<string, number>) => void
}

export default function WorkloadForm({ disciplines, data, updateData }: WorkloadFormProps) {
  const [workloads, setWorkloads] = useState<Record<string, number>>(data || {})
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const initialWorkloads = { ...workloads }
    let updated = false

    disciplines.forEach((discipline) => {
      if (initialWorkloads[discipline.id] === undefined) {
        initialWorkloads[discipline.id] = 2
        updated = true
      }
    })

    if (updated) {
      setWorkloads(initialWorkloads)
      updateData(initialWorkloads)
    }
  }, [disciplines, workloads, updateData])

  const handleWorkloadChange = (disciplineId: string, value: string) => {
    const numValue = Number.parseInt(value)

    if (isNaN(numValue) || numValue < 1) {
      setErrors((prev) => ({
        ...prev,
        [disciplineId]: "Workload must be at least 1 hour",
      }))
      return
    }

    if (numValue > 10) {
      setErrors((prev) => ({
        ...prev,
        [disciplineId]: "Workload cannot exceed 10 hours",
      }))
      return
    }

    setWorkloads((prev) => ({
      ...prev,
      [disciplineId]: numValue,
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
      const workload = workloads[discipline.id]
      if (!workload) {
        newErrors[discipline.id] = "Workload is required"
      } else if (workload < 1) {
        newErrors[discipline.id] = "Workload must be at least 1 hour"
      } else if (workload > 10) {
        newErrors[discipline.id] = "Workload cannot exceed 10 hours"
      }
    })

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      updateData(workloads)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Discipline Workloads</h2>
          <p className="text-sm text-gray-500 mt-1">Set the weekly workload (in hours) for each discipline</p>
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
                Enter the number of hours per week for each discipline. This helps the algorithm distribute the workload
                evenly across the week.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {disciplines.length === 0 ? (
        <div className="text-center py-8 border rounded-md bg-yellow-50 text-yellow-700">
          <p className="font-medium">Missing required data</p>
          <p className="text-sm mt-1">Please add disciplines first before setting workloads.</p>
        </div>
      ) : (
        <>
          <div className="flex justify-end mb-4">
            <Button onClick={handleSaveAll} className="bg-blue-700 hover:bg-blue-800">
              <Save className="h-4 w-4 mr-2" /> Save All Workloads
            </Button>
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Discipline</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead className="w-[200px]">Weekly Hours</TableHead>
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
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          min={1}
                          max={10}
                          value={workloads[discipline.id] || 2}
                          onChange={(e) => handleWorkloadChange(discipline.id, e.target.value)}
                          className={`w-20 ${errors[discipline.id] ? "border-red-500" : ""}`}
                        />
                        <span className="text-gray-500">hours</span>
                      </div>
                      {errors[discipline.id] && <p className="text-red-500 text-xs mt-1">{errors[discipline.id]}</p>}
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
