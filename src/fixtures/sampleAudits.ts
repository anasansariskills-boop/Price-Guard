import { AgreedProduct, InvoiceDocument, AuditSession } from '../types';
import { runInvoiceAudit } from '../utils/auditEngine';

// ==========================================
// SAMPLE A: RESTAURANT GROUP
// The Brass Palm Group (3 Locations)
// ==========================================

export const RESTAURANT_PRICELIST: AgreedProduct[] = [
  {
    id: 'rest-p1',
    sku: 'POUL-001',
    name: 'Boneless Chicken Breast 1 KG',
    category: 'Meat & Poultry',
    agreedPrice: 4.00,
    unit: 'KG',
    packSize: '1 KG Fresh Vacuum Bag',
    effectiveFrom: '2026-01-01',
    effectiveTo: '2026-12-31',
    notes: 'Grade A boneless skinless fresh chicken breast'
  },
  {
    id: 'rest-p2',
    sku: 'BEEF-102',
    name: 'Grass-Fed Beef Tenderloin AAA',
    category: 'Meat & Poultry',
    agreedPrice: 28.50,
    unit: 'KG',
    packSize: 'Avg 2.5 KG Cryovac',
    effectiveFrom: '2026-01-01',
    effectiveTo: '2026-12-31'
  },
  {
    id: 'rest-p3',
    sku: 'BEEF-105',
    name: 'Ground Chuck 80/20 Fresh',
    category: 'Meat & Poultry',
    agreedPrice: 6.20,
    unit: 'KG',
    packSize: '5 KG Coarse Grind',
    effectiveFrom: '2026-01-01',
    effectiveTo: '2026-12-31'
  },
  {
    id: 'rest-p4',
    sku: 'PORK-204',
    name: 'Smoked Bacon Thick-Cut 5kg',
    category: 'Meat & Poultry',
    agreedPrice: 38.00,
    unit: 'CASE',
    packSize: '5 KG Case',
    effectiveFrom: '2026-01-01',
    effectiveTo: '2026-12-31'
  },
  {
    id: 'rest-p5',
    sku: 'OIL-012',
    name: 'Extra Virgin Olive Oil 4x5L',
    category: 'Pantry & Dry Goods',
    agreedPrice: 72.00,
    unit: 'CASE',
    packSize: '4 x 5L Cans per Case',
    effectiveFrom: '2026-01-01',
    effectiveTo: '2026-12-31',
    notes: 'Single bottle cost $18.00, case contract $72.00'
  },
  {
    id: 'rest-p6',
    sku: 'DAIRY-030',
    name: 'Whole Milk Mozzarella 2kg Block',
    category: 'Dairy',
    agreedPrice: 12.00,
    unit: 'BLOCK',
    packSize: '2 KG Solid Block',
    effectiveFrom: '2026-01-01',
    effectiveTo: '2026-12-31'
  },
  {
    id: 'rest-p7',
    sku: 'PROD-091',
    name: 'San Marzano Style Tomatoes 6x#10',
    category: 'Pantry & Dry Goods',
    agreedPrice: 42.00,
    unit: 'CASE',
    packSize: '6 x #10 Tins',
    effectiveFrom: '2026-01-01',
    effectiveTo: '2026-12-31'
  },
  {
    id: 'rest-p8',
    sku: 'SPEC-010',
    name: 'White Truffle Oil 250ml',
    category: 'Specialty Ingredients',
    agreedPrice: 19.50,
    unit: 'EA',
    packSize: '250ml Glass Bottle',
    effectiveFrom: '2026-01-01',
    effectiveTo: '2026-12-31'
  }
];

export const RESTAURANT_INVOICES: InvoiceDocument[] = [
  {
    id: 'inv-artisan-8841',
    invoiceNumber: 'INV-2026-8841',
    supplierName: 'Artisan Meats & Poultry Co.',
    invoiceDate: '2026-10-18',
    dueDate: '2026-11-17',
    currency: 'USD',
    subtotal: 4620.00,
    taxAmount: 0.00,
    totalAmount: 4620.00,
    sourceFileName: 'artisan_meats_inv_8841.pdf',
    lineItems: [
      {
        id: 'li-8841-1',
        lineIndex: 0,
        rawCode: 'POUL-001',
        rawDescription: 'CHKN BRST B/L FRESH KG',
        quantity: 600,
        unit: 'KG',
        invoicedUnitPrice: 4.50, // Agreed is $4.00 -> OVERCHARGE $300.00
        lineTotal: 2700.00,
        sourceTextRef: 'Line 1: Item POUL-001 CHKN BRST B/L FRESH KG - 600 KG @ $4.50 = $2,700.00'
      },
      {
        id: 'li-8841-2',
        lineIndex: 1,
        rawCode: 'BEEF-102',
        rawDescription: 'BEEF TENDERLOIN AAA FRESH',
        quantity: 40,
        unit: 'KG',
        invoicedUnitPrice: 28.50, // Matches agreed $28.50 -> $0 diff
        lineTotal: 1140.00,
        sourceTextRef: 'Line 2: Item BEEF-102 BEEF TENDERLOIN AAA FRESH - 40 KG @ $28.50 = $1,140.00'
      },
      {
        id: 'li-8841-3',
        lineIndex: 2,
        rawCode: 'BEEF-105',
        rawDescription: 'GROUND CHUCK 80/20 COARSE',
        quantity: 120,
        unit: 'KG',
        invoicedUnitPrice: 6.50, // Agreed is $6.20 -> OVERCHARGE $36.00
        lineTotal: 780.00,
        sourceTextRef: 'Line 3: Item BEEF-105 GROUND CHUCK 80/20 COARSE - 120 KG @ $6.50 = $780.00'
      }
    ]
  },
  {
    id: 'inv-pacific-90422',
    invoiceNumber: 'INV-90422',
    supplierName: 'Pacific Coast Pantry & Produce',
    invoiceDate: '2026-10-22',
    dueDate: '2026-11-21',
    currency: 'USD',
    subtotal: 2944.00,
    taxAmount: 0.00,
    totalAmount: 2944.00,
    sourceFileName: 'pacific_coast_inv_90422.pdf',
    lineItems: [
      {
        id: 'li-90422-1',
        lineIndex: 0,
        rawCode: 'OIL-012',
        rawDescription: 'EVOO 4X5L CASE IMPORT',
        quantity: 20,
        unit: 'CASE',
        invoicedUnitPrice: 84.00, // Agreed is $72.00 -> OVERCHARGE $240.00
        lineTotal: 1680.00,
        sourceTextRef: 'Line 1: OIL-012 EVOO 4X5L CASE IMPORT - 20 CS @ $84.00 = $1,680.00'
      },
      {
        id: 'li-90422-2',
        lineIndex: 1,
        rawCode: 'DAIRY-030',
        rawDescription: 'MOZZARELLA WHOLE MILK BLK 2KG',
        quantity: 35,
        unit: 'BLOCK',
        invoicedUnitPrice: 12.00, // Matches agreed $12.00 -> $0 diff
        lineTotal: 420.00,
        sourceTextRef: 'Line 2: DAIRY-030 MOZZARELLA WHOLE MILK BLK 2KG - 35 BLK @ $12.00 = $420.00'
      },
      {
        id: 'li-90422-3',
        lineIndex: 2,
        rawCode: 'PROD-091',
        rawDescription: 'SAN MARZANO #10 TINS CASE',
        quantity: 15,
        unit: 'CASE',
        invoicedUnitPrice: 42.00, // Matches agreed $42.00
        lineTotal: 630.00,
        sourceTextRef: 'Line 3: PROD-091 SAN MARZANO #10 TINS CASE - 15 CS @ $42.00 = $630.00'
      },
      {
        id: 'li-90422-4',
        lineIndex: 3,
        rawCode: 'SPEC-999',
        rawDescription: 'ORGANIC AGAVE NECTAR 1L',
        quantity: 6,
        unit: 'EA',
        invoicedUnitPrice: 14.00, // Unmatched product (Needs review)
        lineTotal: 84.00,
        sourceTextRef: 'Line 4: SPEC-999 ORGANIC AGAVE NECTAR 1L - 6 EA @ $14.00 = $84.00'
      },
      {
        id: 'li-90422-5',
        lineIndex: 4,
        rawCode: 'SPEC-882',
        rawDescription: 'BLACK TRUFFLE CARPACCIO 500G',
        quantity: 2,
        unit: 'EA',
        invoicedUnitPrice: 65.00, // Potential mismatch with White Truffle Oil (Needs review)
        lineTotal: 130.00,
        sourceTextRef: 'Line 5: SPEC-882 BLACK TRUFFLE CARPACCIO 500G - 2 EA @ $65.00 = $130.00'
      }
    ]
  },
  {
    id: 'inv-artisan-8910',
    invoiceNumber: 'INV-2026-8910',
    supplierName: 'Artisan Meats & Poultry Co.',
    invoiceDate: '2026-10-29',
    dueDate: '2026-11-28',
    currency: 'USD',
    subtotal: 1900.00,
    taxAmount: 0.00,
    totalAmount: 1900.00,
    sourceFileName: 'artisan_meats_inv_8910.pdf',
    lineItems: [
      {
        id: 'li-8910-1',
        lineIndex: 0,
        rawCode: 'PORK-204',
        rawDescription: 'SMOKED BACON THICK CUT 5KG CS',
        quantity: 50,
        unit: 'CASE',
        invoicedUnitPrice: 38.00, // Matches agreed $38.00
        lineTotal: 1900.00,
        sourceTextRef: 'Line 1: PORK-204 SMOKED BACON THICK CUT 5KG CS - 50 CS @ $38.00 = $1,900.00'
      }
    ]
  }
];

// ==========================================
// SAMPLE B: HOTEL & HOSPITALITY GROUP
// The Grandview Hotel & Suites (140 Rooms)
// ==========================================

export const HOTEL_PRICELIST: AgreedProduct[] = [
  {
    id: 'hotel-p1',
    sku: 'LIN-301',
    name: '300TC Percale King Flat Sheet',
    category: 'Linen & Bedding',
    agreedPrice: 16.50,
    unit: 'EA',
    packSize: 'Single Unit Poly Wrapped',
    effectiveFrom: '2026-01-01',
    effectiveTo: '2026-12-31'
  },
  {
    id: 'hotel-p2',
    sku: 'LIN-302',
    name: '300TC Percale Queen Flat Sheet',
    category: 'Linen & Bedding',
    agreedPrice: 14.00,
    unit: 'EA',
    packSize: 'Single Unit Poly Wrapped',
    effectiveFrom: '2026-01-01',
    effectiveTo: '2026-12-31'
  },
  {
    id: 'hotel-p3',
    sku: 'TOW-401',
    name: 'Turkish Cotton Bath Towel 700gsm (12/pk)',
    category: 'Linen & Bedding',
    agreedPrice: 72.00,
    unit: 'PACK',
    packSize: '12 Units per Bundle',
    effectiveFrom: '2026-01-01',
    effectiveTo: '2026-12-31'
  },
  {
    id: 'hotel-p4',
    sku: 'BED-505',
    name: 'Premium Microfiber Pillow Insert',
    category: 'Linen & Bedding',
    agreedPrice: 8.50,
    unit: 'EA',
    packSize: 'Single Vacuum Pack',
    effectiveFrom: '2026-01-01',
    effectiveTo: '2026-12-31'
  },
  {
    id: 'hotel-p5',
    sku: 'CHEM-101',
    name: 'Sanitizing Surface Cleaner 4x1 Gal',
    category: 'Housekeeping Chemicals',
    agreedPrice: 44.00,
    unit: 'CASE',
    packSize: '4 x 1 Gallon Case',
    effectiveFrom: '2026-01-01',
    effectiveTo: '2026-12-31',
    notes: 'Case of 4 gallons. Single gallon bottle is $11.00.'
  },
  {
    id: 'hotel-p6',
    sku: 'CHEM-202',
    name: 'Heavy Duty Laundry Detergent 50 lb',
    category: 'Housekeeping Chemicals',
    agreedPrice: 68.00,
    unit: 'PAIL',
    packSize: '50 lb Commercial Drum',
    effectiveFrom: '2026-01-01',
    effectiveTo: '2026-12-31'
  }
];

export const HOTEL_INVOICES: InvoiceDocument[] = [
  {
    id: 'inv-lc-4401',
    invoiceNumber: 'INV-LC-4401',
    supplierName: 'LinenCraft Hospitality Supply',
    invoiceDate: '2026-10-12',
    dueDate: '2026-11-11',
    currency: 'USD',
    subtotal: 4897.50,
    taxAmount: 0.00,
    totalAmount: 4897.50,
    sourceFileName: 'linencraft_inv_4401.pdf',
    lineItems: [
      {
        id: 'li-lc-1',
        lineIndex: 0,
        rawCode: 'LIN-301',
        rawDescription: 'KING FLAT SHEET 300TC WHITE',
        quantity: 150,
        unit: 'EA',
        invoicedUnitPrice: 18.25, // Agreed is $16.50 -> OVERCHARGE $262.50
        lineTotal: 2737.50,
        sourceTextRef: 'Line 1: LIN-301 KING FLAT SHEET 300TC WHITE - 150 EA @ $18.25 = $2,737.50'
      },
      {
        id: 'li-lc-2',
        lineIndex: 1,
        rawCode: 'TOW-401',
        rawDescription: 'BATH TOWEL TURKISH 700GSM 12PK',
        quantity: 30,
        unit: 'PACK',
        invoicedUnitPrice: 72.00, // Matches agreed $72.00
        lineTotal: 2160.00,
        sourceTextRef: 'Line 2: TOW-401 BATH TOWEL TURKISH 700GSM 12PK - 30 PK @ $72.00 = $2,160.00'
      }
    ]
  },
  {
    // DUPLICATE INVOICE SUBMITTED IN ERROR BY SUPPLIER
    id: 'inv-lc-4401-dup',
    invoiceNumber: 'INV-LC-4401',
    supplierName: 'LinenCraft Hospitality Supply',
    invoiceDate: '2026-10-14',
    dueDate: '2026-11-11',
    currency: 'USD',
    subtotal: 4897.50,
    taxAmount: 0.00,
    totalAmount: 4897.50,
    sourceFileName: 'linencraft_inv_4401_reissued.pdf',
    lineItems: [
      {
        id: 'li-lc-dup-1',
        lineIndex: 0,
        rawCode: 'LIN-301',
        rawDescription: 'KING FLAT SHEET 300TC WHITE',
        quantity: 150,
        unit: 'EA',
        invoicedUnitPrice: 18.25,
        lineTotal: 2737.50,
        sourceTextRef: 'Duplicate copy of Line 1'
      },
      {
        id: 'li-lc-dup-2',
        lineIndex: 1,
        rawCode: 'TOW-401',
        rawDescription: 'BATH TOWEL TURKISH 700GSM 12PK',
        quantity: 30,
        unit: 'PACK',
        invoicedUnitPrice: 72.00,
        lineTotal: 2160.00,
        sourceTextRef: 'Duplicate copy of Line 2'
      }
    ]
  },
  {
    id: 'inv-cs-9912',
    invoiceNumber: 'INV-CS-9912',
    supplierName: 'CleanStay Hospitality Chemicals',
    invoiceDate: '2026-10-25',
    dueDate: '2026-11-24',
    currency: 'USD',
    subtotal: 1032.00,
    taxAmount: 0.00,
    totalAmount: 1032.00,
    sourceFileName: 'cleanstay_inv_9912.pdf',
    lineItems: [
      {
        id: 'li-cs-1',
        lineIndex: 0,
        rawCode: 'CHEM-101',
        rawDescription: 'SURFACE SANITIZER 1 GAL SINGLE BOTTLE',
        quantity: 8,
        unit: 'BOTTLE',
        invoicedUnitPrice: 44.00, // Pack size mismatch! Billed as case price ($44) for single gallons!
        lineTotal: 352.00,
        sourceTextRef: 'Line 1: CHEM-101 SURFACE SANITIZER 1 GAL SINGLE BOTTLE - 8 BTL @ $44.00 = $352.00'
      },
      {
        id: 'li-cs-2',
        lineIndex: 1,
        rawCode: 'CHEM-202',
        rawDescription: 'COMMERCIAL LAUNDRY DETERGENT 50#',
        quantity: 10,
        unit: 'PAIL',
        invoicedUnitPrice: 68.00, // Matches agreed $68.00
        lineTotal: 680.00,
        sourceTextRef: 'Line 2: CHEM-202 COMMERCIAL LAUNDRY DETERGENT 50# - 10 PL @ $68.00 = $680.00'
      }
    ]
  }
];

// Precompute the real audit results using our deterministic engine
const restaurantAuditResult = runInvoiceAudit(RESTAURANT_PRICELIST, RESTAURANT_INVOICES);
const hotelAuditResult = runInvoiceAudit(HOTEL_PRICELIST, HOTEL_INVOICES);

export const SAMPLE_RESTAURANT_AUDIT: AuditSession = {
  id: 'sample-restaurant-session',
  userId: 'demo-user',
  title: 'The Brass Palm Group (F&B Audit Q4)',
  supplierName: 'Artisan Meats & Pacific Coast',
  industry: 'restaurant',
  createdAt: '2026-10-30',
  priceList: RESTAURANT_PRICELIST,
  invoices: RESTAURANT_INVOICES,
  findings: restaurantAuditResult.findings,
  summary: restaurantAuditResult.summary
};

export const SAMPLE_HOTEL_AUDIT: AuditSession = {
  id: 'sample-hotel-session',
  userId: 'demo-user',
  title: 'The Grandview Hotel & Suites (Operations Audit Q4)',
  supplierName: 'LinenCraft & CleanStay Chemicals',
  industry: 'hotel',
  createdAt: '2026-10-30',
  priceList: HOTEL_PRICELIST,
  invoices: HOTEL_INVOICES,
  findings: hotelAuditResult.findings,
  summary: hotelAuditResult.summary
};
