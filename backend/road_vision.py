import cv2
import numpy as np
from typing import Tuple, List, Dict, Any, Optional

def verify_road_surface(img_bgr: np.ndarray) -> Tuple[bool, str, float]:
    """
    Validates whether an uploaded image actually depicts an asphalt or concrete road surface.
    Rejects:
      - Blank / solid color / blurry non-texture images
      - People, selfies, faces (skin tone detection)
      - Indoor rooms, furniture, wallpapers (high saturation / non-road palette)
      - Non-road nature (pure grass, sky, forests)
      - Logos, documents, cartoons, text screenshots
    Returns:
      (is_road: bool, reason: str, asphalt_coverage_pct: float)
    """
    if img_bgr is None or not isinstance(img_bgr, np.ndarray):
        return False, "Failed to decode image into pixel matrix", 0.0

    h, w = img_bgr.shape[:2]
    total_px = h * w
    if h < 64 or w < 64:
        return False, "Image resolution too low for road surface analysis (minimum 64x64 required)", 0.0

    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)

    # 1. Blank / solid color check
    std_dev = float(np.std(gray))
    if std_dev < 10.0:
        return False, "Image is solid or blank with no road texture", 0.0

    # 2. Reject skin tones / portraits / selfies (YCrCb color space)
    ycrcb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2YCrCb)
    skin_mask = (
        (ycrcb[:, :, 1] >= 133) & (ycrcb[:, :, 1] <= 173) &
        (ycrcb[:, :, 2] >= 77) & (ycrcb[:, :, 2] <= 127)
    )
    skin_pct = float(np.sum(skin_mask) / total_px)
    if skin_pct > 0.15:
        return False, f"Human subject / portrait detected ({skin_pct:.0%} skin ratio), not a road", 0.0

    # 3. Reject hyper-saturated graphics, cartoons, nature, or indoor furnishings
    hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)
    sat = hsv[:, :, 1]
    val = hsv[:, :, 2]
    high_sat_pct = float(np.sum(sat > 115) / total_px)
    if high_sat_pct > 0.45:
        return False, "Scene contains high-saturation colors (nature, indoor, or graphics), not asphalt pavement", 0.0

    # 4. Asphalt / Concrete Pavement Profile:
    # Asphalt has low-to-medium saturation (sat <= 80), realistic road luminance (35 <= val <= 215),
    # and balanced R, G, B channels (achromatic difference < 45)
    b, g, r = cv2.split(img_bgr)
    channel_diff = np.abs(r.astype(float) - g.astype(float)) + np.abs(g.astype(float) - b.astype(float))
    asphalt_mask = (sat <= 85) & (val >= 30) & (val <= 215) & (channel_diff < 50)
    asphalt_coverage = float(np.sum(asphalt_mask) / total_px)

    # Road pavement must occupy at least 28% of the image
    if asphalt_coverage < 0.28:
        return False, f"No asphalt or road pavement detected (pavement match: {asphalt_coverage:.0%}, required >= 28%)", asphalt_coverage

    # 5. Road Aggregate Granular Texture Check
    lap_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
    if lap_var < 18.0:
        return False, "Image lacks realistic asphalt gravel or road pavement texture", asphalt_coverage

    return True, f"Road surface verified ({asphalt_coverage * 100:.1f}% pavement coverage)", asphalt_coverage


def detect_road_potholes(img_bgr: np.ndarray) -> Tuple[List[Dict[str, Any]], np.ndarray, float, str]:
    """
    Inspects an image for both road pavement and pothole distress craters.
    Returns:
      (boxes_list, annotated_img, max_confidence, status_message)
    """
    if img_bgr is None:
        return [], img_bgr, 0.0, "Invalid image data"

    # Step 1: Verify Road Surface
    is_road, road_msg, coverage = verify_road_surface(img_bgr)
    if not is_road:
        return [], img_bgr, 0.0, road_msg

    h_orig, w_orig = img_bgr.shape[:2]
    total_px = h_orig * w_orig
    annotated = img_bgr.copy()
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)

    # Step 2: Computer Vision Pothole Extraction
    # Potholes appear as darker cavities, distress depressions, or fractured boundaries on asphalt
    potholes = []

    # Method A: Multiscale Morphological Black Top-Hat
    # Isolates dark depressions against the local textured asphalt background
    k_sizes = [
        max(15, min(65, int(min(h_orig, w_orig) * 0.12))),
        max(25, min(85, int(min(h_orig, w_orig) * 0.20)))
    ]
    
    candidate_boxes = []

    for ks in k_sizes:
        if ks % 2 == 0:
            ks += 1
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (ks, ks))
        blackhat = cv2.morphologyEx(gray, cv2.MORPH_BLACKHAT, kernel)
        
        # Determine adaptive threshold on blackhat response
        p90 = np.percentile(blackhat, 88)
        if p90 > 15:
            _, thresh = cv2.threshold(blackhat, p90, 255, cv2.THRESH_BINARY)
            close_k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
            closed = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, close_k)
            
            cnts, _ = cv2.findContours(closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            min_area = total_px * 0.008  # At least 0.8% of image
            max_area = total_px * 0.65   # At most 65% of image
            
            for c in cnts:
                area = cv2.contourArea(c)
                if min_area <= area <= max_area:
                    x, y, w, h = cv2.boundingRect(c)
                    aspect = float(w) / h if h > 0 else 0
                    if 0.25 <= aspect <= 4.0:
                        # Check local edge density and cavity depth
                        roi_gray = gray[y:y+h, x:x+w]
                        edges_roi = cv2.Canny(roi_gray, 40, 130)
                        edge_pct = np.sum(edges_roi > 0) / (w * h)
                        
                        # Compare ROI brightness to surrounding road
                        road_mean = np.mean(gray)
                        roi_mean = np.mean(roi_gray)
                        contrast = max(0, (road_mean - roi_mean) / (road_mean + 1e-5))
                        
                        conf = min(0.96, max(0.65, 0.70 + (contrast * 0.4) + (edge_pct * 0.8)))
                        candidate_boxes.append([x, y, w, h, conf])

    # Method B: Relative Local Pavement Depression Mask
    hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)
    sat = hsv[:, :, 1]
    val = hsv[:, :, 2]
    asphalt_mask = (sat <= 85) & (val >= 25) & (val <= 215)
    
    if np.sum(asphalt_mask) > total_px * 0.20:
        road_vals = gray[asphalt_mask]
        mean_road = np.mean(road_vals)
        std_road = np.std(road_vals)
        
        # Depression threshold
        dep_thresh = max(15, mean_road - 0.55 * std_road)
        dep_mask = (gray < dep_thresh) & asphalt_mask
        
        dep_k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9))
        dep_closed = cv2.morphologyEx(dep_mask.astype(np.uint8) * 255, cv2.MORPH_CLOSE, dep_k)
        
        dep_cnts, _ = cv2.findContours(dep_closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        min_area = total_px * 0.010
        max_area = total_px * 0.60
        
        for c in dep_cnts:
            area = cv2.contourArea(c)
            if min_area <= area <= max_area:
                x, y, w, h = cv2.boundingRect(c)
                aspect = float(w) / h if h > 0 else 0
                if 0.30 <= aspect <= 3.5:
                    candidate_boxes.append([x, y, w, h, 0.82])

    # Apply Non-Maximum Suppression (NMS) on candidates
    if candidate_boxes:
        boxes_for_nms = [[b[0], b[1], b[2], b[3]] for b in candidate_boxes]
        confs_for_nms = [b[4] for b in candidate_boxes]
        indices = cv2.dnn.NMSBoxes(boxes_for_nms, confs_for_nms, 0.60, 0.40)
        
        if len(indices) > 0:
            flat_indices = indices.flatten() if hasattr(indices, 'flatten') else indices
            for i in flat_indices:
                x, y, w, h = boxes_for_nms[i]
                conf = confs_for_nms[i]
                xmin = max(0, min(x, w_orig - 1))
                ymin = max(0, min(y, h_orig - 1))
                xmax = max(1, min(x + w, w_orig))
                ymax = max(1, min(y + h, h_orig))
                
                # Draw on annotated image
                cv2.rectangle(annotated, (xmin, ymin), (xmax, ymax), (0, 230, 180), 2)
                label_str = f"Pothole {conf:.2f}"
                cv2.putText(annotated, label_str, (xmin, max(15, ymin - 6)),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.52, (0, 230, 180), 2)
                
                potholes.append({
                    "bbox": [xmin, ymin, xmax, ymax],
                    "confidence": round(float(conf), 3),
                    "class": "Pothole"
                })

    if not potholes:
        return [], img_bgr, 0.0, "No pothole detected: Road surface is visible, but no structural crater or road damage was found."

    max_conf = max(p["confidence"] for p in potholes)
    return potholes, annotated, max_conf, f"Verified: {len(potholes)} pothole(s) detected on road surface."
