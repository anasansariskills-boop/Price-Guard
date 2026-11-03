import { AgreedProduct, InvoiceDocument, LeadSubmission, AuditSession, UserAccount } from '../types/index.ts';

const TOKEN_KEY = 'priceguard_auth_token';
const USER_KEY = 'priceguard_auth_user';

export function getStoredAuth(): { token: string | null; user: UserAccount | null } {
  const token = localStorage.getItem(TOKEN_KEY);
  const userJson = localStorage.getItem(USER_KEY);
  return {
    token,
    user: userJson ? JSON.parse(userJson) : null
  };
}

export function setStoredAuth(token: string, user: UserAccount): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// Authentication API
export async function registerAccount(params: {
  email: string;
  password: string;
  name: string;
  businessName: string;
  businessType?: string;
}): Promise<{ success: boolean; user?: UserAccount; error?: string }> {
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Registration failed.' };
    }
    setStoredAuth(data.token, data.user);
    return { success: true, user: data.user };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error registering account.' };
  }
}

export async function loginAccount(params: {
  email: string;
  password: string;
}): Promise<{ success: boolean; user?: UserAccount; error?: string }> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Login failed.' };
    }
    setStoredAuth(data.token, data.user);
    return { success: true, user: data.user };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error logging in.' };
  }
}

export async function logoutAccount(): Promise<void> {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: authHeaders()
    });
  } catch {
    // Ignore network error on logout
  }
  clearStoredAuth();
}

export async function submitLeadRequest(lead: LeadSubmission): Promise<{ success: boolean; leadId?: string; error?: string }> {
  try {
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead)
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Failed to submit request.' };
    }
    return { success: true, leadId: data.leadId };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error submitting request.' };
  }
}

export async function extractInvoiceFromDocument(params: {
  text?: string;
  fileData?: string;
  mimeType?: string;
  fileName?: string;
}): Promise<{ success: boolean; invoice?: InvoiceDocument; error?: string; method?: string }> {
  try {
    const res = await fetch('/api/extract/invoice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(params)
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Extraction failed.' };
    }
    return { success: true, invoice: data.invoice, method: data.method };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error processing invoice.' };
  }
}

export async function parsePriceList(params: {
  fileData?: string;
  fileName?: string;
  csvContent?: string;
  textContent?: string;
  supplierName?: string;
}): Promise<{ success: boolean; products?: AgreedProduct[]; error?: string; format?: string }> {
  try {
    const res = await fetch('/api/extract/pricelist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(params)
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Price list parsing failed.' };
    }
    return { success: true, products: data.products, format: data.format };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error parsing price list.' };
  }
}

export async function executeAudit(params: {
  priceList: AgreedProduct[];
  invoices: InvoiceDocument[];
  title?: string;
  supplierName?: string;
  industry?: 'restaurant' | 'hotel' | 'other';
}): Promise<{ success: boolean; audit?: AuditSession; error?: string }> {
  try {
    const res = await fetch('/api/audit/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(params)
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Audit run failed.' };
    }
    return { success: true, audit: data.audit };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error running audit.' };
  }
}

export async function getSavedAudits(): Promise<AuditSession[]> {
  try {
    const res = await fetch('/api/audits', { headers: authHeaders() });
    if (!res.ok) return [];
    const data = await res.json();
    return data.audits || [];
  } catch {
    return [];
  }
}

export async function deleteAuditSession(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/audits/${id}`, {
      method: 'DELETE',
      headers: authHeaders()
    });
    return res.ok;
  } catch {
    return false;
  }
}

export interface AIAssistantAction {
  type: string;
  target: string;
}

export async function askAIAssistant(params: {
  message: string;
  history?: Array<{ role: 'user' | 'assistant'; text: string }>;
  currentView?: string;
}): Promise<{ success: boolean; reply: string; action?: AIAssistantAction | null; source?: string; error?: string }> {
  try {
    const res = await fetch('/api/assistant/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, reply: data.error || 'Assistant service unavailable.' };
    }
    return {
      success: true,
      reply: data.reply,
      action: data.action,
      source: data.source
    };
  } catch (err: any) {
    return { success: false, reply: 'Network error communicating with AI guide.' };
  }
}

