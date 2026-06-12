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
export const VERIFIED_LINKS: VerifiedLinkEntry[] = [];
