"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Plus, HelpCircle, ArrowRight } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Discipline {
  id: string
  name: string
  code: string
  semester: number
}

interface Prerequisite {
  id: string
  disciplineId: string
  prerequisiteId: string
}

interface PrerequisitesFormProps {
  disciplines: Discipline[]
  data: Prerequisite[]
  updateData: (data: Prerequisite[]) => void
}

export default function PrerequisitesForm({ disciplines, data, updateData }: PrerequisitesFormProps) {
  const [prerequisites, setPrerequisites] = useState<Prerequisite[]>(data || [])
  const [newPrerequisite, setNewPrerequisite] = useState<Partial<Prerequisite>>({
    disciplineId: "",
    prerequisiteId: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validatePrerequisite = () => {
    const newErrors: Record<string, string> = {}

    if (!newPrerequisite.disciplineId) {
      newErrors.disciplineId = "Discipline is required"
    }

    if (!newPrerequisite.prerequisiteId) {
      newErrors.prerequisiteId = "Prerequisite discipline is required"
    } else if (newPrerequisite.disciplineId === newPrerequisite.prerequisiteId) {
      newErrors.prerequisiteId = "A discipline cannot be a prerequisite for itself"
    } else if (
      prerequisites.some(
        (p) => p.disciplineId === newPrerequisite.disciplineId && p.prerequisiteId === newPrerequisite.prerequisiteId,
      )
    ) {
      newErrors.prerequisiteId = "This prerequisite relationship already exists"
    } else {
      const discipline = disciplines.find((d) => d.id === newPrerequisite.disciplineId)
      const prerequisite = disciplines.find((d) => d.id === newPrerequisite.prerequisiteId)

      if (discipline && prerequisite && discipline.semester <= prerequisite.semester) {
        newErrors.prerequisiteId = "A prerequisite must be from an earlier semester"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAddPrerequisite = () => {
    if (!validatePrerequisite()) return

    const updatedPrerequisites = [
      ...prerequisites,
      {
        ...newPrerequisite,
        id: Date.now().toString(),
      } as Prerequisite,
    ]

    setPrerequisites(updatedPrerequisites)
    updateData(updatedPrerequisites)
    setNewPrerequisite({ disciplineId: "", prerequisiteId: "" })
    setErrors({})
  }

  const handleRemovePrerequisite = (id: string) => {
    const updatedPrerequisites = prerequisites.filter((prerequisite) => prerequisite.id !== id)
    setPrerequisites(updatedPrerequisites)
    updateData(updatedPrerequisites)
  }

  const getDisciplineName = (disciplineId: string) => {
    const discipline = disciplines.find((d) => d.id === disciplineId)
    return discipline ? `${discipline.name} (${discipline.code})` : "Unknown Discipline"
  }

  const getAvailablePrerequisites = (disciplineId: string) => {
    const discipline = disciplines.find((d) => d.id === disciplineId)
    if (!discipline) return []

    return disciplines.filter((d) => d.semester < discipline.semester)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Discipline Prerequisites</h2>
          <p className="text-sm text-gray-500 mt-1">Define which disciplines are prerequisites for others</p>
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
                Define prerequisite relationships between disciplines. A prerequisite must be from an earlier semester
                than the discipline that requires it.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {disciplines.length === 0 ? (
        <div className="text-center py-8 border rounded-md bg-yellow-50 text-yellow-700">
          <p className="font-medium">Missing required data</p>
          <p className="text-sm mt-1">Please add disciplines first before defining prerequisites.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="disciplineSelect">
                Discipline <span className="text-red-500">*</span>
              </Label>
              <Select
                value={newPrerequisite.disciplineId || ""}
                onValueChange={(value) => {
                  setNewPrerequisite((prev) => ({
                    ...prev,
                    disciplineId: value,
                    prerequisiteId:
                      prev.prerequisiteId && getAvailablePrerequisites(value).some((d) => d.id === prev.prerequisiteId)
                        ? prev.prerequisiteId
                        : "",
                  }))
                  if (errors.disciplineId) {
                    setErrors((prev) => ({ ...prev, disciplineId: "" }))
                  }
                }}
              >
                <SelectTrigger id="disciplineSelect" className={errors.disciplineId ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select a discipline" />
                </SelectTrigger>
                <SelectContent>
                  {disciplines
                    .filter((d) => d.semester > 1)
                    .map((discipline) => (
                      <SelectItem key={discipline.id} value={discipline.id}>
                        {discipline.name} ({discipline.code}) - Semester {discipline.semester}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {errors.disciplineId && <p className="text-red-500 text-xs mt-1">{errors.disciplineId}</p>}
            </div>

            <div>
              <Label htmlFor="prerequisiteSelect">
                Prerequisite Discipline <span className="text-red-500">*</span>
              </Label>
              <Select
                value={newPrerequisite.prerequisiteId || ""}
                onValueChange={(value) => {
                  setNewPrerequisite((prev) => ({ ...prev, prerequisiteId: value }))
                  if (errors.prerequisiteId) {
                    setErrors((prev) => ({ ...prev, prerequisiteId: "" }))
                  }
                }}
                disabled={!newPrerequisite.disciplineId}
              >
                <SelectTrigger id="prerequisiteSelect" className={errors.prerequisiteId ? "border-red-500" : ""}>
                  <SelectValue
                    placeholder={newPrerequisite.disciplineId ? "Select a prerequisite" : "Select a discipline first"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {newPrerequisite.disciplineId &&
                    getAvailablePrerequisites(newPrerequisite.disciplineId).map((discipline) => (
                      <SelectItem key={discipline.id} value={discipline.id}>
                        {discipline.name} ({discipline.code}) - Semester {discipline.semester}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {errors.prerequisiteId && <p className="text-red-500 text-xs mt-1">{errors.prerequisiteId}</p>}
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleAddPrerequisite}
              className="bg-blue-700 hover:bg-blue-800"
              disabled={!newPrerequisite.disciplineId || !newPrerequisite.prerequisiteId}
            >
              <Plus className="h-4 w-4 mr-2" /> Add Prerequisite
            </Button>
          </div>

          {prerequisites.length > 0 ? (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Prerequisite</TableHead>
                    <TableHead className="w-[50px] text-center"></TableHead>
                    <TableHead>Discipline</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prerequisites.map((prerequisite) => (
                    <TableRow key={prerequisite.id}>
                      <TableCell>{getDisciplineName(prerequisite.prerequisiteId)}</TableCell>
                      <TableCell className="text-center">
                        <ArrowRight className="h-4 w-4 mx-auto text-gray-500" />
                      </TableCell>
                      <TableCell>{getDisciplineName(prerequisite.disciplineId)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemovePrerequisite(prerequisite.id)}
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
              <p className="text-gray-500">No prerequisites defined yet</p>
              <p className="text-sm text-gray-400 mt-1">Define prerequisite relationships using the form above</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
