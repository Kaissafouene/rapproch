from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.upload_routes import router as upload_router
from routes.reconcile_routes import router as reconcile_router
from routes.ai_routes import router as ai_router
from routes.auth_routes import router as auth_router
from utils.logger import logger
import os
from datetime import datetime

# Create storage directories
os.makedirs("storage/uploads", exist_ok=True)
os.makedirs("storage/logs", exist_ok=True)
os.makedirs("storage/reports", exist_ok=True)

app = FastAPI(
    title="Rapprochement Bancaire API",
    description="Tunisian Bank Reconciliation System with AI Assistance",
    version="1.0.0"
)

# CORS middleware - CONFIGURATION COMPLÈTE POUR LA PRODUCTION
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://rapproch-frontend.onrender.com",
        "https://*.onrender.com",
        "http://localhost:8080",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"],
    allow_headers=[
        "Authorization",
        "Content-Type",
        "Accept",
        "Origin",
        "X-Requested-With",
        "Access-Control-Request-Method",
        "Access-Control-Request-Headers",
        "X-CSRF-Token",
        "X-API-Key",
    ],
    expose_headers=[
        "Content-Disposition",
        "Content-Length",
        "X-API-Version",
        "Access-Control-Allow-Origin"
    ],
    max_age=86400,  # 24 heures de cache pour les pré-vérifications CORS
)

# Middleware pour debug CORS
@app.middleware("http")
async def add_cors_headers(request, call_next):
    response = await call_next(request)
    
    # Headers CORS supplémentaires pour debug
    origin = request.headers.get("origin")
    if origin and origin in [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://rapproch-frontend.onrender.com"
    ]:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Expose-Headers"] = "*"
    
    # Headers de debug
    response.headers["X-API-Server"] = "rapproch-backend"
    response.headers["X-API-Version"] = "1.0.0"
    response.headers["X-Timestamp"] = datetime.now().isoformat()
    
    return response

# Handler spécial pour les requêtes OPTIONS
@app.options("/{path:path}")
async def options_handler(path: str):
    return {
        "message": "CORS preflight successful",
        "allowed_methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        "timestamp": datetime.now().isoformat()
    }

# Register routes
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(upload_router, prefix="/api", tags=["Upload"])
app.include_router(reconcile_router, prefix="/api", tags=["Reconciliation"])
app.include_router(ai_router, prefix="/api", tags=["AI Assistant"])

@app.get("/")
async def root():
    """API root endpoint"""
    return {
        "message": "Rapprochement Bancaire API",
        "version": "1.0.0",
        "status": "running",
        "timestamp": datetime.now().isoformat(),
        "endpoints": {
            "docs": "/docs",
            "health": "/health",
            "test": "/test-cors",
            "api_base": "/api"
        },
        "features": [
            "CSV file upload and processing",
            "5-tier reconciliation engine",
            "AI-assisted matching",
            "Tunisian PCN validation",
            "Suspense account handling",
            "N° R (reconciliation numbers)"
        ]
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "upload": "available",
            "reconciliation": "available",
            "ai_assistant": "available",
            "database": "connected" if os.getenv("DATABASE_URL") else "disconnected"
        },
        "cors": {
            "enabled": True,
            "allow_origins": [
                "http://localhost:5173",
                "http://localhost:3000",
                "https://rapproch-frontend.onrender.com"
            ]
        }
    }

@app.get("/test-cors")
async def test_cors():
    """Test endpoint for CORS"""
    return {
        "message": "CORS test successful!",
        "timestamp": datetime.now().isoformat(),
        "cors_config": {
            "allow_credentials": True,
            "allow_methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
            "allow_headers": ["Authorization", "Content-Type", "Accept", "Origin"],
            "allow_origins": [
                "http://localhost:5173",
                "http://localhost:3000",
                "https://rapproch-frontend.onrender.com"
            ]
        }
    }

@app.post("/api/test-connection")
async def test_connection(data: dict = None):
    """Test connection endpoint for frontend"""
    return {
        "status": "success",
        "message": "Backend connection test passed",
        "received_data": data,
        "backend_url": "https://rapproch.onrender.com",
        "timestamp": datetime.now().isoformat(),
        "request_headers": {
            "content_type": "application/json"
        }
    }

# Error handler for 404
@app.exception_handler(404)
async def not_found_exception_handler(request, exc):
    return {
        "error": "Not Found",
        "message": f"The requested URL {request.url.path} was not found",
        "timestamp": datetime.now().isoformat(),
        "available_endpoints": [
            "/docs - API Documentation",
            "/health - Health Check",
            "/api/auth/* - Authentication",
            "/api/upload/* - File Upload",
            "/api/reconcile/* - Reconciliation"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting Rapprochement Bancaire API...")
    logger.info(f"CORS enabled for origins: {app.middleware[0].allow_origins}")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
