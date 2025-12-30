# Ghost Text Detector 👻

A web application that scans PDF and DOCX files for hidden characters designed to trick AI systems.

## What It Detects

- **White/Near-white text** - Text colored to match the background
- **Zero-width characters** - Invisible Unicode characters (U+200B, U+200C, U+200D, etc.)
- **Microscopic text** - Text with font size < 2pt
- **Hidden text property** - DOCX files with hidden text formatting
- **Control characters** - Various Unicode control and formatting characters
- **Tag characters** - Unicode tag characters used for invisible watermarks

## Setup

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server
python app.py
```

The app will be available at http://127.0.0.1:5000

## Usage

1. Open the web app in your browser
2. Drag and drop a PDF or DOCX file (or click to browse)
3. View the analysis results showing any hidden content

## Risk Scoring

- **Clean (0)** - No suspicious content detected
- **Low (1-9)** - Minor issues, review recommended
- **Medium (10-29)** - Moderate suspicious content
- **High (30+)** - High likelihood of hidden content

## Tech Stack

- Backend: Flask (Python)
- PDF Parsing: pdfplumber
- DOCX Parsing: python-docx
- Frontend: Vanilla HTML/CSS/JavaScript


