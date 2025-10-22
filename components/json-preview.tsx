"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface JsonPreviewProps {
  data: any
}

export default function JsonPreview({ data }: JsonPreviewProps) {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <Card>
      <CardContent className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="disciplines">Disciplinas</TabsTrigger>
            <TabsTrigger value="preferences">Preferências</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h3 className="font-medium">Semestres</h3>
                <div className="flex flex-wrap gap-1">
                  {data.semesters?.map((semester: string, index: number) => (
                    <Badge key={index} variant="outline">
                      {semester}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Dias Letivos</h3>
                <div className="flex flex-wrap gap-1">
                  {data.class_days?.map((day: string, index: number) => (
                    <Badge key={index} variant="outline">
                      {day}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Horários</h3>
                <div className="flex flex-wrap gap-1">
                  {data.time_slots?.map((slot: string, index: number) => (
                    <Badge key={index} variant="outline">
                      {slot}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Resumo</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>
                  <span className="font-medium">Total de Disciplinas:</span> {data.courses?.length || 0}
                </li>
                <li>
                  <span className="font-medium">Total de Professores:</span>{" "}
                  {new Set(data.courses?.map((d: any) => d.professor)).size || 0}
                </li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="disciplines">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Professor</TableHead>
                    <TableHead>Semestre</TableHead>
                    <TableHead>Carga Horária</TableHead>
                    <TableHead>Reprovação</TableHead>
                    <TableHead>Requisitos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.courses?.map((course: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{course.code}</TableCell>
                      <TableCell>{course.professor}</TableCell>
                      <TableCell>{course.semester}</TableCell>
                      <TableCell>{course.workload}</TableCell>
                      <TableCell>
                        {course.failure_rate !== undefined ? `${(course.failure_rate * 100).toFixed(0)}%` : "N/A"}
                      </TableCell>
                      <TableCell>
                        {course.prerequisites?.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {course.prerequisites.map((req: string, reqIndex: number) => (
                              <Badge key={reqIndex} variant="outline" className="bg-blue-50">
                                {req}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          "Nenhum"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="preferences">
            {data.professor_preferences && data.professor_preferences.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Professor</TableHead>
                      <TableHead>Dias Preferidos</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.professor_preferences.map((preference: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{preference.professor}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {preference.preferred_days.map((day: string, dayIndex: number) => (
                              <Badge key={dayIndex} variant="outline" className="bg-green-50">
                                {day}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Nenhuma preferência de professor definida nos dados carregados
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
