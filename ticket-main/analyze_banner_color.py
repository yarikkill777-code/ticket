from PIL import Image
import sys

path = 'video_frame_5172ms.jpg'
img = Image.open(path).convert('RGB')
w,h = img.size

# crop likely banner area (approx 34%-44% height)
band = img.crop((int(w*0.2), int(h*0.36), int(w*0.8), int(h*0.44)))
# find non-white/dominant non-background colors
pixels = list(band.getdata())
# filter out near-white
filtered = [p for p in pixels if not (p[0]>240 and p[1]>240 and p[2]>240)]

from collections import Counter
if not filtered:
    print('No non-white colors found')
    sys.exit(0)

ctr = Counter(filtered)
most = ctr.most_common(6)
print('Top banner colors:')
for rgb,count in most:
    hexc = '#%02x%02x%02x' % rgb
    print(hexc, count)

# crop lower middle area for timer gradient sampling (approx 62%-78% height)
timer = img.crop((int(w*0.2), int(h*0.6), int(w*0.8), int(h*0.7)))
filtered2 = [p for p in list(timer.getdata()) if not (p[0]>240 and p[1]>240 and p[2]>240)]
ctr2 = Counter(filtered2)
print('\nTop timer colors:')
for rgb,count in ctr2.most_common(6):
    print('#%02x%02x%02x' % rgb, count)
