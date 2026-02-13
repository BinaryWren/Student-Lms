# Deployment Guide: Frontend Only (Binghost / cPanel Node.js)

This guide focuses on deploying the **Next.js Frontend** of the LMS application to a hosting provider like **Binghost** using cPanel's "Setup Node.js App" feature.

---

## 1. Prerequisites

*   **Binghost Account** with cPanel access.
*   **Node.js Support** enabled on your hosting plan (Node 18/20 recommended).
*   **Domain Name** pointed to your hosting.
*   Access to File Manager or FTP.

---

## 2. Local Preparation

Before uploading, prepare your application locally:

1.  **Configure Environment Variables**:
    Create or update `.env.production`:
    ```env
    NEXT_PUBLIC_API_URL=https://nanocyber.tech/api
    ```
    *Note: Replace with your actual backend URL.*

2.  **Build the Application**:
    Run the build command to generate the standalone server:
    ```bash
    npm run build
    ```
    *This creates a `.next/standalone` folder containing everything needed to run the app.*

3.  **Prepare for Upload**:
    You need to upload the contents of `.next/standalone`.
    Also copy the `public` folder and `.next/static` folder:
    *   Copy `public/` -> `.next/standalone/public/`
    *   Copy `.next/static/` -> `.next/standalone/.next/static/`
    
    *Why? The standalone build doesn't include static assets by default.*

4.  **Zip the Standalone Folder**:
    Zip the contents of `.next/standalone` into `frontend.zip`.

---

## 3. Deployment on Binghost (cPanel)

1.  **Login to cPanel**.
2.  **Go to "Setup Node.js App"**.
3.  **Create Application**:
    *   **Node.js Version**: Select 18.x or 20.x.
    *   **Application Mode**: `Production`.
    *   **Application Root**: `lms-frontend` (or any folder name).
    *   **Application URL**: Select your domain (e.g., `nanocyber.tech`).
    *   **Application Startup File**: `server.js` (We will upload this).
    *   Click **Create**.

4.  **Upload Files**:
    *   Go to **File Manager**.
    *   Navigate to the `lms-frontend` directory created above.
    *   **Upload** `frontend.zip`.
    *   **Extract** the zip file.
    *   Ensure `server.js` is in the root of `lms-frontend`.

5.  **Install Dependencies (Optional)**:
    *   Since we used `standalone` mode, `node_modules` are technically bundled, but sometimes cPanel requires `npm install`.
    *   If the app doesn't start, click **Run NPM Install** in the Node.js App interface (requires `package.json` to be uploaded).
    *   *Tip: Uploading `package.json` is recommended even with standalone builds.*

6.  **Environment Variables**:
    *   In the Node.js App settings, click **Add Variable**.
    *   Key: `PORT` | Value: (Leave empty, cPanel handles this)
    *   Key: `NEXT_PUBLIC_API_URL` | Value: `https://nanocyber.tech/api` (If not baked in)

7.  **Restart Application**:
    *   Click **Restart** in the Node.js App dashboard.

---

## 4. Alternative: Static Export (If Node.js is not supported)

If you cannot run a Node.js server, you can deploy as static HTML/CSS/JS.

1.  **Update `next.config.ts`**:
    Change `output: "standalone"` to `output: "export"`.
2.  **Build**:
    ```bash
    npm run build
    ```
    This creates an `out/` folder.
3.  **Upload**:
    Upload the contents of `out/` to your `public_html` folder.

    *Note: Functionality requiring server-side headers or heavy dynamic routes might need adjustment.*

---

## 5. Troubleshooting

*   **500/503 Errors**: Check the `stderr.log` in your application root directory via File Manager.
*   **Missing Styles/Images**: Ensure you copied `.next/static` to `.next/standalone/.next/static`. This is a common mistake with standalone builds.
*   **API Connection Failed**: Verify `NEXT_PUBLIC_API_URL` is reachable and CORS settings on the backend allow your frontend domain.

