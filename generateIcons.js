const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const SOURCE = path.join(__dirname, "public", "logo1.png");
const OUT_DIR = path.join(__dirname, "public", "icons");
const BG_COLOR = { r: 10, g: 10, b: 10, alpha: 1 }; // #0a0a0a

const SIZES = [72, 96, 128, 144, 152, 180, 192, 384, 512];

async function generate() {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  const meta = await sharp(SOURCE).metadata();
  console.log(`Source: ${meta.width}x${meta.height}`);

  for (const size of SIZES) {
    // Resize logo to 80% of target size, center on background
    const logoSize = Math.round(size * 0.8);
    const resizedLogo = await sharp(SOURCE)
      .resize(logoSize, logoSize, { fit: "contain", background: BG_COLOR })
      .png()
      .toBuffer();

    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: BG_COLOR,
      },
    })
      .composite([
        {
          input: resizedLogo,
          gravity: "centre",
        },
      ])
      .png()
      .toFile(path.join(OUT_DIR, `icon-${size}.png`));

    console.log(`✓ icon-${size}.png`);
  }

  console.log("\nAll icons generated in /public/icons/");
}

generate().catch(console.error);
