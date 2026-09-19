// Generates a valid one-page PDF locally for the demo scenario.
// The content is random per call (reference number + date) but always a
// readable PDF so the share/download flow can be shown end-to-end.
import { File, Paths } from 'expo-file-system';

function escapePdfText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function pick<T>(items: T[]): T {
  const item = items[Math.floor(Math.random() * items.length)];
  if (item === undefined) {
    throw new Error('Pilihan PDF kosong');
  }
  return item;
}

export interface DemoPdf {
  uri: string;
  fileName: string;
  docTitle: string;
  referenceNo: string;
}

export function demoPdfFileName(referenceNo: string): string {
  return `surat-pernyataan-beasiswa-kaltim-tuntas-${referenceNo.toLowerCase()}.pdf`;
}

export function buildDemoPdfContent(
  applicant: { name: string; nim: string; campus: string },
  referenceNo: string,
  issuedDate: string
): string {
  const lines = [
    'SURAT PERNYATAAN PENDAFTAR',
    'BEASISWA KALTIM TUNTAS JALUR TUNTAS',
    '',
    `Nomor: ${referenceNo}/BKT/2026`,
    `Tanggal: ${issuedDate}`,
    '',
    'Yang bertanda tangan di bawah ini:',
    `Nama: ${applicant.name}`,
    `NIM: ${applicant.nim}`,
    `Kampus: ${applicant.campus}`,
    '',
    'Menyatakan bahwa data yang saya berikan adalah benar,',
    'tidak sedang menerima beasiswa lain, dan bersedia',
    'mengikuti seluruh ketentuan program Beasiswa Kaltim Tuntas.',
    '',
    'Demikian surat pernyataan ini dibuat dengan sebenarnya.',
    '',
    'Samarinda, ' + issuedDate,
    applicant.name,
  ];
  const textOps = lines
    .map(
      (line, index) =>
        `BT /F1 11 Tf 56 ${740 - index * 22} Td (${escapePdfText(line)}) Tj ET`
    )
    .join('\n');
  const objects = [
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
    '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj',
    '4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
    `5 0 obj << /Length ${textOps.length} >> stream\n${textOps}\nendstream endobj`,
  ];
  const header = '%PDF-1.4\n';
  let body = '';
  const offsets: number[] = [];
  let cursor = header.length;
  for (const obj of objects) {
    offsets.push(cursor);
    body += `${obj}\n`;
    cursor += obj.length + 1;
  }
  const xrefStart = cursor;
  const xref = [
    'xref',
    `0 ${objects.length + 1}`,
    '0000000000 65535 f ',
    ...offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n `),
  ].join('\n');
  const trailer = `\ntrailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return `${header}${body}${xref}${trailer}`;
}

export async function generateDemoScenarioPdf(
  applicant: { name: string; nim: string; campus: string } = {
    name: 'Rizky Pratama',
    nim: '2009106011',
    campus: 'Universitas Mulawarman',
  }
): Promise<DemoPdf> {
  const referenceNo = `BKT-${Math.floor(1000 + Math.random() * 9000)}`;
  const issuedDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const docTitle = 'Surat Pernyataan Pendaftar Beasiswa Kaltim Tuntas';
  const fileName = demoPdfFileName(referenceNo);
  const file = new File(Paths.cache, fileName);
  if (file.exists) {
    file.delete();
  }
  file.create();
  file.write(buildDemoPdfContent(applicant, referenceNo, issuedDate));
  return { uri: file.uri, fileName, docTitle, referenceNo };
}

export function randomDemoCaption(referenceNo: string): string {
  const options = [
    `Surat pernyataan Beasiswa Kaltim Tuntas ${referenceNo} dari Andora. Tinggal tekan kirim ya.`,
    `Dokumen beasiswa ${referenceNo} sudah jadi. Saya lampirkan di WhatsApp ini.`,
    `Berikut surat pernyataan Kaltim Tuntas ${referenceNo}. Dicek dulu sebelum dikirim.`,
  ];
  return pick(options);
}
