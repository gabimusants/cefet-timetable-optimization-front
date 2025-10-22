"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

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

interface Prerequisite {
  id: string
  disciplineId: string
  prerequisiteId: string
}

interface FormData {
  teachers: Teacher[]
  disciplines: Discipline[]
  teacherDisciplines: TeacherDiscipline[]
  prerequisites: Prerequisite[]
  repprovalRates: Record<string, number>
  workloads: Record<string, number>
}

interface ReviewFormProps {
  formData: FormData
}

export default function ReviewForm({ formData }: ReviewFormProps) {
  const getTeacherName = (teacherId: string) => {
    const teacher = formData.teachers.find((t) => t.id === teacherId)
    return teacher ? teacher.name : "Unknown Teacher"
  }

  const getDisciplineName = (disciplineId: string) => {
    const discipline = formData.disciplines.find((d) => d.id === disciplineId)
    return discipline ? `${discipline.name} (${discipline.code})` : "Unknown Discipline"
  }

  const unassignedDisciplines = formData.disciplines.filter(
    (discipline) => !formData.teacherDisciplines.some((td) => td.disciplineId === discipline.id),
  )

  const disciplinesWithoutWorkload = formData.disciplines.filter(
    (discipline) => formData.workloads[discipline.id] === undefined,
  )

  const disciplinesWithoutRepprovalRate = formData.disciplines.filter(
    (discipline) => formData.repprovalRates[discipline.id] === undefined,
  )

  const hasIssues =
    unassignedDisciplines.length > 0 ||
    disciplinesWithoutWorkload.length > 0 ||
    disciplinesWithoutRepprovalRate.length > 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Review Your Data</h2>
        <p className="text-sm text-gray-500 mt-1">Please review all the information before generating the timetable</p>
      </div>

      {hasIssues && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            There are some issues with your data that might affect the quality of the generated timetable. Please review
            the warnings below.
          </AlertDescription>
        </Alert>
      )}

      {!hasIssues && (
        <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle>Ready to Generate</AlertTitle>
          <AlertDescription>
            All required data has been provided. You can now generate the optimized timetable.
          </AlertDescription>
        </Alert>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="teachers">
          <AccordionTrigger className="text-lg font-medium">Teachers ({formData.teachers.length})</AccordionTrigger>
          <AccordionContent>
            {formData.teachers.length > 0 ? (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Department</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formData.teachers.map((teacher) => (
                      <TableRow key={teacher.id}>
                        <TableCell>{teacher.name}</TableCell>
                        <TableCell>{teacher.email}</TableCell>
                        <TableCell>{teacher.department}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-4 border rounded-md bg-yellow-50 text-yellow-700">
                <p>No teachers added yet</p>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="disciplines">
          <AccordionTrigger className="text-lg font-medium">
            Disciplines ({formData.disciplines.length})
          </AccordionTrigger>
          <AccordionContent>
            {formData.disciplines.length > 0 ? (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Semester</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formData.disciplines.map((discipline) => (
                      <TableRow key={discipline.id}>
                        <TableCell>{discipline.name}</TableCell>
                        <TableCell>{discipline.code}</TableCell>
                        <TableCell>Semester {discipline.semester}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-4 border rounded-md bg-yellow-50 text-yellow-700">
                <p>No disciplines added yet</p>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="assignments">
          <AccordionTrigger className="text-lg font-medium">
            Teacher-Discipline Assignments ({formData.teacherDisciplines.length})
          </AccordionTrigger>
          <AccordionContent>
            {formData.teacherDisciplines.length > 0 ? (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Teacher</TableHead>
                      <TableHead>Discipline</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formData.teacherDisciplines.map((assignment) => (
                      <TableRow key={assignment.id}>
                        <TableCell>{getTeacherName(assignment.teacherId)}</TableCell>
                        <TableCell>{getDisciplineName(assignment.disciplineId)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-4 border rounded-md bg-yellow-50 text-yellow-700">
                <p>No teacher-discipline assignments added yet</p>
              </div>
            )}

            {unassignedDisciplines.length > 0 && (
              <div className="mt-4 p-3 border rounded-md bg-yellow-50 text-yellow-700">
                <p className="font-medium">Warning: Unassigned Disciplines</p>
                <p className="text-sm mt-1">The following disciplines have no teachers assigned:</p>
                <ul className="list-disc list-inside text-sm mt-1">
                  {unassignedDisciplines.map((discipline) => (
                    <li key={discipline.id}>
                      {discipline.name} ({discipline.code})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="prerequisites">
          <AccordionTrigger className="text-lg font-medium">
            Prerequisites ({formData.prerequisites.length})
          </AccordionTrigger>
          <AccordionContent>
            {formData.prerequisites.length > 0 ? (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Prerequisite</TableHead>
                      <TableHead>Required For</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formData.prerequisites.map((prerequisite) => (
                      <TableRow key={prerequisite.id}>
                        <TableCell>{getDisciplineName(prerequisite.prerequisiteId)}</TableCell>
                        <TableCell>{getDisciplineName(prerequisite.disciplineId)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-4 border rounded-md bg-gray-50 text-gray-500">
                <p>No prerequisites defined</p>
                <p className="text-sm text-gray-400 mt-1">
                  This is normal if your curriculum doesn't have prerequisite requirements
                </p>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="repprovalRates">
          <AccordionTrigger className="text-lg font-medium">Repproval Rates</AccordionTrigger>
          <AccordionContent>
            {Object.keys(formData.repprovalRates).length > 0 ? (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Discipline</TableHead>
                      <TableHead>Repproval Rate (%)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(formData.repprovalRates).map(([disciplineId, rate]) => (
                      <TableRow key={disciplineId}>
                        <TableCell>{getDisciplineName(disciplineId)}</TableCell>
                        <TableCell>{rate}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-4 border rounded-md bg-yellow-50 text-yellow-700">
                <p>No repproval rates defined</p>
              </div>
            )}

            {disciplinesWithoutRepprovalRate.length > 0 && (
              <div className="mt-4 p-3 border rounded-md bg-yellow-50 text-yellow-700">
                <p className="font-medium">Warning: Missing Repproval Rates</p>
                <p className="text-sm mt-1">The following disciplines have no repproval rates defined:</p>
                <ul className="list-disc list-inside text-sm mt-1">
                  {disciplinesWithoutRepprovalRate.map((discipline) => (
                    <li key={discipline.id}>
                      {discipline.name} ({discipline.code})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="workloads">
          <AccordionTrigger className="text-lg font-medium">Workloads</AccordionTrigger>
          <AccordionContent>
            {Object.keys(formData.workloads).length > 0 ? (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Discipline</TableHead>
                      <TableHead>Weekly Hours</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(formData.workloads).map(([disciplineId, hours]) => (
                      <TableRow key={disciplineId}>
                        <TableCell>{getDisciplineName(disciplineId)}</TableCell>
                        <TableCell>{hours} hours</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-4 border rounded-md bg-yellow-50 text-yellow-700">
                <p>No workloads defined</p>
              </div>
            )}

            {disciplinesWithoutWorkload.length > 0 && (
              <div className="mt-4 p-3 border rounded-md bg-yellow-50 text-yellow-700">
                <p className="font-medium">Warning: Missing Workloads</p>
                <p className="text-sm mt-1">The following disciplines have no workloads defined:</p>
                <ul className="list-disc list-inside text-sm mt-1">
                  {disciplinesWithoutWorkload.map((discipline) => (
                    <li key={discipline.id}>
                      {discipline.name} ({discipline.code})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
