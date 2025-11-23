#!/bin/bash
# Create money-themed icons for Chrome extension
# Requires ImageMagick (install with: brew install imagemagick)

cd "$(dirname "$0")"

# Check if ImageMagick is installed
if command -v magick &> /dev/null; then
    CMD="magick"
elif command -v convert &> /dev/null; then
    CMD="convert"
else
    echo "ImageMagick not found. Please install with: brew install imagemagick"
    exit 1
fi

# Create icons with $ symbol on green background
for size in 16 48 128; do
    fontsize=$((size * 7 / 10))
    $CMD -size ${size}x${size} xc:'#22c55e' \
        -gravity center \
        -fill white \
        -font Helvetica-Bold \
        -pointsize $fontsize \
        -annotate 0 '$' \
        "icon${size}.png"
    echo "Created icon${size}.png (${size}x${size})"
done

echo "Done! Money icons created."
