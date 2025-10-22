"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import TimetableView from "@/components/timetable-view"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Download, AlertCircle, RefreshCw, FileText } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { generateTimetablePDF } from "@/lib/pdf-generator"

export default function ResultsPage() {
  const [loading, setLoading] = useState(true)
  const [timetable, setTimetable] = useState(null)
  const [inputData, setInputData] = useState(null)
  const [error, setError] = useState("")
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  useEffect(() => {
    const storedResult = localStorage.getItem("timetableResult")

    if (!storedResult) {
      setError("Nenhum dado de grade horária encontrado. Faça upload dos dados e gere uma grade horária primeiro.")
      setLoading(false)
      return
    }

    try {
      const result = JSON.parse(storedResult)

      if (result.success) {
        let actualTimetable = result.timetable

        if (actualTimetable && typeof actualTimetable === "object" && actualTimetable.timetable) {
          actualTimetable = actualTimetable.timetable
        }

        setTimetable(actualTimetable)
        setInputData(result.inputData)
      } else {
        setError(result.error || "Falha ao gerar grade horária")
      }
    } catch (err) {
      console.error("Erro ao analisar resultado armazenado:", err)
      setError("Falha ao analisar dados da grade horária")
    } finally {
      setLoading(false)
    }
  }, [])

  const downloadTimetable = () => {
    if (!timetable) return

    const dataStr = JSON.stringify(timetable, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    const exportFileDefaultName = "grade-horaria.json"

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  const downloadInputData = () => {
    if (!inputData) return

    const dataStr = JSON.stringify(inputData, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    const exportFileDefaultName = "dados-entrada.json"

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  const handlePDFExport = async () => {
    if (!timetable || !inputData) return

    setIsGeneratingPDF(true)
    try {
      await generateTimetablePDF(timetable, inputData)
    } catch (error) {
      console.error("Erro ao gerar PDF:", error)
      alert("Falha ao gerar PDF. Tente novamente.")
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative">
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url(/images/university-building.png)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-800/70 to-slate-900/85"></div>
        </div>

        <Card className="relative z-10 p-8 text-center bg-white/95 backdrop-blur-sm border-2 border-white/30 shadow-2xl">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-700" />
          <h2 className="text-2xl font-bold mb-2 text-gray-800">Processando Grade Horária</h2>
          <p className="text-gray-600 mb-4 font-medium">Carregando sua grade horária otimizada...</p>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url(/images/university-building.png)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-800/70 to-slate-900/85"></div>
        </div>

        <Card className="relative z-10 p-8 text-center max-w-md bg-white/95 backdrop-blur-sm border-2 border-white/30 shadow-2xl">
          <Alert variant="destructive" className="mb-4 border-red-300 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="font-semibold">Erro</AlertTitle>
            <AlertDescription className="font-medium">{error}</AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Link href="/upload">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 font-semibold">
                <RefreshCw className="mr-2 h-4 w-4" />
                Tentar Novamente
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full border-2 border-gray-300 hover:bg-gray-50 font-medium">
                Voltar ao Início
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url(/images/university-building.png)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-800/70 to-slate-900/85"></div>
      </div>

      <div className="container relative z-10 mx-auto px-4 py-8">
        <Card className="max-w-6xl mx-auto p-6 shadow-2xl bg-white/95 backdrop-blur-sm border-2 border-white/30">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-gray-800">Grade Horária Otimizada</h1>
          </div>

          <Tabs defaultValue="timetable" className="mb-8">
            <TabsContent value="timetable" className="pt-4">
              <TimetableView timetable={timetable} />
            </TabsContent>

            <TabsContent value="data" className="pt-4">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800">Resumo dos Dados de Entrada</h3>
                {inputData && (
                  <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-700">Semestres:</h4>
                      <p className="text-sm text-gray-600">{inputData.semesters?.join(", ")}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700">Dias Letivos:</h4>
                      <p className="text-sm text-gray-600">{inputData.class_days?.join(", ")}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700">Horários:</h4>
                      <p className="text-sm text-gray-600">{inputData.time_slots?.join(", ")}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700">Disciplinas: {inputData.courses?.length}</h4>
                      <ul className="text-sm text-gray-600 list-disc list-inside">
                        {inputData.courses?.slice(0, 5).map((course, index) => (
                          <li key={index}>
                            {course.code} (Prof. {course.professor}) - Semestre {course.semester}
                          </li>
                        ))}
                        {inputData.courses?.length > 5 && <li>...</li>}
                      </ul>
                    </div>
                    {inputData.professor_preferences && (
                      <div>
                        <h4 className="font-medium text-gray-700">Preferências dos Professores:</h4>
                        <ul className="text-sm text-gray-600 list-disc list-inside">
                          {inputData.professor_preferences.slice(0, 5).map((pref, index) => (
                            <li key={index}>
                              {pref.professor}: {pref.preferred_days.join(", ")}
                            </li>
                          ))}
                          {inputData.professor_preferences.length > 5 && <li>...</li>}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between">
            <Link href="/upload">
              <Button variant="outline" className="border-2 border-gray-300 hover:bg-gray-50 font-medium">
                Carregar Novos Dados
              </Button>
            </Link>

            <div className="space-x-2">
              <Button
                onClick={downloadInputData}
                variant="outline"
                className="border-2 border-gray-300 hover:bg-gray-50 font-medium"
              >
                <Download className="mr-2 h-4 w-4" /> Baixar Entrada
              </Button>
              <Button
                onClick={downloadTimetable}
                variant="outline"
                className="border-2 border-gray-300 hover:bg-gray-50 font-medium"
              >
                <Download className="mr-2 h-4 w-4" /> Baixar JSON
              </Button>
              <Button
                onClick={handlePDFExport}
                className="bg-red-600 hover:bg-red-700 font-semibold"
                disabled={isGeneratingPDF}
              >
                {isGeneratingPDF ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando PDF...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Exportar PDF
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
