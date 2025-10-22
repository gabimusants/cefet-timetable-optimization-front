"use client"
import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, File, CheckCircle2, Download } from "lucide-react"

interface JsonUploaderProps {
  onUpload: (data: any) => void
}

export default function JsonUploader({ onUpload }: JsonUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState("")
  const [isUploaded, setIsUploaded] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      processFile(file)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      processFile(file)
    }
  }

  const processFile = (file: File) => {
    if (file.type !== "application/json" && !file.name.endsWith(".json")) {
      alert("Por favor, faça upload de um arquivo JSON")
      return
    }

    setFileName(file.name)

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string)
        onUpload(json)
        setIsUploaded(true)
      } catch (error) {
        alert("Arquivo JSON inválido")
        setFileName("")
        setIsUploaded(false)
      }
    }
    reader.readAsText(file)
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const downloadSampleJson = () => {
    const sampleData = {
      semesters: ["1", "2", "3", "4", "5", "6", "7", "8"],
      class_days: ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"],
      time_slots: [
        "07h00-07h50",
        "07h50-08h40",
        "08h40-09h30",
        "09h50-10h40",
        "10h40-11h30",
        "11h30-12h20",
        "13h30-14h20",
        "14h20-15h10",
        "15h10-16h00",
        "16h20-17h10",
        "17h10-18h00",
      ],
      professor_preferences: [
        {
          professor: "Rafael Saraiva",
          preferred_days: ["Segunda", "Quarta", "Quinta"],
        },
        {
          professor: "Felipe Mondaini",
          preferred_days: ["Terça", "Quinta", "Sexta"],
        },
        {
          professor: "Maria Silva",
          preferred_days: ["Segunda", "Terça", "Quarta"],
        },
      ],
      courses: [
        {
          code: "Introdução a Ciência da Computação",
          workload: 2,
          semester: 1,
          professor: "Coordenador Geral",
          prerequisites: [],
          failure_rate: 0.05,
          type: "obrigatoria",
        },
        {
          code: "Geometria Analítica",
          workload: 4,
          semester: 1,
          professor: "João Oliveira",
          prerequisites: [],
          failure_rate: 0.25,
          type: "obrigatoria",
        },
        {
          code: "Pré-Cálculo",
          workload: 4,
          semester: 1,
          professor: "João Oliveira",
          prerequisites: [],
          failure_rate: 0.35,
          type: "obrigatoria",
        },
        {
          code: "Cálculo a uma Variável",
          workload: 6,
          semester: 2,
          professor: "Rafael Saraiva",
          prerequisites: ["Geometria Analítica", "Pré-Cálculo"],
          failure_rate: 0.65,
          type: "obrigatoria",
        },
        {
          code: "Mecânica Clássica",
          workload: 4,
          semester: 2,
          professor: "Ana Costa",
          prerequisites: ["Pré-Cálculo"],
          failure_rate: 0.45,
          type: "obrigatoria",
        },
        {
          code: "Termodinâmica",
          workload: 4,
          semester: 3,
          professor: "Felipe Mondaini",
          prerequisites: ["Cálculo a uma Variável", "Mecânica Clássica"],
          failure_rate: 0.55,
          type: "obrigatoria",
        },
        {
          code: "Cálculo a Várias Variáveis",
          workload: 6,
          semester: 3,
          professor: "Rafael Saraiva",
          prerequisites: ["Cálculo a uma Variável"],
          failure_rate: 0.7,
          type: "obrigatoria",
        },
        {
          code: "Álgebra Linear",
          workload: 4,
          semester: 3,
          professor: "Maria Silva",
          prerequisites: ["Geometria Analítica"],
          failure_rate: 0.4,
          type: "obrigatoria",
        },
      ],
    }

    const dataStr = JSON.stringify(sampleData, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)
    const exportFileDefaultName = "exemplo-dados-grade-horaria.json"

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  return (
    <div className="space-y-4">
      <Card
        className={`border-2 border-dashed p-6 text-center transition-all duration-200 ${
          isDragging ? "border-blue-500 bg-blue-50 shadow-lg" : "border-gray-300 hover:border-gray-400"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json,application/json"
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center py-4">
          {isUploaded ? (
            <>
              <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
              <p className="text-lg font-medium text-green-600">Arquivo carregado com sucesso!</p>
              <p className="text-sm text-gray-500 mt-2 font-medium">{fileName}</p>
            </>
          ) : (
            <>
              <Upload className="h-12 w-12 text-blue-500 mb-4" />
              <p className="text-lg font-medium text-gray-700">Arraste e solte seu arquivo JSON aqui</p>
              <p className="text-sm text-gray-500 mt-2">ou</p>
            </>
          )}

          <div className="flex gap-2 mt-4">
            <Button
              type="button"
              variant={isUploaded ? "outline" : "default"}
              onClick={handleButtonClick}
              className="font-medium"
            >
              {isUploaded ? (
                <>
                  <File className="mr-2 h-4 w-4" /> Escolher Outro Arquivo
                </>
              ) : (
                <>
                  <File className="mr-2 h-4 w-4" /> Procurar Arquivos
                </>
              )}
            </Button>

            <Button type="button" variant="outline" onClick={downloadSampleJson} className="font-medium">
              <Download className="mr-2 h-4 w-4" /> Baixar Exemplo
            </Button>
          </div>
        </div>
      </Card>

      <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg border">
        <p className="font-medium mb-2">Formato esperado pelo backend:</p>
        <ul className="list-disc list-inside ml-2 mt-1 space-y-1">
          <li>
            <strong>semesters:</strong> Array de strings (["1", "2", "3", ...])
          </li>
          <li>
            <strong>class_days:</strong> Array de strings com dias da semana
          </li>
          <li>
            <strong>time_slots:</strong> Array de strings com horários (ex: "07h00-07h50")
          </li>
          <li>
            <strong>courses:</strong> Array de objetos com code, workload (int), semester (int), professor,
            prerequisites (array), failure_rate (float), type
          </li>
          <li>
            <strong>professor_preferences:</strong> Array de objetos com professor e preferred_days
          </li>
        </ul>
      </div>
    </div>
  )
}
