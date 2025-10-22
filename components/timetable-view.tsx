"use client"

import { useState, useMemo, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface TimetableClass {
  time?: string
  horario?: string
  course?: string
  discipline?: string
  disciplina?: string
  code?: string
  codigo?: string
  teacher?: string
  professor?: string
  room?: string
  sala?: string
  semester?: number
  periodo?: number
}

interface TimetableData {
  [key: string]: TimetableClass[] | any
}

interface TimetableViewProps {
  timetable: TimetableData | null
}

export default function TimetableView({ timetable }: TimetableData | TimetableData) {
  const [selectedSemester, setSelectedSemester] = useState<string>("")

  const dayMapping = {
    monday: "Segunda",
    tuesday: "Terça",
    wednesday: "Quarta",
    thursday: "Quinta",
    friday: "Sexta",
    segunda: "Segunda",
    terca: "Terça",
    quarta: "Quarta",
    quinta: "Quinta",
    sexta: "Sexta",
  }

  const availableDays = timetable
    ? Object.keys(timetable).filter((key) => Array.isArray(timetable[key]) && timetable[key].length > 0)
    : []

  const timeSlots = useMemo(() => {
    if (!timetable) return []

    const allTimeSlots = new Set<string>()

    availableDays.forEach((day) => {
      if (Array.isArray(timetable[day])) {
        timetable[day].forEach((classInfo: TimetableClass) => {
          const time = classInfo.time || classInfo.horario
          if (time) {
            allTimeSlots.add(time)
          }
        })
      }
    })

    return Array.from(allTimeSlots).sort((a, b) => {
      const getHour = (timeSlot: string) => {
        const match = timeSlot.match(/(\d{1,2})/)
        return match ? Number.parseInt(match[1]) : 0
      }

      return getHour(a) - getHour(b)
    })
  }, [timetable, availableDays])

  const getDisciplineColor = (discipline: string) => {
    const colors = [
      "bg-blue-100 text-blue-800 border-blue-200",
      "bg-green-100 text-green-800 border-green-200",
      "bg-purple-100 text-purple-800 border-purple-200",
      "bg-yellow-100 text-yellow-800 border-yellow-200",
      "bg-pink-100 text-pink-800 border-pink-200",
      "bg-indigo-100 text-indigo-800 border-indigo-200",
      "bg-red-100 text-red-800 border-red-200",
      "bg-orange-100 text-orange-800 border-orange-200",
      "bg-teal-100 text-teal-800 border-teal-200",
      "bg-cyan-100 text-cyan-800 border-cyan-200",
      "bg-emerald-100 text-emerald-800 border-emerald-200",
      "bg-violet-100 text-violet-800 border-violet-200",
      "bg-amber-100 text-amber-800 border-amber-200",
      "bg-rose-100 text-rose-800 border-rose-200",
      "bg-lime-100 text-lime-800 border-lime-200",
    ]

    let hash = 0
    for (let i = 0; i < discipline.length; i++) {
      hash = discipline.charCodeAt(i) + ((hash << 5) - hash)
    }

    return colors[Math.abs(hash) % colors.length]
  }

  const normalizeClass = (classInfo: TimetableClass) => {
    return {
      time: classInfo.time || classInfo.horario || "",
      discipline:
        classInfo.course || classInfo.discipline || classInfo.disciplina || classInfo.code || classInfo.codigo || "",
      teacher: classInfo.teacher || classInfo.professor || "",
      room: classInfo.room || classInfo.sala || "",
      semester: classInfo.semester || classInfo.periodo,
    }
  }

  const filterClasses = (classes: TimetableClass[]) => {
    return classes.filter((classInfo) => {
      const normalized = normalizeClass(classInfo)
      return normalized.semester?.toString() === selectedSemester
    })
  }

  const getDayDisplayName = (day: string) => {
    const lowerDay = day.toLowerCase()
    return dayMapping[lowerDay as keyof typeof dayMapping] || day
  }

  const availableSemesters = useMemo(() => {
    if (!timetable) return []

    const semesters = new Set<number>()

    availableDays.forEach((day) => {
      if (Array.isArray(timetable[day])) {
        timetable[day].forEach((classInfo: TimetableClass) => {
          if (classInfo.semester !== undefined) {
            semesters.add(classInfo.semester)
          } else if (classInfo.periodo !== undefined) {
            semesters.add(classInfo.periodo)
          }
        })
      }
    })

    return Array.from(semesters).sort((a, b) => a - b)
  }, [timetable, availableDays])

  useEffect(() => {
    if (availableSemesters.length > 0 && selectedSemester === "") {
      setSelectedSemester(availableSemesters[0].toString())
    }
  }, [availableSemesters, selectedSemester])

  if (!timetable || availableDays.length === 0) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8 border rounded-md bg-gray-50">
          <p className="text-gray-500">Nenhum dado de grade horária disponível</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Horário Semanal</h2>
          <p className="text-sm text-gray-500">Cronograma otimizado para todas as disciplinas</p>
        </div>

        <div className="w-full md:w-64">
          <Label htmlFor="semesterFilter">Filtrar por Período</Label>
          <Select value={selectedSemester} onValueChange={setSelectedSemester}>
            <SelectTrigger id="semesterFilter">
              <SelectValue placeholder="Todos os Períodos" />
            </SelectTrigger>
            <SelectContent>
              {availableSemesters.map((semester) => (
                <SelectItem key={semester} value={semester.toString()}>
                  Período {semester}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="weekly" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="weekly">Visão Semanal</TabsTrigger>
          <TabsTrigger value="daily">Visão Diária</TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="pt-4">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[800px]">
              <thead>
                <tr>
                  <th className="border p-2 bg-gray-50 font-medium">Horário</th>
                  {availableDays.map((day) => (
                    <th key={day} className="border p-2 bg-gray-50 font-medium">
                      {getDayDisplayName(day)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((timeSlot) => (
                  <tr key={timeSlot}>
                    <td className="border p-2 font-medium text-sm bg-gray-50">{timeSlot}</td>
                    {availableDays.map((day) => {
                      const dayClasses = filterClasses(timetable[day] || [])
                      const classInfo = dayClasses.find((c) => {
                        const normalized = normalizeClass(c)
                        return normalized.time === timeSlot
                      })

                      return (
                        <td key={`${day}-${timeSlot}`} className="border p-2">
                          {classInfo ? (
                            <div className="space-y-1 w-40">
                              <div className={`text-sm font-medium`}>
                                <Badge
                                  variant="outline"
                                  className={getDisciplineColor(normalizeClass(classInfo).discipline)}
                                >
                                  {normalizeClass(classInfo).discipline}
                                </Badge>
                              </div>
                              {normalizeClass(classInfo).teacher && (
                                <div className="text-xs text-gray-600">{normalizeClass(classInfo).teacher}</div>
                              )}
                            </div>
                          ) : (
                            <div className="text-xs text-gray-400 italic">Sem aula</div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="daily" className="pt-4">
          <Tabs defaultValue={availableDays[0]} className="w-full">
            <TabsList
              className={`grid w-full ${
                availableDays.length === 1
                  ? "grid-cols-1"
                  : availableDays.length === 2
                    ? "grid-cols-2"
                    : availableDays.length === 3
                      ? "grid-cols-3"
                      : availableDays.length === 4
                        ? "grid-cols-4"
                        : "grid-cols-5"
              }`}
            >
              {availableDays.slice(0, 5).map((day) => (
                <TabsTrigger key={day} value={day}>
                  {getDayDisplayName(day)}
                </TabsTrigger>
              ))}
            </TabsList>

            {availableDays.map((day) => (
              <TabsContent key={day} value={day} className="pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{getDayDisplayName(day)}</CardTitle>
                    <CardDescription>Cronograma diário para {getDayDisplayName(day)}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {filterClasses(timetable[day] || []).length > 0 ? (
                        timeSlots.map((timeSlot) => {
                          const dayClasses = filterClasses(timetable[day] || [])
                          const classInfo = dayClasses.find((c) => {
                            const normalized = normalizeClass(c)
                            return normalized.time === timeSlot
                          })

                          return (
                            <div key={timeSlot} className="flex border-b pb-3">
                              <div className="w-32 font-medium text-sm">{timeSlot}</div>
                              <div className="flex-1">
                                {classInfo ? (
                                  <div className="space-y-1">
                                    <div className="font-medium">
                                      <Badge
                                        variant="outline"
                                        className={getDisciplineColor(normalizeClass(classInfo).discipline)}
                                      >
                                        {normalizeClass(classInfo).discipline}
                                      </Badge>
                                    </div>
                                    {normalizeClass(classInfo).teacher && (
                                      <div className="text-sm text-gray-600">
                                        Professor: {normalizeClass(classInfo).teacher}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="text-sm text-gray-400 italic">Sem aula</div>
                                )}
                              </div>
                            </div>
                          )
                        })
                      ) : (
                        <div className="text-center py-8 text-gray-500">Sem aulas agendadas para este dia</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  )
}
