from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.models import models  # noqa: F401 ensures models are registered
from app.routers import auth, complaints, notices, dashboard

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Society Maintenance Tracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten to FRONTEND_URL in production if desired
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(complaints.router)
app.include_router(notices.router)
app.include_router(dashboard.router)


@app.get("/")
def root():
    return {"status": "ok", "service": "Society Maintenance Tracker API"}


@app.get("/health")
def health():
    return {"status": "healthy"}
