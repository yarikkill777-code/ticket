import os
import cv2
from pathlib import Path

WORKDIR = Path(__file__).resolve().parent
VIDEO = WORKDIR / 'video.mp4'
OUT = WORKDIR

cap = cv2.VideoCapture(str(VIDEO))
if not cap.isOpened():
    print('ERROR: cannot open video')
    raise SystemExit(1)

frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
fps = cap.get(cv2.CAP_PROP_FPS) or 25.0

timestamps = [0.5, (frame_count/fps)/2 if frame_count>0 else 1.5, max((frame_count/fps)-0.5, 0.5)]

saved = []
for t in timestamps:
    frame_num = int(t * fps)
    cap.set(cv2.CAP_PROP_POS_FRAMES, frame_num)
    ret, frame = cap.read()
    if not ret:
        continue
    out_path = OUT / f'video_frame_{int(t*1000)}ms.jpg'
    cv2.imwrite(str(out_path), frame)
    saved.append(str(out_path))

cap.release()

if saved:
    print('Saved frames:')
    for p in saved:
        print(p)
else:
    print('No frames saved')
