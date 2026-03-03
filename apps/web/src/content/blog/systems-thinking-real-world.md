## Why Local Fixes Often Fail

A slow API response once looked like a database issue. The query was not great, but that was not the real problem. The cache layer had invalidation gaps that triggered repeated cold reads across services.

### Root Cause vs Symptom

When the cache strategy was fixed, latency dropped and infrastructure cost dropped with it. The local query optimization helped, but the system-level issue created the largest impact.

### A Repeatable Diagnostic Loop

1. Map the full request path.
2. Label each dependency and feedback loop.
3. Identify where retries, cache misses, or fan-out multiply work.
4. Fix the highest leverage point first.

## Lightweight Instrumentation Example

```ts
interface ServiceMetric {
  name: string
  cacheHitRate: number
  avgLatencyMs: number
}

export function findLeveragePoint(metrics: ServiceMetric[]): ServiceMetric | null {
  if (!metrics.length) return null

  return metrics
    .slice()
    .sort((a, b) => {
      const scoreA = (1 - a.cacheHitRate) * a.avgLatencyMs
      const scoreB = (1 - b.cacheHitRate) * b.avgLatencyMs
      return scoreB - scoreA
    })[0]
}
```

Systems thinking is mostly disciplined zooming: zoom out to model behavior, then zoom in at the exact point that changes the whole system.
