// Behavior tests for the shipped demo PDF generator.
import {
  buildDemoPdfContent,
  demoPdfFileName,
  randomDemoCaption,
} from '../lib/demoScenarioPdf';

describe('demo scenario PDF', () => {
  it('builds a valid PDF with applicant data and reference', () => {
    const content = buildDemoPdfContent(
      { name: 'Rizky Pratama', nim: '2009106011', campus: 'Unmul' },
      'BKT-1234',
      '19 September 2026'
    );
    expect(content.startsWith('%PDF-1.4')).toBe(true);
    expect(content).toContain('BEASISWA KALTIM TUNTAS');
    expect(content).toContain('Rizky Pratama');
    expect(content).toContain('BKT-1234');
    expect(content.trimEnd().endsWith('%%EOF')).toBe(true);
  });

  it('derives file names and captions from the reference', () => {
    expect(demoPdfFileName('BKT-1234')).toBe(
      'surat-pernyataan-beasiswa-kaltim-tuntas-bkt-1234.pdf'
    );
    expect(randomDemoCaption('BKT-1234')).toContain('BKT-1234');
  });
});
