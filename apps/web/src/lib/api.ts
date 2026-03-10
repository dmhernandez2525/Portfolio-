const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3001"

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  })

  let data: unknown
  try {
    data = await res.json()
  } catch {
    if (!res.ok) throw new Error(`Request failed with status ${res.status}`)
    throw new Error("Invalid response from server")
  }

  if (!res.ok) {
    const message = typeof data === "object" && data !== null && "error" in data
      ? String((data as { error: unknown }).error)
      : `Request failed with status ${res.status}`
    throw new Error(message)
  }

  return data as T
}

export interface ApiTimeSlot {
  startTime: string
  label: string
  available: boolean
}

export interface AvailabilityResponse {
  date: string
  meetingTypeId: string
  timezone: string
  slots: ApiTimeSlot[]
}

export interface BookingResponse {
  success: boolean
  bookingId: string
  meetLink: string | null
  message: string
}

export const api = {
  getAvailability(date: string, meetingTypeId: string, timezone: string) {
    const params = new URLSearchParams({ date, meetingTypeId, timezone })
    return request<AvailabilityResponse>(`/api/booking/availability?${params}`)
  },

  createBooking(data: {
    meetingTypeId: string
    date: string
    startTime: string
    timezone: string
    name: string
    email: string
    message?: string
  }) {
    return request<BookingResponse>("/api/booking/create", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },
}
