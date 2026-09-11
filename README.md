# QR File Share — Multiple Files + PIN + Expiry + Cloudinary

Upload multiple photos and PDFs at once → Create only one QR Code for each → Lock it with a PIN or set an expiry → Gallery opens by scanning the QR from anywhere.

## Step 1: Create a free Cloudinary account

1.  Go to https://cloudinary.com sign up for free
2. Copy the **Cloud Name**, **API Key**, **API Secret** from the dashboard

## Step 2: Setup in VS Code

1. Open this folder in VS Code (**Node.js version 18+** required)
2. In `.env`, enter your Cloudinary values:
   ```
   Cloudinary_cloud_name=your_cloud_name
   Cloudinary_api_key=your_api_key
   Cloudinary_api_secret=your_api_secret
   ```
3. Terminal me:
   ```
   npm install
   npm start
   ```
4. Type `http://localhost:3000` in the browser.

## All Features

**When uploading:**
- Select up to 100 files (photos + PDFs) at once, drag-and-drop is also supported
- A **thumbnail preview** of each file will be displayed, you can delete any you don't like by pressing `×`
- Only **images and PDFs** are allowed, other file types will be rejected
- **Real upload progress bar (%)** is displayed
- 🔒 **PIN Protection** (optional): Yes, set a 4-8 digit PIN — files are also saved **encrypted** on Cloudinary
- ⏳ **Expiry** (optional): Never / 1 Day / 7 Day / 30 Day — the link automatically closes after the selected date
- 💌 **Personal** Message** (optional): You can send a small note along with files (e.g. "Happy Birthday! 🎉"), which will appear above the gallery as soon as it opens.
- 🌙 **Dark mode** toggle (top-right button)

**After receiving a QR:**
- **⬇️ QR Download** — You can save the QR image directly.
- **🔗 Copy Link** — Copy the gallery link with one click.
- **📤 Share** — Share directly with WhatsApp/any app (will open the native share menu on your phone)
- **🔴 Live "Seen" Notification**: If you keep the upload page open, you'll be notified immediately (real-time, without refreshing) when someone scans the QR and opens the gallery. You'll know "Someone saw it!" — no need to leave this page.

**After scanning (Gallery page):**
- The sender's personal message (if provided) appears at the top.
- Photos appear in a grid, PDFs in a list.
- Tapping on a photo opens a full-screen lightbox.
- You can browse all photos from next/previous, keyboard arrows also work.
- If a PIN is set, the unlock screen will appear first (files will never be visible until the correct PIN is entered).
- If the link has expired, a clear message will appear.

## Security / Robustness

- **PIN brute-force lockout**: A 5-minute lock occurs after 5 incorrect PIN attempts (per gallery)
- **Rate limiting**: A temporary block occurs if there are too many uploads or verification requests
- **Helmet security headers**: Basic web security best-practices are in place
- **File type validation**: The server also double-checks that only images/PDFs are uploaded
- PIN-protected gallery data is also stored **AES-256 encrypted** on Cloudinary, and cannot be opened directly from a Cloudinary URL

### ⚠️ Limitations from the above
- A 4-digit PIN only has 10,000 combinations — good for casual privacy, not bank-level security. For greater security, use a 6-8 digit PIN.
- The PIN lockout is stored in memory, so the lockout resets upon server restart.
- The app "closes" the link after it expires, but the files themselves are not automatically deleted from Cloudinary (if desired, let us know; we'll build a delete integration).
- The "Live Seen" notification only works as long as the browser tab containing the upload is open. Closing the tab or reloading the page breaks the connection. Also note that even if you reopen your gallery link yourself, it will still count as a "view", as the server cannot differentiate whether the person opening the gallery is the sender or someone else.

## Step 3: Deploy (Render) on the Internet

1. Push the code to GitHub (do not push `.env`)
2. Create a free account on https://render.com, **New + → Web Service**, select the repo
3. Build Command: `npm install`, Start Command: `npm start`
4. Add three Cloudinary variables in the **Environment** tab
5. Deploy — you will receive the live URL

## Notes
- Maximum 100 files at a time, maximum 50MB per file (can be changed using `limits` in `server.js`)
- Never push the `.env` file to GitHub
