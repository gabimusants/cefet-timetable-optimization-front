"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Plus, HelpCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Discipline {
  id: string
  name: string
  code: string
  semester: number
}

interface DisciplinesFormProps {
  data: Discipline[]
  updateData: (data: Discipline[]) => void
}

export default function DisciplinesForm({ data, updateData }: DisciplinesFormProps) {
  const [disciplines, setDisciplines] = useState<Discipline[]>(data || [])
  const [newDiscipline, setNewDiscipline] = useState<Partial<Discipline>>({
    name: "",
    code: "",
    semester: 1,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateDiscipline = () => {
    const newErrors: Record<string, string> = {}

    if (!newDiscipline.name?.trim()) {
      newErrors.name = "Discipline name is required"
    }

    if (!newDiscipline.code?.trim()) {
      newErrors.code = "Course code is required"
    } else if (disciplines.some((d) => d.code === newDiscipline.code)) {
      newErrors.code = "Course code must be unique"
    }

    if (!newDiscipline.semester) {
      newErrors.semester = "Semester is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAddDiscipline = () => {
    if (!validateDiscipline()) return

    const updatedDisciplines = [
      ...disciplines,
      {
        ...newDiscipline,
        id: Date.now().toString(),
      } as Discipline,
    ]

    setDisciplines(updatedDisciplines)
    updateData(updatedDisciplines)
    setNewDiscipline({ name: "", code: "", semester: 1 })
    setErrors({})
  }

  const handleRemoveDiscipline = (id: string) => {
    const updatedDisciplines = disciplines.filter((discipline) => discipline.id !== id)
    setDisciplines(updatedDisciplines)
    updateData(updatedDisciplines)
  }

  const handleInputChange = (field: keyof Discipline, value: string | number) => {
    setNewDiscipline((prev) => ({
      ...prev,
      [field]: value,
    }))


    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Disciplines Information</h2>
          <p className="text-sm text-gray-500 mt-1">Add all disciplines (courses) offered in the curriculum</p>
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
                Add all courses that are part of the curriculum. Each discipline should have a unique code and be
                assigned to a specific semester.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="disciplineName">
            Discipline Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="disciplineName"
            placeholder="Calculus I"
            value={newDiscipline.name || ""}
            onChange={(e) => handleInputChange("name", e.target.value)}
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        <div>
          <Label htmlFor="disciplineCode">
            Course Code <span className="text-red-500">*</span>
          </Label>
          <Input
            id="disciplineCode"
            placeholder="MATH101"
            value={newDiscipline.code || ""}
            onChange={(e) => handleInputChange("code", e.target.value)}
            className={errors.code ? "border-red-500" : ""}
          />
          {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code}</p>}
        </div>

        <div>
          <Label htmlFor="disciplineSemester">
            Semester <span className="text-red-500">*</span>
          </Label>
          <Select
            value={newDiscipline.semester?.toString() || ""}
            onValueChange={(value) => handleInputChange("semester", Number.parseInt(value))}
          >
            <SelectTrigger id="disciplineSemester" className={errors.semester ? "border-red-500" : ""}>
              <SelectValue placeholder="Select semester" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 10 }, (_, i) => (
                <SelectItem key={i + 1} value={(i + 1).toString()}>
                  Semester {i + 1}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.semester && <p className="text-red-500 text-xs mt-1">{errors.semester}</p>}
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleAddDiscipline} className="bg-blue-700 hover:bg-blue-800">
          <Plus className="h-4 w-4 mr-2" /> Add Discipline
        </Button>
      </div>

      {disciplines.length > 0 ? (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {disciplines.map((discipline) => (
                <TableRow key={discipline.id}>
                  <TableCell>{discipline.name}</TableCell>
                  <TableCell>{discipline.code}</TableCell>
                  <TableCell>Semester {discipline.semester}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveDiscipline(discipline.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-8 border rounded-md bg-gray-50">
          <p className="text-gray-500">No disciplines added yet</p>
          <p className="text-sm text-gray-400 mt-1">Add disciplines using the form above</p>
        </div>
      )}
    </div>
  )
}
