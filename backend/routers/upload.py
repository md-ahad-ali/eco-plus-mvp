
import os

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.orm import Session

from database import get_db
from models import CsvUpload
from schemas import CsvImportResult, CsvUploadResponse
from services import csv_import

router = APIRouter(prefix="/api/uploads", tags=["uploads"])

MAX_BYTES = 50 * 1024 * 1024


@router.post("/file", response_model=CsvImportResult)
def upload_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    name = os.path.basename(file.filename or "")
    if not name.lower().endswith(".csv"):
        raise HTTPException(400, "Only .csv files are allowed")
    if file.size and file.size > MAX_BYTES:
        raise HTTPException(413, "File is larger than 50 MB")
    try:
        return csv_import.import_csv(db, name, file.file)
    except ValueError as e:
        raise HTTPException(400, str(e))


@router.get("", response_model=list[CsvUploadResponse])
def list_uploads(db: Session = Depends(get_db)):
    return db.scalars(select(CsvUpload).order_by(CsvUpload.id.desc())).all()
