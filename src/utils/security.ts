
/**
 * Security utilities for production
 */

// Input sanitization
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
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
