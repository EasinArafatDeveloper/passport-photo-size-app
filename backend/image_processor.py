"""
Passport Photo Processing Pipeline
====================================
1. Remove background (rembg)
2. Detect & align face (MediaPipe)
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
import mediapipe as mp
from rembg import remove
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas as rl_canvas


DPI = 300
MM_TO_PX = DPI / 25.4  # pixels per mm at 300 DPI

# A4 at 300 DPI
A4_W_PX = int(210 * MM_TO_PX)   # 2480 px
A4_H_PX = int(297 * MM_TO_PX)   # 3508 px
MARGIN_PX = int(10 * MM_TO_PX)  # 10mm margin
GAP_PX = int(3 * MM_TO_PX)      # 3mm gap between photos

BG_COLORS = {
    "white": (255, 255, 255),
    "light_blue": (173, 216, 230),
}


class PassportPhotoProcessor:
    def __init__(self):
        self.mp_face_detection = mp.solutions.face_detection
        self.mp_face_mesh = mp.solutions.face_mesh

    # ------------------------------------------------------------------
    # Public entry point
    # ------------------------------------------------------------------
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

        # Target passport size in pixels
        pw = int(preset["width_mm"] * MM_TO_PX)
        ph = int(preset["height_mm"] * MM_TO_PX)

        # Load original
        orig = Image.open(image_path).convert("RGBA")

        # Step 1 – Remove background
        no_bg = self._remove_background(orig, bg_rgb)

        # Step 2 – Detect face landmarks
        face_info = self._detect_face(no_bg)
        if face_info is None:
            raise ValueError(
                "No face detected in the image. "
                "Please use a clear frontal photo with good lighting."
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

        # Preview = passport_img resized to reasonable size
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

        result_bytes = remove(img_bytes.read())
        result = Image.open(io.BytesIO(result_bytes)).convert("RGBA")

        # Paste onto solid background
        background = Image.new("RGBA", result.size, (*bg_rgb, 255))
        background.paste(result, mask=result.split()[3])
        return background.convert("RGB")

    # ------------------------------------------------------------------
    # Step 2 – Face detection using MediaPipe
    # ------------------------------------------------------------------
    def _detect_face(self, img: Image.Image) -> Optional[dict]:
        img_np = np.array(img)
        img_bgr = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)
        h, w = img_bgr.shape[:2]

        # Primary: use Face Detection for bounding box
        with self.mp_face_detection.FaceDetection(
            model_selection=1, min_detection_confidence=0.5
        ) as detector:
            results = detector.process(cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB))

        if not results.detections:
            return None

        det = results.detections[0]
        bb = det.location_data.relative_bounding_box
        fx = int(bb.xmin * w)
        fy = int(bb.ymin * h)
        fw = int(bb.width * w)
        fh = int(bb.height * h)

        # Landmarks: nose tip (2), left eye (0), right eye (1), mouth (3,4)
        kps = det.location_data.relative_keypoints
        face_info = {
            "x": fx, "y": fy, "w": fw, "h": fh,
            "cx": fx + fw // 2,
            "cy": fy + fh // 2,
            "img_w": w, "img_h": h,
            "left_eye": (int(kps[0].x * w), int(kps[0].y * h)),
            "right_eye": (int(kps[1].x * w), int(kps[1].y * h)),
            "nose": (int(kps[2].x * w), int(kps[2].y * h)),
            "mouth_left": (int(kps[3].x * w), int(kps[3].y * h)),
        }

        # Refine with FaceMesh for better eye/chin positions
        face_info = self._refine_with_mesh(img_np, face_info)
        return face_info

    def _refine_with_mesh(self, img_np: np.ndarray, face_info: dict) -> dict:
        h, w = img_np.shape[:2]
        with self.mp_face_mesh.FaceMesh(
            static_image_mode=True,
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5,
        ) as mesh:
            results = mesh.process(cv2.cvtColor(img_np, cv2.COLOR_BGR2RGB))

        if not results.multi_face_landmarks:
            return face_info

        lm = results.multi_face_landmarks[0].landmark

        def pt(idx):
            return int(lm[idx].x * w), int(lm[idx].y * h)

        # Landmark 10 often lands on the upper forehead, so add a small
        # allowance above it to better approximate the actual hair/top edge.
        # This helps maintain the required top margin in passport framing.
        # Key indices: top of head ~10, chin ~152, left eye outer ~33, right eye outer ~263
        top_head = pt(10)
        chin = pt(152)
        left_eye_outer = pt(33)
        right_eye_outer = pt(263)
        left_eye_inner = pt(133)
        right_eye_inner = pt(362)
        raw_head_height = max(chin[1] - top_head[1], 1)
        visual_head_top_y = max(0, top_head[1] - int(raw_head_height * 0.18))

        # Eye center y
        eye_y = (left_eye_outer[1] + right_eye_outer[1] + left_eye_inner[1] + right_eye_inner[1]) // 4
        eye_x_center = (left_eye_outer[0] + right_eye_outer[0]) // 2

        face_info.update({
            "top_head_y": visual_head_top_y,
            "chin_y": chin[1],
            "eye_y": eye_y,
            "eye_x_center": eye_x_center,
            "head_height": chin[1] - visual_head_top_y,
            "head_top_y": visual_head_top_y,
        })
        return face_info

    # ------------------------------------------------------------------
    # Step 3 – Crop & compose passport photo
    # ------------------------------------------------------------------
    def _crop_passport(
        self,
        img: Image.Image,
        face_info: dict,
        pw: int,
        ph: int,
        face_ratio: float,
        face_width_ratio: float,
        top_margin_ratio: float,
        bg_rgb: tuple,
    ) -> Image.Image:
        iw, ih = img.size

        # Desired head height in the final passport image
        target_head_h = int(ph * face_ratio)

        # Use mesh head height if available
        if "head_height" in face_info and face_info["head_height"] > 0:
            actual_head_h = face_info["head_height"]
            head_top_y = face_info["head_top_y"]
            chin_y = face_info["chin_y"]
        else:
            # Fallback: estimate from bounding box (add 10% for top of head)
            actual_head_h = int(face_info["h"] * 1.15)
            head_top_y = face_info["y"] - int(face_info["h"] * 0.10)
            chin_y = face_info["y"] + face_info["h"]

        actual_face_w = max(face_info["w"], 1)
        target_face_w = int(pw * face_width_ratio)

        # Use both height and width constraints so the face keeps side breathing room.
        scale_h = target_head_h / max(actual_head_h, 1)
        scale_w = target_face_w / actual_face_w
        scale = min(scale_h, scale_w)

        # Center x of face
        face_cx = face_info.get("eye_x_center", face_info["cx"])

        # In the final passport image, where should the top of the head be?
        top_margin_px = int(ph * top_margin_ratio)

        # Map: head_top_y in source → top_margin_px in dest
        # dest_y = (src_y - head_top_y) * scale + top_margin_px
        # dest_x = (src_x - face_cx) * scale + pw/2

        # Crop window in source coords
        src_w = pw / scale
        src_h = ph / scale

        src_x_center = face_cx
        src_y_top = head_top_y - (top_margin_px / scale)

        src_left = src_x_center - src_w / 2
        src_top = src_y_top
        src_right = src_left + src_w
        src_bottom = src_top + src_h

        # Expand canvas if crop goes outside image bounds
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

        # Crop
        crop_box = (
            max(0, int(src_left)),
            max(0, int(src_top)),
            min(img.width, int(src_right)),
            min(img.height, int(src_bottom)),
        )
        cropped = img.crop(crop_box)

        # Resize to exact passport pixel dimensions
        passport = cropped.resize((pw, ph), Image.LANCZOS)

        return passport

    # ------------------------------------------------------------------
    # Step 4 – Layout multiple copies on A4 canvas
    # ------------------------------------------------------------------
    def _layout_a4(
        self,
        photo: Image.Image,
        copies: int,
        pw: int,
        ph: int,
        bg_rgb: tuple,
    ) -> Image.Image:
        a4 = Image.new("RGB", (A4_W_PX, A4_H_PX), (255, 255, 255))

        usable_w = A4_W_PX - 2 * MARGIN_PX
        usable_h = A4_H_PX - 2 * MARGIN_PX

        cols = max(1, usable_w // (pw + GAP_PX))
        rows = max(1, usable_h // (ph + GAP_PX))
        max_copies = cols * rows
        actual_copies = min(copies, max_copies)

        # Center the grid
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

        # Draw cut lines
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

    # ------------------------------------------------------------------
    # Step 5 – Generate PDF
    # ------------------------------------------------------------------
    def _generate_pdf(self, a4_img: Image.Image) -> io.BytesIO:
        img_bytes = io.BytesIO()
        a4_img.save(img_bytes, format="JPEG", quality=95, dpi=(DPI, DPI))
        img_bytes.seek(0)

        pdf_bytes = io.BytesIO()
        c = rl_canvas.Canvas(pdf_bytes, pagesize=A4)
        a4_w_pt, a4_h_pt = A4  # points
        image_reader = ImageReader(img_bytes)

        # Draw the image filling the A4 page
        c.drawImage(
            image_reader,
            0, 0,
            width=a4_w_pt,
            height=a4_h_pt,
            preserveAspectRatio=False,
        )
        c.showPage()
        c.save()
        pdf_bytes.seek(0)
        return pdf_bytes
