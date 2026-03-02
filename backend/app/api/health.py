from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
async def health_check():
    """
    Standard health check endpoint.
    Used by Render/Railway for liveness probes.
    """
    return {
        "status": "ok",
        "service": "Pulse Engine Backend",
        "infrastructure": "Healthy"
    }
