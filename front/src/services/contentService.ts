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

export interface CategoriesResponse {
  categorias: string[]
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

function authorizationHeaders(token: string): Record<string, string> {
  return {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  }
}

async function readErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const errorBody = await response.json() as { message?: string }
    return errorBody.message ?? fallback
  } catch {
    return fallback
  }
}

export async function getAllContents(token: string): Promise<ClassificationResponse[]> {
  const response = await fetch(`${API_URL}/api/contenido`, {
    headers: authorizationHeaders(token),
  })

  if (!response.ok) {
    throw new ContentServiceError(
      response.status,
      await readErrorMessage(response, "No fue posible obtener los contenidos."),
    )
  }

  return await response.json() as ClassificationResponse[]
}

export async function getContentCategories(token: string): Promise<string[]> {
  const response = await fetch(`${API_URL}/api/contenido/categorias`, {
    headers: authorizationHeaders(token),
  })

  if (!response.ok) {
    throw new ContentServiceError(
      response.status,
      await readErrorMessage(response, "No fue posible obtener las categorías."),
    )
  }

  const data = await response.json() as CategoriesResponse
  return data.categorias
}

export async function getContentsByCategory(
  category: string,
  token: string,
): Promise<ClassificationResponse[]> {
  const search = new URLSearchParams({ categoria: category })
  const response = await fetch(`${API_URL}/api/contenido/buscar?${search}`, {
    headers: authorizationHeaders(token),
  })

  if (!response.ok) {
    throw new ContentServiceError(
      response.status,
      await readErrorMessage(response, "No fue posible filtrar los contenidos."),
    )
  }

  return await response.json() as ClassificationResponse[]
}
