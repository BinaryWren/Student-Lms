# Mission 1: Certificate Generation Feature

Successfully implemented a comprehensive certificate generation and verification system.

## Key Features
1.  **Multi-Institute Templates**:
    *   Institutes can define custom templates with logos, backgrounds, and signatures.
    *   Backend support via `CertificateTemplate` model.

2.  **PDF Generation**:
    *   Automated PDF generation using `reportlab`.
    *   Includes dynamic text replacement (Student Name, Course Title).
    *   Embeds unique QR Code for instant verification.

3.  **Secure Verification**:
    *   Each certificate has a globally unique ID (UUID).
    *   Public verification page at `/verify/[id]` displays valid/invalid status and official details.
    *   Direct download link for the official PDF.

4.  **Student Portal Integration**:
    *   New "Certificates" section in the student sidebar.
    *   Grid view of earned certificates with status indicators.

## API Endpoints
*   `GET /api/certificates/` - List certificates (Scoped to Student or Institute).
*   `POST /api/certificates/` - Issue certificate (Admin/Instructor).
*   `POST /api/certificate-templates/` - Manage templates.
*   `GET /api/verify/{id}/` - Public verification details.

## Technical Details
*   **Libraries**: `reportlab`, `qrcode`, `Pillow`.
*   **Storage**: Generated PDFs are stored in `media/certificates/generated/`.
*   **Models**: Added `Certificate` and `CertificateTemplate` to `academics` app.

## How to Test
1.  **Student**: Login -> Go to "Certificates" -> View/Download.
2.  **Public**: Scan QR code or visit `/verify/[id]`.
3.  **Instructor**: Use API or Admin panel (future UI) to issue certificates.
