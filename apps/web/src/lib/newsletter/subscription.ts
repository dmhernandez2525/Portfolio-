export type SubscriptionFrequency = "weekly" | "biweekly" | "monthly"
export type SubscriptionInterest = "games" | "projects" | "blog" | "career"

export interface Subscriber {
  email: string
  interests: SubscriptionInterest[]
  frequency: SubscriptionFrequency
  subscribedAt: number
  confirmed: boolean
}

const SUBSCRIBERS_KEY = "portfolio:newsletter:subscribers"

function loadSubscribers(): Subscriber[] {
  try {
    const raw = localStorage.getItem(SUBSCRIBERS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveSubscribers(subscribers: Subscriber[]): void {
  try {
    localStorage.setItem(SUBSCRIBERS_KEY, JSON.stringify(subscribers))
  } catch {
    // Storage unavailable
  }
}

export function subscribe(email: string, interests: SubscriptionInterest[], frequency: SubscriptionFrequency): { success: boolean; error?: string } {
  if (!isValidEmail(email)) {
    return { success: false, error: "Invalid email address" }
  }

  const subscribers = loadSubscribers()
  if (subscribers.some((s) => s.email === email)) {
    return { success: false, error: "Already subscribed" }
  }

  subscribers.push({
    email,
    interests,
    frequency,
    subscribedAt: Date.now(),
    confirmed: false,
  })

  saveSubscribers(subscribers)
  return { success: true }
}

export function unsubscribe(email: string): boolean {
  const subscribers = loadSubscribers()
  const filtered = subscribers.filter((s) => s.email !== email)
  if (filtered.length === subscribers.length) return false
  saveSubscribers(filtered)
  return true
}

export function confirmSubscription(email: string): boolean {
  const subscribers = loadSubscribers()
  const subscriber = subscribers.find((s) => s.email === email)
  if (!subscriber) return false
  subscriber.confirmed = true
  saveSubscribers(subscribers)
  return true
}

export function getSubscriberCount(): number {
  return loadSubscribers().filter((s) => s.confirmed).length
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
