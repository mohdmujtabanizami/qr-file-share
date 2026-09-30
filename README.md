<div align="center">

# 📱 QR File Share — Secure Multi-File Sharing

**Upload multiple photos & PDFs → Generate one QR Code → Share your files securely from anywhere.**

PIN protection, automatic expiry, encrypted storage, personal messages, real-time view notifications, and a responsive gallery — all in one simple file-sharing application.

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js\&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-Backend-000000?logo=express\&logoColor=white)](https://expressjs.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Cloud%20Storage-3448C5?logo=cloudinary\&logoColor=white)](https://cloudinary.com/)
[![QR Code](https://img.shields.io/badge/QR%20Code-Sharing-000000?logo=qrcode\&logoColor=white)](https://github.com/)
[![Security](https://img.shields.io/badge/Security-AES--256%20%7C%20Helmet-green)](https://helmetjs.github.io/)
[![Deployment](https://img.shields.io/badge/Deploy-Render-46E3B7?logo=render\&logoColor=black)](https://render.com/)

**[🚀 Upload & Share](#-how-it-works)** · **[🔐 Security](#-security--robustness)** · **[⚙️ Setup](#-getting-started)**

</div>

---

## 📌 About the Project

**QR File Share** is a web-based file-sharing application that allows users to upload multiple **photos and PDF files**, generate a single QR code for the entire collection, and share the resulting gallery with anyone.

Instead of sending files individually, users can create one shareable gallery and distribute it through a **QR code, link, WhatsApp, or any other supported sharing application**.

The application also provides optional **PIN protection**, **automatic link expiry**, **personal messages**, **Cloudinary storage**, and a real-time **"Seen" notification** that tells the sender when the gallery has been opened.

> 💡 **Simple workflow:** Upload → Secure → Generate QR → Share → Scan → View

---

## ✨ Features

### 📁 Multiple File Upload

Upload up to **100 files at once**.

Supported formats:

* 🖼️ Photos / Images
* 📄 PDF documents

Files can be selected normally or added using **drag & drop**.

Each selected file gets a thumbnail/preview before uploading.

---

### 🖼️ File Preview & Management

Before uploading:

* Preview selected files
* View thumbnails
* Remove unwanted files using the `×` button
* Validate supported file types
* Upload multiple files together

This allows users to verify their files before creating the gallery.

---

### 📊 Real-Time Upload Progress

A live upload progress indicator displays the upload percentage while files are being transferred.

This makes it easier to track large or multiple file uploads.

---

### 🔒 PIN Protection

Protect a gallery with an optional **4–8 digit PIN**.

When PIN protection is enabled:

* The gallery remains locked
* Files are not displayed before authentication
* Users must enter the correct PIN
* PIN-protected gallery data is stored using **AES-256 encryption**
* Incorrect PIN attempts are monitored

> 🔐 For stronger privacy, use a 6–8 digit PIN instead of a 4-digit PIN.

---

### ⏳ Automatic Link Expiry

Set an optional expiration period for a gallery:

* ♾️ Never
* 📅 1 Day
* 📅 7 Days
* 📅 30 Days

After the selected expiry time, the gallery automatically becomes unavailable.

> **Note:** Expiry closes access to the gallery, but uploaded files are not automatically deleted from Cloudinary.

---

### 💌 Personal Message

Add an optional message that appears at the top of the gallery.

Example:

> **"Happy Birthday! 🎉"**

This makes the file-sharing experience more personal when sending photos, documents, invitations, or other files.

---

### 📱 QR Code Sharing

After uploading, the application generates a QR code for the gallery.

The recipient can simply:

**Scan QR → Open Gallery → Enter PIN if required → View Files**

No separate application installation is required.

---

### ⬇️ QR Code Download

Download the generated QR code as an image and use it anywhere:

* Print it
* Send it through WhatsApp
* Add it to invitations
* Share it through social media
* Keep it for later

---

### 🔗 Copy Gallery Link

Copy the complete gallery URL with one click.

The link can then be shared through any messaging or communication platform.

---

### 📤 Native Share Support

Use the device's native sharing menu to share the gallery directly with:

* WhatsApp
* Telegram
* Messages
* Email
* Other supported applications

---

### 🔴 Real-Time "Seen" Notification

The sender can receive a real-time notification when someone opens the shared gallery.

For example:

> 🔴 **Someone saw it!**

The notification works without refreshing the page while the upload page remains open.

This uses a live connection between the sender's browser and server.

---

### 🖼️ Responsive Gallery

The recipient sees a dedicated gallery page containing:

* Sender's personal message
* Photo grid
* PDF list
* PIN unlock screen when enabled
* Expiry status when applicable

Photos can be opened in a full-screen lightbox.

---

### 🔍 Photo Lightbox

Click any photo to open it in full-screen mode.

Users can:

* Browse photos
* Go to next/previous image
* Use keyboard arrow keys
* View images without leaving the gallery

---

### 🌙 Dark Mode

A built-in dark mode toggle is available from the top-right corner of the interface.

---

## 🔐 Security & Robustness

The application includes multiple security mechanisms to protect shared files and prevent abuse.

### 🔢 PIN Brute-Force Protection

After **5 incorrect PIN attempts**, the gallery enters a temporary **5-minute lockout**.

This helps prevent repeated PIN guessing.

---

### 🚦 Rate Limiting

The server applies temporary restrictions when there are excessive:

* Upload requests
* PIN verification requests

This helps reduce automated abuse.

---

### 🛡️ Helmet Security Headers

The application uses **Helmet security headers** to apply common web-security best practices.

---

### 📄 Server-Side File Validation

File types are validated on the server as well as during the upload process.

Only supported:

* Images
* PDFs

are accepted.

---

### 🔐 AES-256 Encryption

PIN-protected gallery data is stored using **AES-256 encryption** on Cloudinary.

The protected gallery data cannot simply be opened directly through a Cloudinary URL.

---

## ⚠️ Security & System Limitations

### 4-Digit PIN

A 4-digit PIN has only **10,000 possible combinations**.

It is suitable for casual privacy but should not be considered bank-level security.

For stronger protection, use a **6–8 digit PIN**.

### Lockout Persistence

The PIN lockout state is stored in server memory.

Therefore, restarting the server resets the current lockout state.

### Expired Files

When a gallery expires, access to the gallery is closed.

However, the original files are **not automatically deleted from Cloudinary**.

Automatic deletion can be added using a Cloudinary deletion integration.

### Live Seen Notification

The real-time "Seen" notification works only while the upload page remains open.

Closing or reloading the browser tab breaks the live connection.

Also, the system currently cannot distinguish between the sender and another person opening the gallery. Therefore, reopening your own gallery link will also count as a view.

---

## 🛠️ Tech Stack

| Layer                | Technology                       |
| -------------------- | -------------------------------- |
| **Runtime**          | Node.js 18+                      |
| **Backend**          | Node.js · Express.js             |
| **File Storage**     | Cloudinary                       |
| **Security**         | AES-256 · Helmet · Rate Limiting |
| **File Validation**  | Server-side MIME/type validation |
| **Sharing**          | QR Code · Shareable Gallery URL  |
| **Real-Time Events** | Live browser-server connection   |
| **Frontend**         | HTML · CSS · JavaScript          |
| **Deployment**       | Render                           |
| **Development**      | Visual Studio Code               |

---

## 🎯 Project Highlights

| Feature              | Implementation                |
| -------------------- | ----------------------------- |
| 📁 Multi-File Upload | Up to 100 files               |
| 🖼️ Supported Files  | Images + PDFs                 |
| 📊 Upload Progress   | Real-time percentage          |
| 🔒 PIN Protection    | 4–8 digit PIN                 |
| 🔐 Encryption        | AES-256                       |
| ⏳ Expiry             | Never / 1 / 7 / 30 Days       |
| ☁️ Cloud Storage     | Cloudinary                    |
| 📱 QR Sharing        | One QR per gallery            |
| 🔗 Link Sharing      | Copyable gallery URL          |
| 📤 Native Sharing    | Device share menu             |
| 🔴 View Detection    | Real-time "Seen" notification |
| 🌙 Dark Mode         | Built-in                      |
| 🖼️ Lightbox         | Full-screen image viewer      |
| 🛡️ Security Headers | Helmet                        |
| 🚦 Abuse Protection  | Rate limiting                 |

---

## 🔄 How It Works

```text
┌──────────────────────┐
│   Select Files       │
│  Photos + PDFs       │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ Preview & Manage     │
│ Remove unwanted      │
│ files if required    │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ Optional Security    │
│ PIN + Expiry         │
│ + Personal Message   │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ Upload to Cloudinary │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ Generate One QR Code │
│ + Gallery Link       │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ Share QR / Link      │
│ WhatsApp / Apps      │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ Scan QR Code         │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ PIN Unlock           │
│ if protection on     │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│      Gallery         │
│ Photos + PDFs        │
└──────────────────────┘
```

---

## ☁️ Cloudinary Setup

This project uses **Cloudinary** to store uploaded files.

### 1. Create a Cloudinary Account

Create a free account on:

https://cloudinary.com

From the Cloudinary dashboard, obtain:

* Cloud Name
* API Key
* API Secret

---

## 🚀 Getting Started

### Prerequisites

Make sure you have:

* Node.js **18 or newer**
* npm
* Visual Studio Code
* A Cloudinary account

Check your Node.js version:

```bash
node --version
```

Your version should be:

```text
v18.x.x
```

or newer.

---

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd QR-File-Share
```

---

### 2. Install Dependencies

Open the project in VS Code and run:

```bash
npm install
```

---

### 3. Configure Environment Variables

Create a `.env` file in the project root.

```env
Cloudinary_cloud_name=your_cloud_name
Cloudinary_api_key=your_cloudinary_api_key
Cloudinary_api_secret=your_cloudinary_api_secret
```

Replace the placeholder values with your actual Cloudinary credentials.

> ⚠️ **Never upload `.env` to GitHub.**

Make sure `.gitignore` contains:

```text
.env
node_modules/
```

---

### 4. Start the Application

Run:

```bash
npm start
```

The application should start on:

```text
http://localhost:3000
```

Open the URL in your browser.

---

## 📦 Upload Limits

The current application supports:

| Limit                    |                   Value |
| ------------------------ | ----------------------: |
| 📁 Maximum files         |               100 files |
| 📦 Maximum size per file |                   50 MB |
| 🖼️ Allowed              |                  Images |
| 📄 Allowed               |                     PDF |
| 🔢 PIN length            |              4–8 digits |
| ⏳ Expiry options         | Never / 1 / 7 / 30 Days |

The maximum file size and number of files can be modified through the server configuration, including the `limits` configuration in `server.js`.

---

## 🌐 Deploy on Render

The application can be deployed online using **Render**.

### 1. Push to GitHub

Push your project to GitHub.

**Do not push `.env`.**

---

### 2. Create a Render Web Service

Create an account on:

https://render.com

Then:

```text
New +
   ↓
Web Service
   ↓
Select GitHub Repository
```

---

### 3. Configure Build & Start Commands

**Build Command:**

```bash
npm install
```

**Start Command:**

```bash
npm start
```

---

### 4. Add Environment Variables

Open the Render service:

```text
Environment
```

Add:

```env
Cloudinary_cloud_name=your_cloud_name
Cloudinary_api_key=your_cloudinary_api_key
Cloudinary_api_secret=your_cloudinary_api_secret
```

---

### 5. Deploy

Click **Deploy**.

After deployment, Render will provide a public URL similar to:

```text
https://your-project.onrender.com
```

Your QR File Share application can now be accessed from anywhere.

---

## 📂 Recommended Project Structure

```text
QR-File-Share/
│
├── public/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── server.js
├── package.json
├── package-lock.json
├── .env
├── .gitignore
└── README.md
```

> The exact structure may vary depending on your current project files.

---

## 🔗 Sharing Workflow

### Sender

```text
Select Files
     ↓
Preview Files
     ↓
Set PIN / Expiry
     ↓
Add Personal Message
     ↓
Upload
     ↓
QR Code Generated
     ↓
Download / Copy / Share
```

### Receiver

```text
Scan QR
   ↓
Open Gallery
   ↓
Enter PIN (if required)
   ↓
View Personal Message
   ↓
View Photos & PDFs
   ↓
Open / Browse Files
```

---

## 🧪 Example Use Cases

### 🎂 Birthday Sharing

Upload birthday photos and create one QR code to share with friends and family.

### 💍 Wedding Photos

Create a gallery containing wedding photographs and share the QR code with guests.

### 📚 Study Material

Upload PDFs and distribute them through a single QR code.

### 📄 Document Sharing

Share multiple documents without sending them individually.

### 📸 Event Photography

Upload event photographs and provide attendees with one QR code to access the gallery.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the project
2. Create a feature branch

```bash
git checkout -b feature/amazing-feature
```

3. Commit your changes

```bash
git commit -m "Add some amazing feature"
```

4. Push your branch

```bash
git push origin feature/amazing-feature
```

5. Open a Pull Request

---

## 🐛 Bug Reports & Feature Requests

If you find a bug or have an idea for improving the project, create an issue in the GitHub repository.

Useful information to include:

* What happened?
* What did you expect?
* Steps to reproduce
* Browser/device
* Error message or screenshot

---

## 👨‍💻 Author

**Mohd Mujtaba Nizami (MJ)**

Computer Science Engineering Student | Backend-Focused Full Stack Developer

* 📧 Email: [nizamimujtaba391@gmail.com](mailto:nizamimujtaba391@gmail.com)
* 🔗 GitHub: [@mohdmujtabanizami](https://github.com/mohdmujtabanizami)
* 📍 India

---

## 📄 License

This project is open-source and available under the **MIT License**.

See the `LICENSE` file for details.

---

<div align="center">

### ⭐ If you found QR File Share useful, consider giving the project a star on GitHub!

**Upload. Secure. Scan. Share.**

</div>
