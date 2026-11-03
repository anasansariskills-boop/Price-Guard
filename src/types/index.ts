export interface AgreedProduct {
  id: string;
  sku: string;
  name: string;
  category: string;
  agreedPrice: number;
  unit: string;
  packSize: string;
  effectiveFrom: string;
  effectiveTo?: string;
  notes?: string;
}

export interface InvoiceLineItem {
  id: string;
  lineIndex: number;
  rawCode: string;
  rawDescription: string;
  quantity: number;
  unit: string;
  packSize?: string;
  invoicedUnitPrice: number;
  lineTotal: number;
  sourceTextRef?: string;
}

export interface InvoiceDocument {
  id: string;
  invoiceNumber: string;
  supplierName: string;
  invoiceDate: string;
  dueDate?: string;
  currency: string;
  subtotal: number;
  taxAmount?: number;
  totalAmount: number;
  lineItems: InvoiceLineItem[];
  sourceFileName: string;
  rawTextContent?: string;
  extractionEngine?: 'native_pdf_parser' | 'gemini_3.8_flash' | 'text_csv_parser';
}

export type DiscrepancyType = 
  | 'price_mismatch'
  | 'potential_mismatch'
  | 'pack_size_discrepancy'
  | 'duplicate_invoice'
  | 'unmatched_product';

export type FindingStatus = 'potential' | 'reviewed' | 'confirmed' | 'dismissed';

export interface DiscrepancyFinding {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  supplierName: string;
  invoiceDate: string;
  lineIndex: number;
  invoiceItem: InvoiceLineItem;
  matchedAgreedProduct: AgreedProduct | null;
  matchConfidence: number;
  matchMethod: 'exact_sku' | 'normalized_text' | 'fuzzy_match' | 'semantic_ai' | 'unmatched';
  findingType: DiscrepancyType;
  agreedPrice: number;
  invoicedPrice: number;
  unitPriceDiff: number;
  quantity: number;
  potentialOvercharge: number;
  status: FindingStatus;
  reviewNote?: string;
  evidence: {
    sourceDocument: string;
    sourceLineRef: string;
    agreedRecordRef: string;
    calculationExplanation: string;
    uncertaintyNotes?: string;
  };
}

export interface AuditSummary {
  totalInvoices: number;
  totalInvoiceAmount: number;
  totalLinesProcessed: number;
  matchedLinesCount: number;
  needsReviewCount: number;
  discrepancyCount: number;
  potentialPriceOvercharge: number;
  duplicateInvoiceExposure: number;
  duplicateInvoiceCount: number;
  unmatchedProductsCount: number;
  unmatchedTotalAmount: number;
  needsReviewTotalAmount: number;
  totalPotentialOvercharge: number;
  confirmedOvercharge: number;
}

export interface AuditSession {
  id: string;
  userId: string;
  title: string;
  supplierName: string;
  industry: 'restaurant' | 'hotel' | 'other';
  createdAt: string;
  priceList: AgreedProduct[];
  invoices: InvoiceDocument[];
  findings: DiscrepancyFinding[];
  summary: AuditSummary;
}

export interface LeadSubmission {
  id?: string;
  name: string;
  email: string;
  businessName: string;
  businessType: 'Restaurant' | 'Hotel' | 'Catering' | 'Hospitality Group' | 'Other';
  locationsCount: string;
  estimatedMonthlySpend?: string;
  message?: string;
  createdAt?: string;
}

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  businessName: string;
  businessType?: string;
  createdAt: string;
}

export interface AuthSessionData {
  token: string;
  user: UserAccount;
}
