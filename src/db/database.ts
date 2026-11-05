import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { UserAccount, AuditSession, LeadSubmission } from '../types/index.ts';

const DB_DIR = path.resolve('./data');
const DB_PATH = path.join(DB_DIR, 'priceguard.db');
const UPLOADS_DIR = path.join(DB_DIR, 'private_uploads');

if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Initialize database with WAL mode for concurrent performance
const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

// Create Relational Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    name TEXT NOT NULL,
    business_name TEXT NOT NULL,
    business_type TEXT DEFAULT 'Restaurant',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS audits (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    supplier_name TEXT NOT NULL,
    industry TEXT NOT NULL,
    created_at TEXT NOT NULL,
    price_list_json TEXT NOT NULL,
    invoices_json TEXT NOT NULL,
    findings_json TEXT NOT NULL,
    summary_json TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    business_name TEXT NOT NULL,
    business_type TEXT NOT NULL,
    locations_count TEXT NOT NULL,
    estimated_monthly_spend TEXT,
    message TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS uploaded_files (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    audit_id TEXT,
    original_name TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size_bytes INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
  CREATE INDEX IF NOT EXISTS idx_audits_user ON audits(user_id);
`);

// Password helpers
export function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

// Seed default demo user with secure hashed credentials
const findDemoUser = db.prepare('SELECT id FROM users WHERE id = ?');
const demoSalt = crypto.randomBytes(16).toString('hex');
const demoHash = hashPassword('DemoAccess2026!', demoSalt);

if (!findDemoUser.get('demo-user')) {
  const insertUser = db.prepare(`
    INSERT INTO users (id, email, password_hash, salt, name, business_name, business_type, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertUser.run(
    'demo-user',
    'demo@priceguard.audit',
    demoHash,
    demoSalt,
    'Hospitality Procurement Demo',
    'The Brass Palm Hospitality Group',
    'Restaurant',
    new Date().toISOString()
  );
} else {
  // Ensure existing demo-user has valid hash so it cannot be bypassed
  db.prepare('UPDATE users SET password_hash = ?, salt = ? WHERE id = ?').run(demoHash, demoSalt, 'demo-user');
}

// User Operations
export function createUser(data: {
  email: string;
  password: string;
  name: string;
  businessName: string;
  businessType?: string;
}): { user: UserAccount; token: string } {
  const normalizedEmail = data.email.trim().toLowerCase();
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);
  if (existing) {
    throw new Error('An account with this email already exists.');
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPassword(data.password, salt);
  const userId = `usr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const createdAt = new Date().toISOString();

  const insert = db.prepare(`
    INSERT INTO users (id, email, password_hash, salt, name, business_name, business_type, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insert.run(
    userId,
    normalizedEmail,
    passwordHash,
    salt,
    data.name.trim(),
    (data.businessName || 'Hospitality Business').trim(),
    data.businessType || 'Restaurant',
    createdAt
  );

  const token = createSession(userId);
  return {
    user: {
      id: userId,
      email: normalizedEmail,
      name: data.name.trim(),
      businessName: data.businessName.trim(),
      businessType: data.businessType || 'Restaurant',
      createdAt
    },
    token
  };
}

export function authenticateUser(email: string, password: string): { user: UserAccount; token: string } | null {
  const normalizedEmail = email.trim().toLowerCase();
  const row = db.prepare('SELECT * FROM users WHERE email = ?').get(normalizedEmail) as any;
  if (!row) return null;

  // Strict password verification for ALL accounts including demo-user. No bypasses.
  const computedHash = hashPassword(password, row.salt);
  if (computedHash !== row.password_hash) return null;

  const token = createSession(row.id);
  return {
    user: {
      id: row.id,
      email: row.email,
      name: row.name,
      businessName: row.business_name,
      businessType: row.business_type,
      createdAt: row.created_at
    },
    token
  };
}

export function getUserById(userId: string): UserAccount | null {
  const row = db.prepare('SELECT id, email, name, business_name, business_type, created_at FROM users WHERE id = ?').get(userId) as any;
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    businessName: row.business_name,
    businessType: row.business_type,
    createdAt: row.created_at
  };
}

// Session Operations
export function createSession(userId: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
  const createdAt = new Date().toISOString();

  const insert = db.prepare('INSERT INTO sessions (token, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)');
  insert.run(token, userId, expiresAt, createdAt);
  return token;
}

export function validateSession(token: string): string | null {
  const row = db.prepare('SELECT user_id, expires_at FROM sessions WHERE token = ?').get(token) as any;
  if (!row) return null;
  if (Date.now() > row.expires_at) {
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
    return null;
  }
  return row.user_id;
}

export function destroySession(token: string): void {
  db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
}

// Audit Operations (Strictly isolated by user_id)
export function saveAuditSession(audit: AuditSession): void {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO audits (id, user_id, title, supplier_name, industry, created_at, price_list_json, invoices_json, findings_json, summary_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    audit.id,
    audit.userId,
    audit.title,
    audit.supplierName,
    audit.industry,
    audit.createdAt,
    JSON.stringify(audit.priceList),
    JSON.stringify(audit.invoices),
    JSON.stringify(audit.findings),
    JSON.stringify(audit.summary)
  );
}

export function getAuditsForUser(userId: string): AuditSession[] {
  if (!userId) return [];
  // Strictly return only audits belonging to this authenticated user
  const rows = db.prepare(`
    SELECT * FROM audits WHERE user_id = ?
    ORDER BY created_at DESC
  `).all(userId) as any[];

  return rows.map(r => ({
    id: r.id,
    userId: r.user_id,
    title: r.title,
    supplierName: r.supplier_name,
    industry: r.industry,
    createdAt: r.created_at,
    priceList: JSON.parse(r.price_list_json),
    invoices: JSON.parse(r.invoices_json),
    findings: JSON.parse(r.findings_json),
    summary: JSON.parse(r.summary_json)
  }));
}

export function getAuditById(auditId: string, userId: string): AuditSession | null {
  if (!userId) return null;
  // Strictly isolate private audits by user_id
  const r = db.prepare(`
    SELECT * FROM audits WHERE id = ? AND user_id = ?
  `).get(auditId, userId) as any;

  if (!r) return null;
  return {
    id: r.id,
    userId: r.user_id,
    title: r.title,
    supplierName: r.supplier_name,
    industry: r.industry,
    createdAt: r.created_at,
    priceList: JSON.parse(r.price_list_json),
    invoices: JSON.parse(r.invoices_json),
    findings: JSON.parse(r.findings_json),
    summary: JSON.parse(r.summary_json)
  };
}

export function deleteAuditById(auditId: string, userId: string): boolean {
  if (!userId) return false;
  // Sample demonstration audits are read-only
  if (auditId.startsWith('sample-') || auditId === 'sample-restaurant-session' || auditId === 'sample-hotel-session') {
    return false;
  }

  // Find associated private files to remove from disk
  const files = db.prepare('SELECT id, storage_path FROM uploaded_files WHERE audit_id = ? AND user_id = ?').all(auditId, userId) as any[];
  files.forEach(f => {
    try {
      if (fs.existsSync(f.storage_path)) fs.unlinkSync(f.storage_path);
    } catch (err) {
      console.warn('Failed to delete file from disk:', f.storage_path, err);
    }
  });

  // Delete records from uploaded_files table
  db.prepare('DELETE FROM uploaded_files WHERE audit_id = ? AND user_id = ?').run(auditId, userId);

  // Strictly delete audit only if owned by this user
  const res = db.prepare('DELETE FROM audits WHERE id = ? AND user_id = ?').run(auditId, userId);
  return res.changes > 0;
}

// File Storage Helpers
export function registerUploadedFile(userId: string, originalName: string, buffer: Buffer, mimeType: string, auditId?: string): { fileId: string; storagePath: string } {
  const fileId = `file_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const safeFilename = `${fileId}_${path.basename(originalName).replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const storagePath = path.join(UPLOADS_DIR, safeFilename);

  fs.writeFileSync(storagePath, buffer);

  const stmt = db.prepare(`
    INSERT INTO uploaded_files (id, user_id, audit_id, original_name, storage_path, mime_type, size_bytes, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(fileId, userId, auditId || null, originalName, storagePath, mimeType, buffer.length, new Date().toISOString());
  return { fileId, storagePath };
}

export function linkFilesToAudit(auditId: string, userId: string, fileIds: string[]): void {
  if (!fileIds || fileIds.length === 0 || !userId) return;
  const updateStmt = db.prepare('UPDATE uploaded_files SET audit_id = ? WHERE id = ? AND user_id = ?');
  for (const fid of fileIds) {
    updateStmt.run(auditId, fid, userId);
  }
}

// Lead Operations
export function saveLead(lead: LeadSubmission): string {
  const leadId = `lead_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
  const stmt = db.prepare(`
    INSERT INTO leads (id, name, email, business_name, business_type, locations_count, estimated_monthly_spend, message, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    leadId,
    lead.name.trim(),
    lead.email.trim().toLowerCase(),
    lead.businessName.trim(),
    lead.businessType,
    lead.locationsCount,
    lead.estimatedMonthlySpend || 'Not specified',
    lead.message || '',
    new Date().toISOString()
  );
  return leadId;
}

export function getAllLeads(): LeadSubmission[] {
  const rows = db.prepare('SELECT * FROM leads ORDER BY created_at DESC').all() as any[];
  return rows.map(r => ({
    id: r.id,
    name: r.name,
    email: r.email,
    businessName: r.business_name,
    businessType: r.business_type,
    locationsCount: r.locations_count,
    estimatedMonthlySpend: r.estimated_monthly_spend,
    message: r.message,
    createdAt: r.created_at
  }));
}

export function getDatabaseStats() {
  const usersCount = (db.prepare('SELECT COUNT(*) as c FROM users').get() as any).c;
  const auditsCount = (db.prepare('SELECT COUNT(*) as c FROM audits').get() as any).c;
  const leadsCount = (db.prepare('SELECT COUNT(*) as c FROM leads').get() as any).c;
  const filesCount = (db.prepare('SELECT COUNT(*) as c FROM uploaded_files').get() as any).c;
  return {
    engine: 'SQLite (node:sqlite DatabaseSync)',
    dbPath: DB_PATH,
    usersCount,
    auditsCount,
    leadsCount,
    filesCount
  };
}
