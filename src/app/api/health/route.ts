// Liveness endpoint for container orchestration (Docker healthcheck).
export function GET() {
    return new Response('OK', { status: 200 })
}
