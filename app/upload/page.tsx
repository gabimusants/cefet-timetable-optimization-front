"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, FileJson, AlertCircle, CheckCircle2, ArrowRight, Loader2 } from "lucide-react"
import JsonUploader from "@/components/json-uploader"
import JsonPreview from "@/components/json-preview"
import { Textarea } from "@/components/ui/textarea"

export default function UploadPage() {
  const router = useRouter()
  const [jsonData, setJsonData] = useState(null)
  const [jsonString, setJsonString] = useState("")
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("upload")
  const [isGenerating, setIsGenerating] = useState(false)

  const handleFileUpload = (data) => {
    try {
      setJsonData(data)
      setJsonString(JSON.stringify(data, null, 2))
      setError("")
    } catch (err) {
      setError("Falha ao analisar o arquivo JSON. Verifique o formato do arquivo.")
    }
  }

  const handleJsonInput = (value) => {
    setJsonString(value)
    try {
      const parsed = JSON.parse(value)
      setJsonData(parsed)
      setError("")
    } catch (err) {
      setError("Formato JSON inválido")
    }
  }

  const validateJsonStructure = () => {
    if (!jsonData) return false

    const requiredProps = ["semesters", "class_days", "time_slots", "courses"]
    for (const prop of requiredProps) {
      if (!jsonData[prop]) {
        setError(`Propriedade obrigatória ausente: ${prop}`)
        return false
      }
    }

    if (!Array.isArray(jsonData.courses) || jsonData.courses.length === 0) {
      setError("A propriedade 'courses' deve ser um array não vazio")
      return false
    }

    for (const course of jsonData.courses) {
      const requiredCourseProps = ["code", "workload", "semester", "professor"]
      for (const prop of requiredCourseProps) {
        if (!course[prop]) {
          setError(`Disciplina "${course.code || "Desconhecida"}" está faltando a propriedade obrigatória: ${prop}`)
          return false
        }
      }
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validateJsonStructure()) {
      return
    }

    setIsGenerating(true)
    setError("")

    try {
      const response = await fetch("/api/generate-timetable", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jsonData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Falha ao gerar grade horária")
      }


      localStorage.setItem("timetableResult", JSON.stringify(result))
      router.push("/results")
    } catch (error) {
      console.error("Erro ao gerar grade horária:", error)
      setError(error.message || "Falha ao gerar grade horária. Tente novamente.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
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
        <Card className="max-w-4xl mx-auto shadow-2xl bg-white/95 backdrop-blur-sm border-2 border-white/30">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
            <CardTitle className="text-2xl font-bold">Importar Dados da Grade Horária</CardTitle>
            <CardDescription className="text-blue-100">
              Faça o upload de um arquivo JSON contendo os dados das disciplinas da sua instituição ou insira o conteúdo
              JSON diretamente
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-3 bg-gray-100">
                <TabsTrigger value="upload" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload de Arquivo
                </TabsTrigger>
                <TabsTrigger value="paste" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  <FileJson className="mr-2 h-4 w-4" />
                  Colar JSON
                </TabsTrigger>
                <TabsTrigger
                  value="preview"
                  disabled={!jsonData}
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  Visualizar Dados
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="space-y-4">
                <JsonUploader onUpload={handleFileUpload} />

                {error && (
                  <Alert variant="destructive" className="border-red-300 bg-red-50">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle className="font-semibold">Erro</AlertTitle>
                    <AlertDescription className="font-medium">{error}</AlertDescription>
                  </Alert>
                )}

                {jsonData && !error && (
                  <Alert className="bg-green-50 text-green-800 border-green-300">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertTitle className="font-semibold">Sucesso</AlertTitle>
                    <AlertDescription className="font-medium">
                      Arquivo JSON carregado com sucesso. Clique em "Visualizar Dados" para revisar o conteúdo.
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              <TabsContent value="paste" className="space-y-4">
                <div className="space-y-2">
                  <Textarea
                    placeholder="Cole seus dados JSON aqui..."
                    className="min-h-[300px] font-mono text-sm border-2 border-gray-300 focus:border-blue-500"
                    value={jsonString}
                    onChange={(e) => handleJsonInput(e.target.value)}
                  />
                </div>

                {error && (
                  <Alert variant="destructive" className="border-red-300 bg-red-50">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle className="font-semibold">Erro</AlertTitle>
                    <AlertDescription className="font-medium">{error}</AlertDescription>
                  </Alert>
                )}

                {jsonData && !error && (
                  <Alert className="bg-green-50 text-green-800 border-green-300">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertTitle className="font-semibold">Sucesso</AlertTitle>
                    <AlertDescription className="font-medium">
                      Dados JSON analisados com sucesso. Clique em "Visualizar Dados" para revisar o conteúdo.
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              <TabsContent value="preview" className="space-y-4">
                {jsonData && <JsonPreview data={jsonData} />}
              </TabsContent>
            </Tabs>

            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={() => router.push("/")}
                disabled={isGenerating}
                className="border-2 border-gray-300 hover:bg-gray-50"
              >
                Voltar ao Início
              </Button>

              <Button
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700 border-2 border-blue-400 font-semibold"
                disabled={!jsonData || !!error || isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando Grade Horária...
                  </>
                ) : (
                  <>
                    Gerar Grade Horária <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
