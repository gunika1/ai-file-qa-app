from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from PyPDF2 import PdfReader
import google.generativeai as genai
from dotenv import load_dotenv
import os

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

available_models = [
    m.name for m in genai.list_models()
    if "generateContent" in m.supported_generation_methods
]

print("Available Gemini models:", available_models)

model = genai.GenerativeModel(available_models[0])

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
    global pdf_text

    if not pdf_text:
        return {"summary": "Please upload a PDF first."}

    try:
        prompt = f"""
Give a clear summary of this PDF.

PDF Content:
{pdf_text[:12000]}
"""

        response = model.generate_content(prompt)

        return {"summary": response.text}

    except Exception as e:
        return {"summary": f"Error: {str(e)}"}


@app.post("/chat")
async def chat(question: str = Form(...)):
    global pdf_text

    if not pdf_text:
        return {"answer": "Please upload a PDF first."}

    try:
        prompt = f"""
You are an AI assistant.

Answer the user's question using ONLY the uploaded PDF content.

PDF Content:
{pdf_text[:15000]}

User Question:
{question}

Give a clear and helpful answer.
"""

        response = model.generate_content(prompt)

        return {"answer": response.text}

    except Exception as e:
        return {"answer": f"Error: {str(e)}"}