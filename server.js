require("dotenv").config();
const express = require("express");
const multer = require("multer");
const QRCode = require("qrcode");
const path = require("path");
const crypto = require("crypto");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cloudinary = require("cloudinary").v2;
const AdmZip = require("adm-zip");
const https = require("https");
const http = require("http");

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3000;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,
  })
);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: "Too many uploads. Please try again after 15 minutes." },
});
const apiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 60,
  message: { error: "Too many requests. Please try again shortly." },
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024, files: 101 },
  fileFilter: (req, file, cb) => {
    const allowed = file.mimetype.startsWith("image/") || file.mimetype === "application/pdf" || file.mimetype.startsWith("audio/");
    if (!allowed) {
      return cb(new Error(`"${file.originalname}" is not allowed`));
    }
    cb(null, true);
  },
});

function getResourceType(mimetype) {
  if (mimetype.startsWith("image/")) return "image";
  if (mimetype.startsWith("audio/")) return "video";
  return "raw";
}

function getSimpleType(mimetype) {
  if (mimetype.startsWith("image/")) return "image";
  if (mimetype === "application/pdf") return "pdf";
  if (mimetype.startsWith("audio/")) return "audio";
  return "other";
}

function uploadFileToCloudinary(buffer, resourceType, originalName) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: resourceType,
        folder: "qr-file-share/files",
        use_filename: true,
        unique_filename: true,
        filename_override: originalName,
      },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    stream.end(buffer);
  });
}

function uploadMetadata(id, metadata) {
  return new Promise((resolve, reject) => {
    const buffer = Buffer.from(JSON.stringify(metadata));
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "raw", public_id: `qr-file-share/meta/${id}`, overwrite: true },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    stream.end(buffer);
  });
}

function encryptFilesWithPin(filesArray, pin) {
  const salt = crypto.randomBytes(16);
  const key = crypto.scryptSync(pin, salt, 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(filesArray), "utf8"), cipher.final()]);
  return { salt: salt.toString("hex"), iv: iv.toString("hex"), encryptedData: encrypted.toString("hex") };
}

function decryptFilesWithPin(payload, pin) {
  const salt = Buffer.from(payload.salt, "hex");
  const iv = Buffer.from(payload.iv, "hex");
  const key = crypto.scryptSync(pin, salt, 32);
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(payload.encryptedData, "hex")),
    decipher.final(),
  ]);
  return JSON.parse(decrypted.toString("utf8"));
}

function isExpired(data) {
  return !!data.expiresAt && new Date(data.expiresAt).getTime() < Date.now();
}

const sseClients = new Map();
const viewCounts = new Map();

function notifyGalleryViewed(id) {
  const newCount = (viewCounts.get(id) || 0) + 1;
  viewCounts.set(id, newCount);
  const listeners = sseClients.get(id);
  if (!listeners) return;
  const payload = JSON.stringify({ type: "view", count: newCount, time: new Date().toISOString() });
  listeners.forEach((clientRes) => clientRes.write(`data: ${payload}\n\n`));
}

const pinAttempts = new Map();
const MAX_PIN_ATTEMPTS = 5;
const LOCK_DURATION_MS = 5 * 60 * 1000;

app.post("/upload", uploadLimiter, upload.fields([
  { name: "files", maxCount: 100 },
  { name: "audio", maxCount: 1 }
]), async (req, res) => {
  try {
    const uploadedFilesRaw = req.files?.["files"] || [];
    const audioFileRaw = req.files?.["audio"] ? req.files["audio"][0] : null;

    if (uploadedFilesRaw.length === 0 && !audioFileRaw) {
      return res.status(400).json({ error: "No files or audio found" });
    }

    const pin = (req.body.pin || "").trim();
    if (pin && !/^\d{4,8}$/.test(pin)) {
      return res.status(400).json({ error: "PIN must be a 4 to 8 digit number" });
    }

    const pinHint = (req.body.pinHint || "").trim().slice(0, 100);
    const selfDestruct = req.body.selfDestruct === "true" || req.body.selfDestruct === true;
    const qrColor = req.body.qrColor || "#4f46e5";

    const validExpiryDays = ["0", "1", "7", "30"];
    const expiryDaysRaw = req.body.expiryDays || "0";
    const expiryDays = validExpiryDays.includes(expiryDaysRaw) ? Number(expiryDaysRaw) : 0;
    const expiresAt = expiryDays > 0 ? new Date(Date.now() + expiryDays * 86400000).toISOString() : null;

    const caption = (req.body.caption || "").trim().slice(0, 300);

    let allFilesToUpload = [...uploadedFilesRaw];
    let audioFileObj = null;

    if (audioFileRaw) {
      audioFileObj = audioFileRaw;
    }

    const uploadPromises = allFilesToUpload.map(async (file) => {
      const resourceType = getResourceType(file.mimetype);
      const result = await uploadFileToCloudinary(file.buffer, resourceType, file.originalname);
      return {
        url: result.secure_url,
        name: file.originalname,
        type: getSimpleType(file.mimetype),
        size: file.size,
      };
    });

    let uploadedAudioUrl = null;
    if (audioFileObj) {
      const audioRes = await uploadFileToCloudinary(audioFileObj.buffer, "video", audioFileObj.originalname);
      uploadedAudioUrl = audioRes.secure_url;
    }

    const uploadedFiles = await Promise.all(uploadPromises);
    const imageCount = uploadedFiles.filter((f) => f.type === "image").length;
    const pdfCount = uploadedFiles.filter((f) => f.type === "pdf").length;

    const id = crypto.randomBytes(8).toString("hex");
    const baseMeta = {
      id,
      createdAt: new Date().toISOString(),
      expiresAt,
      caption,
      totalFiles: uploadedFiles.length,
      imageCount,
      pdfCount,
      audioUrl: uploadedAudioUrl,
      pinHint,
      selfDestruct,
    };

    const metadata = pin
      ? { ...baseMeta, pinProtected: true, ...encryptFilesWithPin(uploadedFiles, pin) }
      : { ...baseMeta, pinProtected: false, files: uploadedFiles };

    await uploadMetadata(id, metadata);

    const galleryUrl = `${req.protocol}://${req.get("host")}/gallery/${id}`;
    const qrDataUrl = await QRCode.toDataURL(galleryUrl, {
      width: 400,
      margin: 2,
      color: { dark: qrColor, light: "#ffffff" }
    });

    res.json({
      success: true,
      galleryId: id,
      galleryUrl,
      qrCode: qrDataUrl,
      total: uploadedFiles.length,
      imageCount,
      pdfCount,
      pinProtected: !!pin,
      expiresAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Upload failed" });
  }
});

app.get("/gallery/:id", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "gallery.html"));
});

app.get("/api/gallery/:id/download-zip", apiLimiter, async (req, res) => {
  try {
    const data = await fetchMetadata(req.params.id);
    if (!data) return res.status(404).send("Gallery not found");
    if (isExpired(data)) return res.status(410).send("Link has expired");
    if (data.pinProtected) return res.status(400).send("Direct ZIP download is not available for PIN protected galleries");

    const filesList = data.files;
    if (!filesList || filesList.length === 0) return res.status(400).send("No files available");

    const zip = new AdmZip();
    let downloaded = 0;

    filesList.forEach((file) => {
      const protocol = file.url.startsWith("https") ? https : http;
      protocol.get(file.url, (response) => {
        let chunks = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () => {
          zip.addFile(file.name, Buffer.concat(chunks));
          downloaded++;
          if (downloaded === filesList.length) {
            const zipBuffer = zip.toBuffer();
            res.set("Content-Type", "application/zip");
            res.set("Content-Disposition", "attachment; filename=CloudVault_Files.zip");
            res.send(zipBuffer);
          }
        });
      }).on("error", () => {
        downloaded++;
      });
    });
  } catch (err) {
    res.status(500).send("ZIP download failed");
  }
});

app.get("/api/gallery/:id/events", (req, res) => {
  const { id } = req.params;

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  res.write(`data: ${JSON.stringify({ type: "connected", count: viewCounts.get(id) || 0 })}\n\n`);

  if (!sseClients.has(id)) sseClients.set(id, new Set());
  sseClients.get(id).add(res);

  const keepAlive = setInterval(() => res.write(": ping\n\n"), 25000);

  req.on("close", () => {
    clearInterval(keepAlive);
    const set = sseClients.get(id);
    if (set) {
      set.delete(res);
      if (set.size === 0) sseClients.delete(id);
    }
  });
});

async function fetchMetadata(id) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const metaUrl = `https://res.cloudinary.com/${cloudName}/raw/upload/qr-file-share/meta/${id}.json`;
  const response = await fetch(metaUrl);
  if (!response.ok) return null;
  return response.json();
}

app.get("/api/gallery/:id", apiLimiter, async (req, res) => {
  try {
    const data = await fetchMetadata(req.params.id);
    if (!data) return res.status(404).json({ error: "Gallery not found" });
    if (isExpired(data)) return res.status(410).json({ expired: true, error: "Link has expired" });

    notifyGalleryViewed(req.params.id);

    if (data.pinProtected) {
      return res.json({
        pinProtected: true,
        totalFiles: data.totalFiles,
        imageCount: data.imageCount,
        pdfCount: data.pdfCount,
        expiresAt: data.expiresAt,
        caption: data.caption || "",
        pinHint: data.pinHint || "",
      });
    }

    const responsePayload = {
      pinProtected: false,
      totalFiles: data.totalFiles,
      imageCount: data.imageCount,
      pdfCount: data.pdfCount,
      expiresAt: data.expiresAt,
      caption: data.caption || "",
      audioUrl: data.audioUrl || null,
      files: data.files,
    };

    res.json(responsePayload);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load gallery" });
  }
});

app.post("/api/gallery/:id/verify", apiLimiter, async (req, res) => {
  try {
    const { id } = req.params;
    const { pin } = req.body;
    if (!pin) return res.status(400).json({ error: "PIN is required" });

    const attempt = pinAttempts.get(id) || { count: 0, lockedUntil: 0 };
    if (Date.now() < attempt.lockedUntil) {
      const mins = Math.ceil((attempt.lockedUntil - Date.now()) / 60000);
      return res.status(429).json({ error: `Too many incorrect attempts. Please try again in ${mins} minute(s).` });
    }

    const data = await fetchMetadata(id);
    if (!data) return res.status(404).json({ error: "Gallery not found" });
    if (isExpired(data)) return res.status(410).json({ expired: true, error: "Link has expired" });
    if (!data.pinProtected) return res.status(400).json({ error: "This gallery is not PIN protected" });

    try {
      const files = decryptFilesWithPin(data, pin);
      pinAttempts.delete(id);
      return res.json({ 
        success: true, 
        files, 
        audioUrl: data.audioUrl || null,
        caption: data.caption || "" 
      });
    } catch (e) {
      attempt.count += 1;
      if (attempt.count >= MAX_PIN_ATTEMPTS) {
        attempt.lockedUntil = Date.now() + LOCK_DURATION_MS;
        attempt.count = 0;
        pinAttempts.set(id, attempt);
        return res.status(429).json({ error: "Too many incorrect attempts. Locked for 5 minutes." });
      }
      pinAttempts.set(id, attempt);
      const left = MAX_PIN_ATTEMPTS - attempt.count;
      return res.status(401).json({ error: `Incorrect PIN. ${left} attempt${left > 1 ? "s" : ""} remaining.` });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "A file exceeds the 50MB limit. Please try a smaller file." });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({ error: "Maximum 100 files allowed per upload." });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err) return res.status(400).json({ error: err.message || "Something went wrong" });
  next();
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server Successfully Started: http://localhost:${PORT}`);
  });
}

module.exports = app;