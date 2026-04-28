"""
Passport Photo Processing Pipeline
====================================
1. Remove background (rembg)
2. Detect & align face (OpenCV Haar Cascade - lightweight)
3. Smart crop to passport dimensions
4. Layout multiple copies on A4
5. Export high-res PDF (300 DPI)
"""

import io
import math
from typing import Optional

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from rembg import remove, new_session
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas as rl_canvas


DPI = 300
MM_TO_PX = DPI / 25.4

A4_W_PX = int(210 * MM_TO_PX)
A4_H_PX = int(297 * MM_TO_PX)
MARGIN_PX = int(10 * MM_TO_PX)
GAP_PX = int(3 * MM_TO_PX)

BG_COLORS = {
    "white": (255, 255, 255),
    "light_blue": (173, 216, 230),
}

# Load lightweight rembg model once at module level
_rembg_session = None

def get_rembg_session():
    global _rembg_session
    if _rembg_session is None:
        # u2netp is the lightweight model (~4MB vs ~170MB for u2net)
        _rembg_session = new_session("u2netp")
    return _rembg_session


class PassportPhotoProcessor:
    def __init__(self):
        # Load OpenCV face detector (Haar Cascade - very lightweight, no extra RAM)
        self.face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        )

    def process(
        self,
        image_path: str,
        copies: int = 6,
        bg_color: str = "white",
        preset: Optional[dict] = None,
    ) -> dict:
        if preset is None:
            preset = {
                "width_mm": 35, "height_mm": 45,
                "face_ratio": 0.74, "top_margin_ratio": 0.09,
                "face_width_ratio": 0.58,
            }

        bg_rgb = BG_COLORS.get(bg_color, BG_COLORS["white"])

        pw = int(preset["width_mm"] * MM_TO_PX)
        ph = int(preset["height_mm"] * MM_TO_PX)

        orig = Image.open(image_path).convert("RGBA")

        # Step 1 – Remove background
        no_bg = self._remove_background(orig, bg_rgb)

        # Step 2 – Detect face
        face_info = self._detect_face(no_bg)
        if face_info is None:
            raise ValueError(
                "No face detected. Please use a clear frontal photo with good lighting."
            )

        # Step 3 – Crop & resize to passport dimensions
        passport_img = self._crop_passport(
            no_bg, face_info, pw, ph,
            preset["face_ratio"],
            preset.get("face_width_ratio", 0.60),
            preset["top_margin_ratio"],
            bg_rgb,
        )

        # Step 4 – Layout on A4
        a4_sheet = self._layout_a4(passport_img, copies, pw, ph, bg_rgb)

        # Step 5 – Generate PDF
        pdf_bytes = self._generate_pdf(a4_sheet)

        preview = passport_img.copy()
        preview.thumbnail((600, 800), Image.LANCZOS)

        return {
            "passport_image": passport_img,
            "a4_sheet": a4_sheet,
            "preview_image": preview,
            "pdf_bytes": pdf_bytes,
        }

    def _remove_background(self, img: Image.Image, bg_rgb: tuple) -> Image.Image:
        img_bytes = io.BytesIO()
        img.save(img_bytes, format="PNG")
        img_bytes.seek(0)

        result_bytes = remove(img_bytes.read(), session=get_rembg_session())
        result = Image.open(io.BytesIO(result_bytes)).convert("RGBA")

        background = Image.new("RGBA", result.size, (*bg_rgb, 255))
        background.paste(result, mask=result.split()[3])
        return background.convert("RGB")

    def _detect_face(self, img: Image.Image) -> Optional[dict]:
        img_np = np.array(img)
        gray = cv2.cvtColor(img_np, cv2.COLOR_RGB2GRAY)
        h, w = gray.shape

        faces = self.face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(60, 60),
            flags=cv2.CASCADE_SCALE_IMAGE,
        )

        if len(faces) == 0:
            return None

        # Pick the largest face
        faces = sorted(faces, key=lambda f: f[2] * f[3], reverse=True)
        fx, fy, fw, fh = faces[0]

        # Estimate head top (above face bbox) and chin
        head_top_y = max(0, fy - int(fh * 0.25))
        chin_y = fy + fh
        head_height = chin_y - head_top_y

        return {
            "x": fx, "y": fy, "w": fw, "h": fh,
            "cx": fx + fw // 2,
            "cy": fy + fh // 2,
            "img_w": w, "img_h": h,
            "head_top_y": head_top_y,
            "chin_y": chin_y,
            "head_height": head_height,
            "eye_x_center": fx + fw // 2,
        }

    def _crop_passport(
        self,
        img: Image.Image,
        face_info: dict,
        pw: int, ph: int,
        face_ratio: float,
        face_width_ratio: float,
        top_margin_ratio: float,
        bg_rgb: tuple,
    ) -> Image.Image:
        iw, ih = img.size

        target_head_h = int(ph * face_ratio)
        actual_head_h = max(face_info["head_height"], 1)
        head_top_y = face_info["head_top_y"]

        actual_face_w = max(face_info["w"], 1)
        target_face_w = int(pw * face_width_ratio)

        scale_h = target_head_h / actual_head_h
        scale_w = target_face_w / actual_face_w
        scale = min(scale_h, scale_w)

        face_cx = face_info["eye_x_center"]
        top_margin_px = int(ph * top_margin_ratio)

        src_w = pw / scale
        src_h = ph / scale

        src_x_center = face_cx
        src_y_top = head_top_y - (top_margin_px / scale)

        src_left = src_x_center - src_w / 2
        src_top = src_y_top
        src_right = src_left + src_w
        src_bottom = src_top + src_h

        pad_left = max(0, -int(src_left))
        pad_top = max(0, -int(src_top))
        pad_right = max(0, int(src_right) - iw)
        pad_bottom = max(0, int(src_bottom) - ih)

        if any([pad_left, pad_top, pad_right, pad_bottom]):
            new_w = iw + pad_left + pad_right
            new_h = ih + pad_top + pad_bottom
            expanded = Image.new("RGB", (new_w, new_h), bg_rgb)
            expanded.paste(img, (pad_left, pad_top))
            img = expanded
            src_left += pad_left
            src_top += pad_top
            src_right += pad_left
            src_bottom += pad_top

        crop_box = (
            max(0, int(src_left)),
            max(0, int(src_top)),
            min(img.width, int(src_right)),
            min(img.height, int(src_bottom)),
        )
        cropped = img.crop(crop_box)
        passport = cropped.resize((pw, ph), Image.LANCZOS)
        return passport

    def _layout_a4(
        self,
        photo: Image.Image,
        copies: int,
        pw: int, ph: int,
        bg_rgb: tuple,
    ) -> Image.Image:
        a4 = Image.new("RGB", (A4_W_PX, A4_H_PX), (255, 255, 255))

        usable_w = A4_W_PX - 2 * MARGIN_PX
        usable_h = A4_H_PX - 2 * MARGIN_PX

        cols = max(1, usable_w // (pw + GAP_PX))
        rows = max(1, usable_h // (ph + GAP_PX))
        max_copies = cols * rows
        actual_copies = min(copies, max_copies)

        grid_w = cols * pw + (cols - 1) * GAP_PX
        grid_h = rows * ph + (rows - 1) * GAP_PX
        start_x = MARGIN_PX + (usable_w - grid_w) // 2
        start_y = MARGIN_PX + (usable_h - grid_h) // 2

        for i in range(actual_copies):
            col = i % cols
            row = i // cols
            x = start_x + col * (pw + GAP_PX)
            y = start_y + row * (ph + GAP_PX)
            a4.paste(photo, (x, y))

        draw = ImageDraw.Draw(a4)
        line_color = (180, 180, 180)
        dash_len = int(3 * MM_TO_PX)
        gap_len = int(2 * MM_TO_PX)

        for i in range(actual_copies):
            col = i % cols
            row = i // cols
            x = start_x + col * (pw + GAP_PX)
            y = start_y + row * (ph + GAP_PX)
            self._draw_dashed_rect(draw, x, y, x + pw, y + ph, line_color, dash_len, gap_len)

        return a4

    def _draw_dashed_rect(self, draw, x1, y1, x2, y2, color, dash, gap):
        for side in [(x1, y1, x2, y1), (x2, y1, x2, y2), (x2, y2, x1, y2), (x1, y2, x1, y1)]:
            sx, sy, ex, ey = side
            length = math.hypot(ex - sx, ey - sy)
            if length == 0:
                continue
            dx, dy = (ex - sx) / length, (ey - sy) / length
            pos = 0
            drawing = True
            while pos < length:
                seg = min(dash if drawing else gap, length - pos)
                if drawing:
                    draw.line(
                        [sx + dx * pos, sy + dy * pos,
                         sx + dx * (pos + seg), sy + dy * (pos + seg)],
                        fill=color, width=2
                    )
                pos += seg
                drawing = not drawing

    def _generate_pdf(self, a4_img: Image.Image) -> io.BytesIO:
        img_bytes = io.BytesIO()
        a4_img.save(img_bytes, format="JPEG", quality=95, dpi=(DPI, DPI))
        img_bytes.seek(0)

        pdf_bytes = io.BytesIO()
        c = rl_canvas.Canvas(pdf_bytes, pagesize=A4)
        a4_w_pt, a4_h_pt = A4
        image_reader = ImageReader(img_bytes)
        c.drawImage(image_reader, 0, 0, width=a4_w_pt, height=a4_h_pt, preserveAspectRatio=False)
        c.showPage()
        c.save()
        pdf_bytes.seek(0)
        return pdf_bytes
