import { API_URL } from "../config/api"

export interface ClassificationRequest {
  titulo: string
  texto: string
}

export interface ClassificationResponse {
  id: number
  titulo: string
  texto: string
  categoria: string
  probabilidad: number
  fecha: string
}

export class ContentServiceError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = "ContentServiceError"
  }
}

export async function classifyContent(
  request: ClassificationRequest,
  token?: string,
): Promise<ClassificationResponse> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}/api/contenido/clasificar`, {
    method: "POST",
    headers,
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    let detail = response.statusText

    try {
      const errorBody = await response.json() as { message?: string }
      detail = errorBody.message ?? detail
    } catch {
      // La respuesta de error puede no contener JSON.
    }

    throw new ContentServiceError(
      response.status,
      detail || "No fue posible clasificar el contenido.",
    )
  }

  return await response.json() as ClassificationResponse
}
