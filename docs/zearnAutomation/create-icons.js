const fs = require('fs');

// PNG generator with rounded badge and Z letter
function createPNG(size, bgR, bgG, bgB, fgR, fgG, fgB) {
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crcTable[n] = c;
  }

  function crc32(buf) {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function adler32(buf) {
    let a = 1, b = 0;
    for (let i = 0; i < buf.length; i++) {
      a = (a + buf[i]) % 65521;
      b = (b + a) % 65521;
    }
    return (b << 16) | a;
  }

  // Check if point is inside rounded rectangle
  function isInsideRoundedRect(x, y, size, radius) {
    const cx = size / 2;
    const cy = size / 2;
    const hw = size / 2 - 1; // half width
    const hh = size / 2 - 1; // half height
    const r = radius;

    // Normalize coordinates relative to center
    const px = x - cx;
    const py = y - cy;

    // Check corners
    if (Math.abs(px) > hw - r && Math.abs(py) > hh - r) {
      // In corner region - check circle
      const cornerX = (hw - r) * Math.sign(px);
      const cornerY = (hh - r) * Math.sign(py);
      const dist = Math.sqrt((px - cornerX) ** 2 + (py - cornerY) ** 2);
      return dist <= r;
    }

    // Check if inside rectangle
    return Math.abs(px) <= hw && Math.abs(py) <= hh;
  }

  // Create pixel grid with transparency
  const pixels = [];
  const radius = Math.floor(size * 0.2); // 20% radius for rounded corners

  for (let y = 0; y < size; y++) {
    const row = [];
    for (let x = 0; x < size; x++) {
      if (isInsideRoundedRect(x, y, size, radius)) {
        row.push([bgR, bgG, bgB, 255]); // Purple background, opaque
      } else {
        row.push([0, 0, 0, 0]); // Transparent
      }
    }
    pixels.push(row);
  }

  // Draw "Z" on the grid
  const margin = Math.floor(size * 0.22);
  const thickness = Math.max(2, Math.floor(size * 0.16));
  const left = margin;
  const right = size - margin - 1;
  const top = margin;
  const bottom = size - margin - 1;

  // Helper to set pixel if inside badge
  function setPixel(x, y) {
    if (x >= 0 && x < size && y >= 0 && y < size) {
      if (isInsideRoundedRect(x, y, size, radius)) {
        pixels[y][x] = [fgR, fgG, fgB, 255];
      }
    }
  }

  // Draw top horizontal bar
  for (let y = top; y < top + thickness && y < size; y++) {
    for (let x = left; x <= right && x < size; x++) {
      setPixel(x, y);
    }
  }

  // Draw bottom horizontal bar
  for (let y = bottom - thickness + 1; y <= bottom; y++) {
    for (let x = left; x <= right && x < size; x++) {
      setPixel(x, y);
    }
  }

  // Draw diagonal (from top-right to bottom-left)
  const height = bottom - top;
  const width = right - left;
  for (let i = 0; i <= height; i++) {
    const y = top + i;
    const xCenter = right - Math.floor((i / height) * width);
    const t = Math.floor(thickness / 2);
    for (let dx = -t; dx <= t; dx++) {
      setPixel(xCenter + dx, y);
    }
  }

  // Create raw image data (RGBA)
  const rawData = [];
  for (let y = 0; y < size; y++) {
    rawData.push(0); // Filter type: None
    for (let x = 0; x < size; x++) {
      rawData.push(...pixels[y][x]);
    }
  }
  const rawBuf = Buffer.from(rawData);

  // Compress with zlib (store only)
  const blocks = [];
  const BLOCK_SIZE = 65535;
  for (let i = 0; i < rawBuf.length; i += BLOCK_SIZE) {
    const chunk = rawBuf.slice(i, Math.min(i + BLOCK_SIZE, rawBuf.length));
    const isLast = i + BLOCK_SIZE >= rawBuf.length;
    blocks.push(Buffer.from([isLast ? 0x01 : 0x00]));
    const len = chunk.length;
    blocks.push(Buffer.from([len & 0xff, (len >> 8) & 0xff, ~len & 0xff, (~len >> 8) & 0xff]));
    blocks.push(chunk);
  }

  const deflateData = Buffer.concat(blocks);
  const adler = adler32(rawBuf);
  const zlibData = Buffer.concat([
    Buffer.from([0x78, 0x01]),
    deflateData,
    Buffer.from([(adler >> 24) & 0xff, (adler >> 16) & 0xff, (adler >> 8) & 0xff, adler & 0xff])
  ]);

  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk (RGBA = color type 6)
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);
  ihdrData.writeUInt32BE(size, 4);
  ihdrData[8] = 8;   // bit depth
  ihdrData[9] = 6;   // color type (RGBA)
  ihdrData[10] = 0;  // compression
  ihdrData[11] = 0;  // filter
  ihdrData[12] = 0;  // interlace

  const ihdrType = Buffer.from('IHDR');
  const ihdrCrc = crc32(Buffer.concat([ihdrType, ihdrData]));
  const ihdr = Buffer.concat([
    Buffer.from([0, 0, 0, 13]),
    ihdrType,
    ihdrData,
    Buffer.from([(ihdrCrc >> 24) & 0xff, (ihdrCrc >> 16) & 0xff, (ihdrCrc >> 8) & 0xff, ihdrCrc & 0xff])
  ]);

  // IDAT chunk
  const idatType = Buffer.from('IDAT');
  const idatLen = Buffer.alloc(4);
  idatLen.writeUInt32BE(zlibData.length, 0);
  const idatCrc = crc32(Buffer.concat([idatType, zlibData]));
  const idat = Buffer.concat([
    idatLen,
    idatType,
    zlibData,
    Buffer.from([(idatCrc >> 24) & 0xff, (idatCrc >> 16) & 0xff, (idatCrc >> 8) & 0xff, idatCrc & 0xff])
  ]);

  // IEND chunk
  const iendType = Buffer.from('IEND');
  const iendCrc = crc32(iendType);
  const iend = Buffer.concat([
    Buffer.from([0, 0, 0, 0]),
    iendType,
    Buffer.from([(iendCrc >> 24) & 0xff, (iendCrc >> 16) & 0xff, (iendCrc >> 8) & 0xff, iendCrc & 0xff])
  ]);

  return Buffer.concat([signature, ihdr, idat, iend]);
}

// Purple background: #7B2D8E (123, 45, 142)
// White text: #FFFFFF (255, 255, 255)
const bgR = 123, bgG = 45, bgB = 142;
const fgR = 255, fgG = 255, fgB = 255;

// Create badge icons with Z
const sizes = [16, 48, 128];
sizes.forEach(size => {
  const png = createPNG(size, bgR, bgG, bgB, fgR, fgG, fgB);
  const filename = `icon${size}.png`;
  fs.writeFileSync(filename, png);
  console.log(`Created ${filename}`);
});

console.log('Done! Purple badge icons with white Z created.');
