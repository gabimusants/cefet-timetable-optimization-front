import { type NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: NextRequest) {
  try {
    const jsonData = await request.json();
    if (!jsonData) {
      return NextResponse.json(
        { error: "Dados inválidos. Campos obrigatórios ausentes." },
        { status: 400 }
      );
    }

    const pythonBackendUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

    const response = await axios.post(
      `${pythonBackendUrl}/generate-timetable`,
      jsonData,
      {
        timeout: 30 * 60 * 1000,
      }
    );

    return NextResponse.json({
      success: true,
      timetable: response.data,
      inputData: jsonData,
    });
  } catch (error: any) {
    console.error("Error processing timetable generation:", error);

    if (error.code === "ECONNABORTED") {
      return NextResponse.json(
        {
          error:
            "Tempo limite de conexão excedido. O servidor demorou demais para responder.",
        },
        { status: 504 }
      );
    }

    if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
      return NextResponse.json(
        {
          error:
            "Não foi possível conectar ao backend. Verifique se ele está rodando.",
        },
        { status: 503 }
      );
    }

    if (error.response) {
      return NextResponse.json(
        {
          error:
            error.response.data?.error || "Falha no backend ao gerar horário.",
        },
        { status: error.response.status || 500 }
      );
    }

    return NextResponse.json(
      { error: "Ocorreu um erro inesperado ao gerar o horário." },
      { status: 500 }
    );
  }
}
