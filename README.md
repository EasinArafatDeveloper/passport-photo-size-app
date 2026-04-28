# PassportAI – Full-Stack Passport Photo Generator

AI-powered passport photo generator with automatic background removal, face alignment, and high-resolution PDF output.

## 📁 Project Structure

```
passport-photo-app/
├── backend/           # Python FastAPI
│   ├── main.py        # API endpoints
│   ├── image_processor.py  # AI processing pipeline
│   ├── requirements.txt
│   └── start_backend.bat
└── frontend/          # Next.js 16 + Tailwind CSS
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx      # Main app (4-step flow)
    │   │   ├── layout.tsx
    │   │   └── globals.css
    │   └── components/
    │       ├── Header.tsx
    │       ├── StepIndicator.tsx
    │       ├── UploadStep.tsx
    │       ├── ConfigStep.tsx
    │       ├── ProcessStep.tsx
    │       ├── ResultStep.tsx
    │       └── Toast.tsx
    └── .env.local
```

## 🚀 Getting Started

### Prerequisites
- **Python 3.10+** – [Download](https://www.python.org/downloads/)
- **Node.js 18+** – [Download](https://nodejs.org/)

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
python main.py
# → Runs at http://localhost:8000
```

> ⚠️ First-time install: `rembg` (~200MB model) downloads on first run. `mediapipe` is ~80MB.

### Frontend Setup

```bash
cd frontend

# Install (already done during scaffold)
npm install

# Start dev server
npm run dev
# → Runs at http://localhost:3000
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/upload-image` | Upload photo, returns `session_id` |
| `POST` | `/process-photo` | Run AI pipeline, returns preview/download URLs |
| `GET`  | `/preview/{session_id}` | Retrieve preview image |
| `GET`  | `/download-pdf/{session_id}` | Download final PDF |

### Process Photo Request Body
```json
{
  "session_id": "uuid-string",
  "copies": 6,
  "bg_color": "white",
  "country_preset": "standard"
}
```

## 🌍 Country Presets

| Country | Size | Face Ratio | Top Margin |
|---------|------|-----------|------------|
| Standard | 35×45mm | 75% | 15% |
| Bangladesh | 35×45mm | 75% | 12% |
| USA | 51×51mm | 78% | 18% |
| UK | 35×45mm | 70% | 20% |

## 🖼️ Processing Pipeline

1. **Background Removal** – `rembg` (U2Net model) removes and replaces with white/light-blue
2. **Face Detection** – MediaPipe Face Detection (bounding box)
3. **Face Mesh Refinement** – 468-landmark mesh for precise top-of-head and chin points  
4. **Smart Crop** – Scale and position so head occupies ~70–80% of photo height
5. **A4 Layout** – Grid of N copies with 3mm gaps and dashed cut guides
6. **PDF Export** – ReportLab 300 DPI A4 page

## 🎨 Frontend Features

- Dark glassmorphism design with animated gradients
- Drag-and-drop & camera capture upload
- Real-time progress with pipeline stage display  
- Country preset selector (BD / USA / UK / Standard)
- Background color toggle (white / light blue)
- Copies selector (4 / 6 / 8)
- Live A4 preview before download
- Mobile-first responsive layout
