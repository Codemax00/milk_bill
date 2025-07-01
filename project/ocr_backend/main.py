from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

LLEMMA_API_URL = "https://api.llemma.com/v1/ocr"
API_KEY = "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"

@app.post("/ocr")
async def ocr_image(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        files = {"file": (file.filename, contents, file.content_type or "application/octet-stream")}
        headers = {"Authorization": f"Bearer {API_KEY}"}
        response = requests.post(LLEMMA_API_URL, files=files, headers=headers)  # type: ignore
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail=f"Llemma API error: {response.text}")
        data = response.json()
        text = data.get("text") or data.get("result") or data
        return {"text": text}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"OCR failed: {str(e)}") 