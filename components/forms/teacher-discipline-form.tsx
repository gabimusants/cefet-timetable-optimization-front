"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Plus, HelpCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Teacher {
  id: string
  name: string
  email: string
  department: string
}

interface Discipline {
  id: string
  name: string
  code: string
  semester: number
}

interface TeacherDiscipline {
  id: string
  teacherId: string
  disciplineId: string
}

interface TeacherDisciplineFormProps {
  teachers: Teacher[]
  disciplines: Discipline[]
  data: TeacherDiscipline[]
  updateData: (data: TeacherDiscipline[]) => void
}

export default function TeacherDisciplineForm({ teachers, disciplines, data, updateData }: TeacherDisciplineFormProps) {
  const [assignments, setAssignments] = useState<TeacherDiscipline[]>(data || [])
  const [newAssignment, setNewAssignment] = useState<Partial<TeacherDiscipline>>({
    teacherId: "",
    disciplineId: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateAssignment = () => {
    const newErrors: Record<string, string> = {}

    if (!newAssignment.teacherId) {
      newErrors.teacherId = "Teacher is required"
    }

    if (!newAssignment.disciplineId) {
      newErrors.disciplineId = "Discipline is required"
    } else if (
      assignments.some((a) => a.teacherId === newAssignment.teacherId && a.disciplineId === newAssignment.disciplineId)
    ) {
      newErrors.disciplineId = "This teacher is already assigned to this discipline"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAddAssignment = () => {
    if (!validateAssignment()) return

    const updatedAssignments = [
      ...assignments,
      {
        ...newAssignment,
        id: Date.now().toString(),
      } as TeacherDiscipline,
    ]

    setAssignments(updatedAssignments)
    updateData(updatedAssignments)
    setNewAssignment({ teacherId: "", disciplineId: "" })
    setErrors({})
  }

  const handleRemoveAssignment = (id: string) => {
    const updatedAssignments = assignments.filter((assignment) => assignment.id !== id)
    setAssignments(updatedAssignments)
    updateData(updatedAssignments)
  }

  const getTeacherName = (teacherId: string) => {
    const teacher = teachers.find((t) => t.id === teacherId)
    return teacher ? teacher.name : "Unknown Teacher"
  }

  const getDisciplineName = (disciplineId: string) => {
    const discipline = disciplines.find((d) => d.id === disciplineId)
    return discipline ? `${discipline.name} (${discipline.code})` : "Unknown Discipline"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Teacher-Discipline Assignments</h2>
          <p className="text-sm text-gray-500 mt-1">Assign teachers to the disciplines they can teach</p>
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
                Assign teachers to disciplines they are qualified to teach. A teacher can be assigned to multiple
                disciplines, and a discipline can have multiple teachers.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {teachers.length === 0 || disciplines.length === 0 ? (
        <div className="text-center py-8 border rounded-md bg-yellow-50 text-yellow-700">
          <p className="font-medium">Missing required data</p>
          <p className="text-sm mt-1">
            {teachers.length === 0 ? "Please add teachers first. " : ""}
            {disciplines.length === 0 ? "Please add disciplines first." : ""}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="teacherSelect">
                Teacher <span className="text-red-500">*</span>
              </Label>
              <Select
                value={newAssignment.teacherId || ""}
                onValueChange={(value) => {
                  setNewAssignment((prev) => ({ ...prev, teacherId: value }))
                  if (errors.teacherId) {
                    setErrors((prev) => ({ ...prev, teacherId: "" }))
                  }
                }}
              >
                <SelectTrigger id="teacherSelect" className={errors.teacherId ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select a teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name} ({teacher.department})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.teacherId && <p className="text-red-500 text-xs mt-1">{errors.teacherId}</p>}
            </div>

            <div>
              <Label htmlFor="disciplineSelect">
                Discipline <span className="text-red-500">*</span>
              </Label>
              <Select
                value={newAssignment.disciplineId || ""}
                onValueChange={(value) => {
                  setNewAssignment((prev) => ({ ...prev, disciplineId: value }))
                  if (errors.disciplineId) {
                    setErrors((prev) => ({ ...prev, disciplineId: "" }))
                  }
                }}
              >
                <SelectTrigger id="disciplineSelect" className={errors.disciplineId ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select a discipline" />
                </SelectTrigger>
                <SelectContent>
                  {disciplines.map((discipline) => (
                    <SelectItem key={discipline.id} value={discipline.id}>
                      {discipline.name} ({discipline.code}) - Semester {discipline.semester}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.disciplineId && <p className="text-red-500 text-xs mt-1">{errors.disciplineId}</p>}
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleAddAssignment} className="bg-blue-700 hover:bg-blue-800">
              <Plus className="h-4 w-4 mr-2" /> Add Assignment
            </Button>
          </div>

          {assignments.length > 0 ? (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Discipline</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell>{getTeacherName(assignment.teacherId)}</TableCell>
                      <TableCell>{getDisciplineName(assignment.disciplineId)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveAssignment(assignment.id)}
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
              <p className="text-gray-500">No assignments added yet</p>
              <p className="text-sm text-gray-400 mt-1">Assign teachers to disciplines using the form above</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
