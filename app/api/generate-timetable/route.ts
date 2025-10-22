import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const jsonData = await request.json()
    if (!jsonData) {
      return NextResponse.json({ error: "Dados inválidos. Campos obrigatórios ausentes." }, { status: 400 })
    }

    const pythonBackendUrl = process.env.PYTHON_BACKEND_URL || "http://localhost:8000"

    const response = await fetch(`${pythonBackendUrl}/generate-timetable`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jsonData),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error("Python backend error:", errorData)
      return NextResponse.json({error: "Falha ao gerar horário. Por favor, verifique seus dados e tente novamente."}, { status: response.status })
    }

    const timetableData = await response.json()

    return NextResponse.json({
      success: true,
      timetable: timetableData,
      inputData: jsonData,
    })
  } catch (error) {
    console.error("Error processing timetable generation:", error)

    if (error instanceof TypeError && error.message.includes("fetch")) {
      return NextResponse.json({ error: "Erro de conexão. Tente novamente." }, { status: 503 })
    }

    return NextResponse.json({ error: "Ocorreu um erro inesperado ao gerar o horário." }, { status: 500 })
  }
}
