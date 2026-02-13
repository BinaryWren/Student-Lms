import io
import qrcode
from django.conf import settings
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import landscape, letter
from reportlab.lib.units import inch
from reportlab.lib.utils import ImageReader

def generate_certificate_pdf(certificate):
    """
    Generates a PDF certificate based on the template and saves it to the Certificate model.
    Includes a QR code pointing to the verification URL.
    """
    buffer = io.BytesIO()
    
    # Page Setup
    c = canvas.Canvas(buffer, pagesize=landscape(letter))
    width, height = landscape(letter)
    
    # 1. Background
    if certificate.template and certificate.template.background_image:
        try:
            # We need the absolute path for ReportLab
            bg_path = certificate.template.background_image.path
            c.drawImage(bg_path, 0, 0, width=width, height=height)
        except Exception as e:
            print(f"Error loading background: {e}")
    
    # 2. Text Content
    c.setFont("Helvetica-Bold", 40)
    c.drawCentredString(width / 2, height - 2*inch, certificate.template.title_text if certificate.template else "Certificate of Completion")
    
    c.setFont("Helvetica", 18)
    student_name = certificate.student.get_full_name()
    course_name = certificate.course.title if certificate.course else (certificate.program.name if certificate.program else "Course")
    
    # Dynamic Body Text
    body_text = certificate.template.body_text if certificate.template else "This is to certify that {student_name} has successfully completed the course {course_name}."
    final_text = body_text.format(student_name=student_name, course_name=course_name)
    
    # Draw logic (simple wrap for now)
    text_obj = c.beginText(width/2 - 3*inch, height/2 + 0.5*inch)
    text_obj.setFont("Helvetica", 18)
    # Splitting for basic wrapping
    from reportlab.lib.utils import simpleSplit
    lines = simpleSplit(final_text, "Helvetica", 18, 6*inch)
    for line in lines:
        c.drawCentredString(width/2, height/2, line) # This center logic needs adjust per line, simplified:
        # reportlab centered multiline is manual.
    
    c.drawCentredString(width/2, height/2 + 20, f"This is to certify that")
    c.setFont("Helvetica-Bold", 30)
    c.drawCentredString(width/2, height/2 - 20, student_name)
    c.setFont("Helvetica", 18)
    c.drawCentredString(width/2, height/2 - 50, f"has successfully completed")
    c.setFont("Helvetica-Bold", 22)
    c.drawCentredString(width/2, height/2 - 80, course_name)
    
    # 3. QR Code with Verification Link
    verify_url = f"{settings.FRONTEND_URL}/verify/{certificate.unique_id}"
    qr = qrcode.QRCode(box_size=2, border=1)
    qr.add_data(verify_url)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="black", back_color="white")
    
    # Save QR to temp stream
    qr_buffer = io.BytesIO()
    qr_img.save(qr_buffer, format="PNG")
    qr_buffer.seek(0)
    
    c.drawImage(ImageReader(qr_buffer), width - 2.5*inch, 1*inch, width=1.5*inch, height=1.5*inch)
    
    # 4. Unique ID & Date
    c.setFont("Helvetica", 10)
    c.drawString(width - 2.5*inch, 0.8*inch, f"ID: {certificate.unique_id}")
    c.drawString(1*inch, 1*inch, f"Date: {certificate.issued_at.strftime('%B %d, %Y')}")
    
    # 5. Signature
    if certificate.template and certificate.template.signature_image:
         try:
            sig_path = certificate.template.signature_image.path
            c.drawImage(sig_path, width/2 - 1*inch, 1*inch, width=2*inch, height=1*inch, mask='auto')
         except Exception as e: pass
         
    c.showPage()
    c.save()
    
    # Save to Model
    from django.core.files.base import ContentFile
    buffer.seek(0)
    filename = f"Certificate_{certificate.student.username}_{certificate.id}.pdf"
    certificate.pdf_file.save(filename, ContentFile(buffer.getvalue()), save=True)

