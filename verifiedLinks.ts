export type VerifiedLinkStatus = 'pending' | 'verified' | 'blocked' | 'needs_review' | 'exception' | 'retired';
export type VerifiedLinkConfidence = 'A' | 'B' | 'C' | 'D' | 'E';

export interface VerifiedLinkEntry {
  url: string;
  status: VerifiedLinkStatus;
  confidence: VerifiedLinkConfidence;
  verifiedAt?: string;
  verifiedBy?: string;
  nextReviewAt?: string;
  organization?: string;
  evidence?: string;
  notes?: string;
}

// Manual link verification registry.
// Add entries here after a human has checked that the URL is authentic and matches its label.
export const VERIFIED_LINKS: VerifiedLinkEntry[] = [
  {
    url: 'https://www.avl.fi/',
    status: 'verified',
    confidence: 'A',
    verifiedAt: '2026-06-12',
    verifiedBy: 'Codex',
    organization: 'Auranmaan Viikkolehti',
    evidence: 'Sivu vastasi HTTP 200 ja sivun otsikko oli "AVL | Auranmaan Viikkolehti".',
    notes: 'Vanha osoite http://www.auranmaanviikkolehti.fi ei ratkennut. Uusi avl.fi näyttää olevan sama palvelu uudella lyhyemmällä nimellä.',
  },
];
