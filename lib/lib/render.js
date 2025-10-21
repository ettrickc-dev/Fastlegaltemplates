// lib/render.js
import { Document, Packer, Paragraph, TextRun } from 'docx';
import JSZip from 'jszip';

// Takes a "draft" (user answers) and builds a ZIP with 4 DOCX files
export async function renderPaidZip(draft) {
  const name = draft?.name || 'Customer';
  const product = draft?.product || 'Caregiver Agreement';

  const sections = [
    { title: `${product} - Contract`, body: draft?.content || 'Contract goes here...' },
    { title: `${product} - Memorandum`, body: 'Memo text...' },
    { title: `${product} - Exhibits`, body: 'Exhibits list...' },
    { title: `${product} - Procedural Guide`, body: 'Checklist / Notes...' }
  ];

  const zip = new JSZip();
  for (const s of sections) {
    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({ children: [new TextRun({ text: s.title, bold: true, size: 28 })] }),
          new Paragraph(''),
          ...s.body.split('\n').map(line => new Paragraph(line))
        ]
      }]
    });
    const buffer = await Packer.toBuffer(doc);
    zip.file(`${s.title} - ${name}.docx`, buffer);
  }

  const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
  return {
    buffer: zipBuffer,
    filename: `${name.replace(/[^a-z0-9\- ]+/gi,'_')}_${product.replace(/[^a-z0-9\- ]+/gi,'_')}.zip`,
    mime: 'application/zip'
  };
}
