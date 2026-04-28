"""
Passport Photo Processing Pipeline
====================================
1. Remove background (rembg - u2netp lightweight model)
2. Detect face (multi-method: Haar Cascade + skin detection + smart fallback)
3. Smart crop to passport dimensions
4. Layout multiple copies on A4
5. Export high-res PDF (300 DPI)
"""

import io
import math
import os
from typing import Optional

import cv2
import numpy as np
from PIL import Image, ImageDraw
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

_rembg_session = None


def get_rembg_session():
    global _rembg_session
    if _rembg_session is None:
        _rembg_session = new_session("u2netp")
    return _rembg_session


def _find_cascade_path(filename: str) -> str:
    """Find Haar Cascade XML file path robustly."""
    # Try cv2.data first
    try:
        p = cv2.data.haarcascades + filename
        if os.path.exists(p):
            return p
    except Exception:
        pass
    # Try relative to cv2 package
    try:
        p = os.path.join(os.path.dirname(cv2.__file__), "data", filename)
        if os.path.exists(p):
            return p
    except Exception:
        pass
    return filename  # let OpenCV handle it


class PassportPhotoProcessor:
    def __init__(self):
        self.face_cascade = cv2.CascadeClassifier(
            _find_cascade_path("haarcascade_frontalface_default.xml")
        )
        self.face_cascade_alt = cv2.CascadeClassifier(
            _find_cascade_path("haarcascade_frontalface_alt2.xml")
        )
        self.profile_cascade = cv2.CascadeClassifier(
            _find_cascade_path("haarcascade_profileface.xml")
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

        # Auto-rotate based on EXIF
        orig = _fix_exif_rotation(orig)

        # Step 1 – Remove background
        no_bg = self._remove_background(orig, bg_rgb)

        # Step 2 – Detect face
        face_info = self._detect_face_robust(no_bg)

        # Step 3 – Crop
        passport_img = self._crop_passport(
            no_bg, face_info, pw, ph,
            preset["face_ratio"],
            preset.get("face_width_ratio", 0.60),
            preset["top_margin_ratio"],
            bg_rgb,
        )

        # Step 4 – Layout on A4
        a4_sheet = self._layout_a4(passport_img, copies, pw, ph, bg_rgb)

        # Step 5 – PDF
        pdf_bytes = self._generate_pdf(a4_sheet)

        preview = passport_img.copy()
        preview.thumbnail((600, 800), Image.LANCZOS)

        return {
            "passport_image": passport_img,
            "a4_sheet": a4_sheet,
            "preview_image": preview,
            "pdf_bytes": pdf_bytes,
        }

    # ------------------------------------------------------------------
    # Step 1 – Background removal
    # ------------------------------------------------------------------
    def _remove_background(self, img: Image.Image, bg_rgb: tuple) -> Image.Image:
        img_bytes = io.BytesIO()
        img.save(img_bytes, format="PNG")
        img_bytes.seek(0)
        try:
            result_bytes = remove(img_bytes.read(), session=get_rembg_session())
            result = Image.open(io.BytesIO(result_bytes)).convert("RGBA")
            background = Image.new("RGBA", result.size, (*bg_rgb, 255))
            background.paste(result, mask=result.split()[3])
            return background.convert("RGB")
        except Exception:
            return img.convert("RGB")

    # ------------------------------------------------------------------
    # Step 2 – Multi-method face detection
    # ------------------------------------------------------------------
    def _detect_face_robust(self, img: Image.Image) -> dict:
        img_np = np.array(img)
        h, w = img_np.shape[:2]

        # Preprocess: enhance contrast for better detection
        gray = cv2.cvtColor(img_np, cv2.COLOR_RGB2GRAY)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        gray_enhanced = clahe.apply(gray)

        # Method 1: Frontal face default
        face = self._try_cascade(self.face_cascade, gray_enhanced, w, h)
        if face:
            return self._build_face_info(face, w, h)

        # Method 2: Frontal face alt2
        face = self._try_cascade(self.face_cascade_alt, gray_enhanced, w, h)
        if face:
            return self._build_face_info(face, w, h)

        # Method 3: Try on original gray (without enhancement)
        face = self._try_cascade(self.face_cascade, gray, w, h)
        if face:
            return self._build_face_info(face, w, h)

        # Method 4: Skin color detection to find face region
        face = self._skin_based_face_region(img_np, w, h)
        if face:
            return self._build_face_info(face, w, h)

        # Method 5: Smart center fallback
        return self._smart_center_fallback(w, h)

    def _try_cascade(self, cascade, gray, w, h):
        """Try multiple scale/neighbor combos."""
        if cascade.empty():
            return None
        for scale, neighbors, min_pct in [
            (1.1, 5, 0.08),
            (1.05, 3, 0.06),
            (1.15, 4, 0.05),
            (1.1, 2, 0.04),
        ]:
            min_size = int(min(w, h) * min_pct)
            faces = cascade.detectMultiScale(
                gray,
                scaleFactor=scale,
                minNeighbors=neighbors,
                minSize=(max(min_size, 30), max(min_size, 30)),
            )
            if len(faces) > 0:
                # Return largest face
                return sorted(faces, key=lambda f: f[2] * f[3], reverse=True)[0]
        return None

    def _skin_based_face_region(self, img_np, w, h):
        """Find face region using skin color heuristic."""
        try:
            # Convert to YCrCb for skin detection (works across skin tones)
            ycrcb = cv2.cvtColor(img_np, cv2.COLOR_RGB2YCrCb)
            lower = np.array([0, 133, 77], dtype=np.uint8)
            upper = np.array([255, 173, 127], dtype=np.uint8)
            skin_mask = cv2.inRange(ycrcb, lower, upper)

            # Morphological cleanup
            kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (11, 11))
            skin_mask = cv2.morphologyEx(skin_mask, cv2.MORPH_CLOSE, kernel)
            skin_mask = cv2.morphologyEx(skin_mask, cv2.MORPH_OPEN, kernel)

            # Find contours
            contours, _ = cv2.findContours(skin_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            if not contours:
                return None

            # Get contours in upper 70% of image (face should be there)
            upper_bound = int(h * 0.7)
            valid = [c for c in contours if cv2.boundingRect(c)[1] < upper_bound
                     and cv2.contourArea(c) > (w * h * 0.02)]

            if not valid:
                valid = contours

            # Pick largest skin region
            largest = max(valid, key=cv2.contourArea)
            fx, fy, fw, fh = cv2.boundingRect(largest)

            # Validate: face-like aspect ratio (between 0.5 and 2.5)
            if fw == 0 or fh == 0:
                return None
            ratio = fh / fw
            if ratio < 0.4 or ratio > 3.0:
                return None

            # Face must be at least 8% of image in each dimension
            if fw < w * 0.08 or fh < h * 0.08:
                return None

            return (fx, fy, fw, fh)
        except Exception:
            return None

    def _smart_center_fallback(self, w, h) -> dict:
        """
        Last resort: assume face is centered horizontally
        and in the upper 35% of a portrait image.
        """
        fw = int(w * 0.55)
        fh = int(h * 0.45)
        fx = (w - fw) // 2
        fy = int(h * 0.03)

        head_top_y = fy
        chin_y = min(h, fy + fh)
        return {
            "x": fx, "y": fy, "w": fw, "h": fh,
            "cx": fx + fw // 2,
            "cy": fy + fh // 2,
            "img_w": w, "img_h": h,
            "head_top_y": head_top_y,
            "chin_y": chin_y,
            "head_height": max(chin_y - head_top_y, 1),
            "eye_x_center": w // 2,
            "is_fallback": True,
        }

    def _build_face_info(self, face_rect, w, h) -> dict:
        fx, fy, fw, fh = face_rect
        # Head top: ~30% above face bbox (includes forehead + hair)
        head_top_y = max(0, fy - int(fh * 0.32))
        # Chin: slightly below face bbox
        chin_y = min(h, fy + fh + int(fh * 0.08))
        head_height = max(chin_y - head_top_y, 1)
        return {
            "x": fx, "y": fy, "w": fw, "h": fh,
            "cx": fx + fw // 2,
            "cy": fy + fh // 2,
            "img_w": w, "img_h": h,
            "head_top_y": head_top_y,
            "chin_y": chin_y,
            "head_height": head_height,
            "eye_x_center": fx + fw // 2,
            "is_fallback": False,
        }

    # ------------------------------------------------------------------
    # Step 3 – Crop & compose passport photo
    # ------------------------------------------------------------------
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

        # Use the more conservative scale to avoid over-zooming
        scale = min(scale_h, scale_w)
        # Clamp scale: don't zoom in more than 5x or zoom out more than 0.2x
        scale = max(0.2, min(scale, 5.0))

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

    # ------------------------------------------------------------------
    # Step 4 – Layout on A4
    # ------------------------------------------------------------------
    def _layout_a4(self, photo, copies, pw, ph, bg_rgb):
        a4 = Image.new("RGB", (A4_W_PX, A4_H_PX), (255, 255, 255))
        usable_w = A4_W_PX - 2 * MARGIN_PX
        usable_h = A4_H_PX - 2 * MARGIN_PX
        cols = max(1, usable_w // (pw + GAP_PX))
        rows = max(1, usable_h // (ph + GAP_PX))
        actual_copies = min(copies, cols * rows)
        grid_w = cols * pw + (cols - 1) * GAP_PX
        grid_h = rows * ph + (rows - 1) * GAP_PX
        start_x = MARGIN_PX + (usable_w - grid_w) // 2
        start_y = MARGIN_PX + (usable_h - grid_h) // 2
        for i in range(actual_copies):
            col = i % cols
            row = i // cols
            a4.paste(photo, (start_x + col * (pw + GAP_PX), start_y + row * (ph + GAP_PX)))
        draw = ImageDraw.Draw(a4)
        dash_len = int(3 * MM_TO_PX)
        gap_len = int(2 * MM_TO_PX)
        for i in range(actual_copies):
            col = i % cols
            row = i // cols
            x = start_x + col * (pw + GAP_PX)
            y = start_y + row * (ph + GAP_PX)
            self._draw_dashed_rect(draw, x, y, x + pw, y + ph, (180, 180, 180), dash_len, gap_len)
        return a4

    def _draw_dashed_rect(self, draw, x1, y1, x2, y2, color, dash, gap):
        for sx, sy, ex, ey in [(x1, y1, x2, y1), (x2, y1, x2, y2), (x2, y2, x1, y2), (x1, y2, x1, y1)]:
            length = math.hypot(ex - sx, ey - sy)
            if length == 0:
                continue
            dx, dy = (ex - sx) / length, (ey - sy) / length
            pos, drawing = 0, True
            while pos < length:
                seg = min(dash if drawing else gap, length - pos)
                if drawing:
                    draw.line([sx + dx * pos, sy + dy * pos, sx + dx * (pos + seg), sy + dy * (pos + seg)],
                              fill=color, width=2)
                pos += seg
                drawing = not drawing

    # ------------------------------------------------------------------
    # Step 5 – PDF
    # ------------------------------------------------------------------
    def _generate_pdf(self, a4_img: Image.Image) -> io.BytesIO:
        img_bytes = io.BytesIO()
        a4_img.save(img_bytes, format="JPEG", quality=95, dpi=(DPI, DPI))
        img_bytes.seek(0)
        pdf_bytes = io.BytesIO()
        c = rl_canvas.Canvas(pdf_bytes, pagesize=A4)
        a4_w_pt, a4_h_pt = A4
        c.drawImage(ImageReader(img_bytes), 0, 0, width=a4_w_pt, height=a4_h_pt, preserveAspectRatio=False)
        c.showPage()
        c.save()
        pdf_bytes.seek(0)
        return pdf_bytes


# ------------------------------------------------------------------
# EXIF rotation fix
# ------------------------------------------------------------------
def _fix_exif_rotation(img: Image.Image) -> Image.Image:
    """Fix image rotation from EXIF data (phone camera photos)."""
    try:
        from PIL import ExifTags
        exif = img._getexif()
        if exif is None:
            return img
        orientation_key = next(
            (k for k, v in ExifTags.TAGS.items() if v == "Orientation"), None
        )
        if orientation_key is None or orientation_key not in exif:
            return img
        orientation = exif[orientation_key]
        rotations = {3: 180, 6: 270, 8: 90}
        if orientation in rotations:
            img = img.rotate(rotations[orientation], expand=True)
    except Exception:
        pass
    return img
