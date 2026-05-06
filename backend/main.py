from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from PyPDF2 import PdfReader
from dotenv import load_dotenv
import requests
import os
import uvicorn

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = "gemini-2.5-flash"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

pdf_text = ""
uploaded_filename = ""


def ask_gemini(prompt):
    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"
    )

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ]
    }

    response = requests.post(url, json=payload, timeout=60)
    data = response.json()

    if response.status_code != 200:
        return f"Gemini API Error: {data}"

    return data["candidates"][0]["content"]["parts"][0]["text"]


@app.get("/")
def home():
    return {"message": "AI PDF Chatbot Backend Running"}


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    global pdf_text, uploaded_filename

    uploaded_filename = file.filename
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)

    with open(file_path, "wb") as f:
        f.write(await file.read())

    reader = PdfReader(file_path)

    text = ""
    for page in reader.pages:
        extracted = page.extract_text()
        if extracted:
            text += extracted + "\n"

    pdf_text = text

    return {
        "message": "PDF uploaded successfully",
        "filename": uploaded_filename,
        "characters": len(pdf_text),
    }


@app.post("/summary")
async def generate_summary():
    if not pdf_text:
        return {"summary": "Please upload a PDF first."}

    prompt = f"""
Give a clear summary of this PDF.

PDF Content:
{pdf_text[:12000]}
"""

    answer = ask_gemini(prompt)
    return {"summary": answer}


@app.post("/chat")
async def chat(question: str = Form(...)):
    if not pdf_text:
        return {"answer": "Please upload a PDF first."}

    prompt = f"""
You are an AI assistant.

Answer the user's question using ONLY the uploaded PDF content.

PDF Content:
{pdf_text[:15000]}

User Question:
{question}

Give a clear and helpful answer.
"""

    answer = ask_gemini(prompt)
    return {"answer": answer}


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    uvicorn.run(app, host="0.0.0.0", port=port)