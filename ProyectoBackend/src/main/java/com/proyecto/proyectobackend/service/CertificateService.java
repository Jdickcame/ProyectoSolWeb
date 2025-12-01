package com.proyecto.proyectobackend.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfWriter;
import com.proyecto.proyectobackend.model.Course;
import com.proyecto.proyectobackend.model.Enrollment;
import com.proyecto.proyectobackend.model.User;

import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
public class CertificateService {

    public byte[] generateCertificate(Enrollment enrollment) {
        User student = enrollment.getStudent();
        Course course = enrollment.getCourse();

        // Creamos el documento en formato horizontal (Landscape)
        Document document = new Document(PageSize.A4.rotate());
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // --- DISEÑO DEL CERTIFICADO ---
            
            // 1. Título
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 30, java.awt.Color.DARK_GRAY);
            Paragraph title = new Paragraph("CERTIFICADO DE FINALIZACIÓN", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingBefore(50);
            document.add(title);

            // 2. Texto introductorio
            Font textFont = FontFactory.getFont(FontFactory.HELVETICA, 18, java.awt.Color.GRAY);
            Paragraph intro = new Paragraph("Este certificado se otorga a:", textFont);
            intro.setAlignment(Element.ALIGN_CENTER);
            intro.setSpacingBefore(40);
            document.add(intro);

            // 3. Nombre del Estudiante
            Font nameFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 26, java.awt.Color.BLACK);
            Paragraph studentName = new Paragraph(student.getName().toUpperCase() + " " + student.getSurname().toUpperCase(), nameFont);
            studentName.setAlignment(Element.ALIGN_CENTER);
            studentName.setSpacingBefore(20);
            document.add(studentName);

            // 4. Texto intermedio
            Paragraph body = new Paragraph("Por haber completado satisfactoriamente el curso:", textFont);
            body.setAlignment(Element.ALIGN_CENTER);
            body.setSpacingBefore(20);
            document.add(body);

            // 5. Nombre del Curso
            Font courseFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, java.awt.Color.BLUE);
            Paragraph courseName = new Paragraph(course.getTitle(), courseFont);
            courseName.setAlignment(Element.ALIGN_CENTER);
            courseName.setSpacingBefore(20);
            document.add(courseName);

            // 6. Fecha
            String dateStr = enrollment.getCompletedAt() != null 
                    ? enrollment.getCompletedAt().format(DateTimeFormatter.ofPattern("dd 'de' MMMM 'de' yyyy"))
                    : java.time.LocalDate.now().format(DateTimeFormatter.ofPattern("dd 'de' MMMM 'de' yyyy"));
            
            Font dateFont = FontFactory.getFont(FontFactory.HELVETICA, 14, java.awt.Color.GRAY);
            Paragraph date = new Paragraph("Otorgado el " + dateStr, dateFont);
            date.setAlignment(Element.ALIGN_CENTER);
            date.setSpacingBefore(60);
            document.add(date);

            // 7. Firma (Texto simple por ahora)
            Paragraph signature = new Paragraph("_________________________\n" + course.getTeacher().getName() + "\nInstructor", textFont);
            signature.setAlignment(Element.ALIGN_RIGHT);
            signature.setIndentationRight(50);
            signature.setSpacingBefore(50);
            document.add(signature);

            document.close();

        } catch (DocumentException e) {
            throw new RuntimeException("Error al generar el PDF del certificado", e);
        }

        return out.toByteArray();
    }
}