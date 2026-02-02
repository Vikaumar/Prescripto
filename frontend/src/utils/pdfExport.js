/**
 * PDF Export Utility for Prescriptions
 * Generates downloadable PDF documents from prescription data
 */

import { jsPDF } from 'jspdf';

/**
 * Export a prescription to PDF
 * @param {Object} prescription - The prescription data
 * @param {Object} options - Export options
 */
export const exportPrescriptionPDF = (prescription, options = {}) => {
  const {
    includeImage = false,
    includeAnalysis = true,
    includeTimestamp = true
  } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let yPos = margin;

  // Colors
  const primaryColor = [99, 102, 241]; // Indigo
  const textColor = [15, 23, 42]; // Slate 900
  const mutedColor = [100, 116, 139]; // Slate 500

  // Helper function to add text with word wrap
  const addWrappedText = (text, x, y, maxWidth, lineHeight = 6) => {
    const lines = doc.splitTextToSize(text, maxWidth);
    lines.forEach((line, index) => {
      doc.text(line, x, y + (index * lineHeight));
    });
    return lines.length * lineHeight;
  };

  // ========== Header ==========
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Prescripto', margin, 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Smart Prescription Manager', margin, 28);

  if (includeTimestamp) {
    const date = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    doc.text(`Generated: ${date}`, pageWidth - margin, 28, { align: 'right' });
  }

  yPos = 55;

  // ========== Prescription Info ==========
  doc.setTextColor(...textColor);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Prescription Details', margin, yPos);
  yPos += 10;

  // Prescription date
  if (prescription.createdAt) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...mutedColor);
    const prescDate = new Date(prescription.createdAt).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.text(`Uploaded: ${prescDate}`, margin, yPos);
    yPos += 10;
  }

  // ========== Medicines Section ==========
  if (prescription.medicines && prescription.medicines.length > 0) {
    doc.setTextColor(...textColor);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Medicines', margin, yPos);
    yPos += 8;

    prescription.medicines.forEach((medicine, index) => {
      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage();
        yPos = margin;
      }

      // Medicine card background
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(margin, yPos, contentWidth, 30, 3, 3, 'F');

      // Medicine number badge
      doc.setFillColor(...primaryColor);
      doc.circle(margin + 8, yPos + 10, 5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(String(index + 1), margin + 8, yPos + 12, { align: 'center' });

      // Medicine name
      doc.setTextColor(...textColor);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(medicine.name || 'Unknown Medicine', margin + 18, yPos + 10);

      // Dosage and frequency
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...mutedColor);
      
      const details = [];
      if (medicine.dosage) details.push(`Dosage: ${medicine.dosage}`);
      if (medicine.frequency) details.push(`Frequency: ${medicine.frequency}`);
      if (medicine.duration) details.push(`Duration: ${medicine.duration}`);
      
      doc.text(details.join('  •  ') || 'No details available', margin + 18, yPos + 18);

      // Instructions
      if (medicine.instructions) {
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text(`Instructions: ${medicine.instructions}`, margin + 18, yPos + 26);
      }

      yPos += 35;
    });
  }

  yPos += 5;

  // ========== AI Analysis Section ==========
  if (includeAnalysis && prescription.isAnalyzed) {
    // Check if we need a new page
    if (yPos > 200) {
      doc.addPage();
      yPos = margin;
    }

    doc.setTextColor(...textColor);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('AI Analysis', margin, yPos);
    yPos += 10;

    // Diagnosis
    if (prescription.diagnosis) {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Diagnosis:', margin, yPos);
      yPos += 6;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...mutedColor);
      const diagHeight = addWrappedText(prescription.diagnosis, margin, yPos, contentWidth);
      yPos += diagHeight + 8;
    }

    // Simplified Explanation
    if (prescription.simplifiedExplanation) {
      doc.setTextColor(...textColor);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Simplified Explanation:', margin, yPos);
      yPos += 6;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...mutedColor);
      const explainHeight = addWrappedText(prescription.simplifiedExplanation, margin, yPos, contentWidth);
      yPos += explainHeight + 8;
    }

    // Doctor Notes
    if (prescription.doctorNotes) {
      doc.setTextColor(...textColor);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Doctor Notes:', margin, yPos);
      yPos += 6;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...mutedColor);
      const notesHeight = addWrappedText(prescription.doctorNotes, margin, yPos, contentWidth);
      yPos += notesHeight + 8;
    }
  }

  // ========== Footer ==========
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

  doc.setFontSize(8);
  doc.setTextColor(...mutedColor);
  doc.text('Generated by Prescripto - Smart Prescription Manager', margin, footerY);
  doc.text('This document is for personal reference only.', margin, footerY + 5);
  doc.text('Always consult your doctor for medical advice.', pageWidth - margin, footerY, { align: 'right' });

  // ========== Save ==========
  const fileName = `prescription_${prescription._id || 'export'}_${Date.now()}.pdf`;
  doc.save(fileName);

  return fileName;
};

/**
 * Export multiple prescriptions to a single PDF
 */
export const exportPrescriptionsPDF = (prescriptions, options = {}) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;

  // Title page
  doc.setFillColor(99, 102, 241);
  doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.text('Prescripto', pageWidth / 2, 100, { align: 'center' });

  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text('Prescription History', pageWidth / 2, 115, { align: 'center' });

  doc.setFontSize(12);
  doc.text(`${prescriptions.length} Prescriptions`, pageWidth / 2, 130, { align: 'center' });

  const date = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  doc.text(`Generated: ${date}`, pageWidth / 2, 145, { align: 'center' });

  // Add each prescription
  prescriptions.forEach((prescription, index) => {
    doc.addPage();
    
    let yPos = margin;
    
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Prescription ${index + 1} of ${prescriptions.length}`, margin, yPos);
    yPos += 15;

    if (prescription.medicines && prescription.medicines.length > 0) {
      prescription.medicines.forEach((medicine) => {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`• ${medicine.name || 'Unknown'}`, margin, yPos);
        yPos += 6;

        if (medicine.dosage || medicine.frequency) {
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(100, 116, 139);
          const details = [medicine.dosage, medicine.frequency].filter(Boolean).join(' - ');
          doc.text(`  ${details}`, margin, yPos);
          doc.setTextColor(15, 23, 42);
          yPos += 8;
        }
      });
    }
  });

  const fileName = `prescriptions_export_${Date.now()}.pdf`;
  doc.save(fileName);

  return fileName;
};

/**
 * Share prescription (using Web Share API)
 */
export const sharePrescription = async (prescription) => {
  if (!navigator.share) {
    throw new Error('Web Share API not supported');
  }

  const medicineList = prescription.medicines
    ?.map(m => `• ${m.name}: ${m.dosage || ''} ${m.frequency || ''}`)
    .join('\n') || 'No medicines listed';

  const shareData = {
    title: 'My Prescription - Prescripto',
    text: `My Prescription\n\nMedicines:\n${medicineList}\n\nGenerated by Prescripto`,
    url: window.location.origin + `/app?prescription=${prescription._id}`
  };

  try {
    await navigator.share(shareData);
    return true;
  } catch (error) {
    if (error.name !== 'AbortError') {
      throw error;
    }
    return false;
  }
};

export default {
  exportPrescriptionPDF,
  exportPrescriptionsPDF,
  sharePrescription
};
