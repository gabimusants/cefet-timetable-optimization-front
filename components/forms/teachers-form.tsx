"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

interface TeachersFormProps {
  data: Teacher[]
  updateData: (data: Teacher[]) => void
}

export default function TeachersForm({ data, updateData }: TeachersFormProps) {
  const [teachers, setTeachers] = useState<Teacher[]>(data || [])
  const [newTeacher, setNewTeacher] = useState<Partial<Teacher>>({
    name: "",
    email: "",
    department: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateTeacher = () => {
    const newErrors: Record<string, string> = {}

    if (!newTeacher.name?.trim()) {
      newErrors.name = "Teacher name is required"
    }

    if (!newTeacher.email?.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^\S+@\S+\.\S+$/.test(newTeacher.email)) {
      newErrors.email = "Please enter a valid email"
    }

    if (!newTeacher.department?.trim()) {
      newErrors.department = "Department is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAddTeacher = () => {
    if (!validateTeacher()) return

    const updatedTeachers = [
      ...teachers,
      {
        ...newTeacher,
        id: Date.now().toString(),
      } as Teacher,
    ]

    setTeachers(updatedTeachers)
    updateData(updatedTeachers)
    setNewTeacher({ name: "", email: "", department: "" })
    setErrors({})
  }

  const handleRemoveTeacher = (id: string) => {
    const updatedTeachers = teachers.filter((teacher) => teacher.id !== id)
    setTeachers(updatedTeachers)
    updateData(updatedTeachers)
  }

  const handleInputChange = (field: keyof Teacher, value: string) => {
    setNewTeacher((prev) => ({
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
          <h2 className="text-xl font-semibold">Teachers Information</h2>
          <p className="text-sm text-gray-500 mt-1">Add all teachers who will be teaching courses</p>
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
                Add all professors and instructors who will be teaching courses. This information will be used to assign
                teachers to disciplines.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="teacherName">
            Teacher Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="teacherName"
            placeholder="John Smith"
            value={newTeacher.name || ""}
            onChange={(e) => handleInputChange("name", e.target.value)}
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        <div>
          <Label htmlFor="teacherEmail">
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="teacherEmail"
            placeholder="john.smith@university.edu"
            value={newTeacher.email || ""}
            onChange={(e) => handleInputChange("email", e.target.value)}
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>

        <div>
          <Label htmlFor="teacherDepartment">
            Department <span className="text-red-500">*</span>
          </Label>
          <Input
            id="teacherDepartment"
            placeholder="Computer Science"
            value={newTeacher.department || ""}
            onChange={(e) => handleInputChange("department", e.target.value)}
            className={errors.department ? "border-red-500" : ""}
          />
          {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleAddTeacher} className="bg-blue-700 hover:bg-blue-800">
          <Plus className="h-4 w-4 mr-2" /> Add Teacher
        </Button>
      </div>

      {teachers.length > 0 ? (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teachers.map((teacher) => (
                <TableRow key={teacher.id}>
                  <TableCell>{teacher.name}</TableCell>
                  <TableCell>{teacher.email}</TableCell>
                  <TableCell>{teacher.department}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveTeacher(teacher.id)}
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
          <p className="text-gray-500">No teachers added yet</p>
          <p className="text-sm text-gray-400 mt-1">Add teachers using the form above</p>
        </div>
      )}
    </div>
  )
}
