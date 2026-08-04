import { API_URL } from "../config/api";

export interface ClassifyRequest {
  titulo: string
  texto: string
}

export interface ContentResponse {
  id: number
  titulo: string
  texto: string
  categoria: string
  probabilidad: number
  fecha: string
}

export async function classifyContent(
  request: ClassifyRequest,
  token: string
): Promise<ContentResponse> {

  const response = await fetch(`${API_URL}/api/contenido/clasificar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(request)
  })

  if (!response.ok) {
    throw new Error('No fue posible clasificar el contenido.')
  }

  return await response.json()
}