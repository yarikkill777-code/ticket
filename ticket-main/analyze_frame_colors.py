from PIL import Image
from collections import Counter
import sys

path = 'video_frame_5172ms.jpg'
if len(sys.argv) > 1:
    path = sys.argv[1]

img = Image.open(path).convert('RGBA')
# crop central horizontal band where banner likely is (approx middle 35%-55% height)
w, h = img.size
band = img.crop((0, int(h*0.35), w, int(h*0.55)))

# resize to speed up
band = band.resize((200, int(band.size[1]*200/band.size[0])), Image.LANCZOS)

# quantize to 8 colors
pal = band.convert('P', palette=Image.ADAPTIVE, colors=8)
palette = pal.getpalette()
color_counts = sorted(pal.getcolors(), reverse=True)

colors = []
for count, idx in color_counts:
    r = palette[idx*3]
    g = palette[idx*3+1]
    b = palette[idx*3+2]
    colors.append((count, (r,g,b)))

# print hex with percentages
total = sum(c for c,_ in colors)
print('Top colors in band:')
for count, rgb in colors:
    hexc = '#%02x%02x%02x' % rgb
    perc = count/total*100
    print(f'{hexc} - {perc:.1f}%')

# also print overall dominant color
small = img.resize((50,50))
ctr = Counter(small.getdata())
most = ctr.most_common(5)
print('\nTop overall colors:')
for rgb,count in most:
    hexc = '#%02x%02x%02x' % rgb[:3]
    print(hexc, count)
