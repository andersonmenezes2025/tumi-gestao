
/**
 * Security utilities for production
 */

// Enhanced input sanitization
export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .trim()
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove script content
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    // Remove javascript: URLs
    .replace(/javascript:/gi, '')
    // Remove on* event handlers
    .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '')
    // HTML entity encode special characters
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Sanitize HTML content while preserving safe tags
export const sanitizeHTML = (html: string): string => {
  if (!html || typeof html !== 'string') return '';
  
  // Allow only safe HTML tags and attributes
  const allowedTags = ['b', 'i', 'u', 'em', 'strong', 'p', 'br', 'span'];
  const tagRegex = /<(\/?)([\w]+)([^>]*)>/gi;
  
  return html.replace(tagRegex, (match, closing, tagName, attributes) => {
    if (allowedTags.includes(tagName.toLowerCase())) {
      // Remove potentially dangerous attributes
      const cleanAttributes = attributes.replace(/\s*(on\w+|javascript:|data:|style)\s*=\s*["'][^"']*["']/gi, '');
      return `<${closing}${tagName}${cleanAttributes}>`;
    }
    return ''; // Remove disallowed tags
  });
};

// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation
export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

// Phone validation (Brazilian format)
export const validatePhone = (phone: string): boolean => {
  if (!phone) return true; // Phone is optional
  const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
  return phoneRegex.test(phone);
};

// CPF validation
export const validateCPF = (cpf: string): boolean => {
  if (!cpf) return true;
  const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
  return cpfRegex.test(cpf);
};

// CNPJ validation
export const validateCNPJ = (cnpj: string): boolean => {
  if (!cnpj) return true;
  const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
  return cnpjRegex.test(cnpj);
};

// CEP validation
export const validateCEP = (cep: string): boolean => {
  if (!cep) return true;
  const cepRegex = /^\d{5}-\d{3}$/;
  return cepRegex.test(cep);
};

// URL validation
export const validateURL = (url: string): boolean => {
  if (!url) return true;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Rate limiting helper (for client-side tracking)
export class RateLimiter {
  private attempts: { [key: string]: number[] } = {};
  
  constructor(private maxAttempts: number = 5, private windowMs: number = 60000) {}
  
  isAllowed(key: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    if (!this.attempts[key]) {
      this.attempts[key] = [];
    }
    
    // Remove old attempts
    this.attempts[key] = this.attempts[key].filter(time => time > windowStart);
    
    if (this.attempts[key].length >= this.maxAttempts) {
      return false;
    }
    
    this.attempts[key].push(now);
    return true;
  }
}

// Create a rate limiter instance for auth attempts
export const authRateLimiter = new RateLimiter(5, 60000); // 5 attempts per minute
