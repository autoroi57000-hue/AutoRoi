import { createAdminClient } from "@/lib/supabase/server"

interface RateLimitConfig {
  /** Unique prefix for this limiter (e.g. "photos", "invite", "contact") */
  prefix: string
  /** Max requests allowed within the window */
  maxRequests: number
  /** Window duration in milliseconds (default: 1 hour) */
  windowMs?: number
}

interface RateLimitResult {
  allowed: boolean
  /** Current request count (after increment) */
  count: number
  /** Max allowed */
  limit: number
  /** Seconds until the window resets */
  retryAfterSeconds: number
}

/**
 * Check and increment rate limit using Supabase `rate_limits` table.
 * Fail-open: if the DB call fails, the request is allowed through.
 *
 * @param identifier - IP address, userId, or any unique key
 * @param config - Rate limit configuration
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const { prefix, maxRequests, windowMs = 60 * 60 * 1000 } = config
  const key = `${prefix}:${identifier}`
  const now = new Date()
  const resetAt = new Date(now.getTime() + windowMs)

  try {
    const admin = createAdminClient() as any

    const { data: record } = await admin
      .from("rate_limits")
      .select("count, reset_at")
      .eq("key", key)
      .single() as { data: { count: number; reset_at: string } | null }

    // No record or window expired → new window
    if (!record || new Date(record.reset_at) < now) {
      await admin.from("rate_limits").upsert({
        key,
        count: 1,
        reset_at: resetAt.toISOString(),
      })
      return {
        allowed: true,
        count: 1,
        limit: maxRequests,
        retryAfterSeconds: Math.ceil(windowMs / 1000),
      }
    }

    // Window active — check limit
    if (record.count >= maxRequests) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((new Date(record.reset_at).getTime() - now.getTime()) / 1000)
      )
      return {
        allowed: false,
        count: record.count,
        limit: maxRequests,
        retryAfterSeconds,
      }
    }

    // Increment
    const newCount = record.count + 1
    await admin
      .from("rate_limits")
      .update({ count: newCount })
      .eq("key", key)

    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((new Date(record.reset_at).getTime() - now.getTime()) / 1000)
    )

    return {
      allowed: true,
      count: newCount,
      limit: maxRequests,
      retryAfterSeconds,
    }
  } catch (error) {
    // Fail-open: if rate limit check fails, allow the request
    console.error("Rate limit check failed (fail-open):", error)
    return {
      allowed: true,
      count: 0,
      limit: maxRequests,
      retryAfterSeconds: Math.ceil(windowMs / 1000),
    }
  }
}

/**
 * Build a 429 Too Many Requests response with proper headers.
 */
export function rateLimitResponse(
  result: RateLimitResult,
  message = "Trop de requêtes. Veuillez réessayer plus tard."
) {
  return new Response(JSON.stringify({ error: message }), {
    status: 429,
    headers: {
      "Content-Type": "application/json",
      "Retry-After": String(result.retryAfterSeconds),
      "X-RateLimit-Limit": String(result.limit),
      "X-RateLimit-Remaining": String(Math.max(0, result.limit - result.count)),
      "X-RateLimit-Reset": String(result.retryAfterSeconds),
    },
  })
}
