/**
 * Modulo Validazione Real-time con Feedback Visivi
 * Validazione input lato client con messaggi di errore istantanei
 */

// ===== VALIDAZIONE EMAIL =====
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function showEmailError(inputElement, errorElement) {
  const email = inputElement.value.trim();
  
  if (!email) {
    setError(errorElement, 'Email obbligatoria');
    setInvalid(inputElement);
    return false;
  }
  
  if (!validateEmail(email)) {
    setError(errorElement, 'Email non valida');
    setInvalid(inputElement);
    return false;
  }
  
  clearError(errorElement);
  setValid(inputElement);
  return true;
}

// ===== VALIDAZIONE PASSWORD =====
export function validatePassword(password) {
  const errors = [];
  
  if (password.length < 6) {
    errors.push('Minimo 6 caratteri');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Almeno una maiuscola');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Almeno un numero');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    strength: calculatePasswordStrength(password)
  };
}

export function showPasswordError(inputElement, errorElement) {
  const password = inputElement.value;
  
  if (!password) {
    setError(errorElement, 'Password obbligatoria');
    setInvalid(inputElement);
    return false;
  }
  
  const validation = validatePassword(password);
  
  if (!validation.isValid) {
    setError(errorElement, validation.errors[0]);
    setInvalid(inputElement);
    return false;
  }
  
  clearError(errorElement);
  setValid(inputElement);
  return true;
}

export function updatePasswordStrength(inputElement, strengthBar) {
  const password = inputElement.value;
  const validation = validatePassword(password);
  const strength = validation.strength;
  
  if (strengthBar) {
    strengthBar.className = 'strength-bar';
    strengthBar.classList.add(`strength-${strength}`);
    
    const strengthText = {
      'weak': 'Debole',
      'fair': 'Accettabile',
      'good': 'Buona',
      'strong': 'Forte'
    };
    
    const textElement = strengthBar.parentElement.querySelector('.strength-text');
    if (textElement) {
      textElement.textContent = strengthText[strength] || '';
    }
  }
}

// ===== VALIDAZIONE QUANTITÀ =====
export function validateQuantity(quantity) {
  const num = parseFloat(quantity);
  
  if (isNaN(num) || num <= 0) {
    return {
      isValid: false,
      error: 'La quantità deve essere un numero positivo'
    };
  }
  
  return { isValid: true };
}

export function showQuantityError(inputElement, errorElement) {
  const validation = validateQuantity(inputElement.value);
  
  if (!validation.isValid) {
    setError(errorElement, validation.error);
    setInvalid(inputElement);
    return false;
  }
  
  clearError(errorElement);
  setValid(inputElement);
  return true;
}

// ===== VALIDAZIONE SELEZIONE =====
export function validateSelection(selectElement) {
  return selectElement.value !== '';
}

export function showSelectionError(selectElement, errorElement) {
  if (!validateSelection(selectElement)) {
    setError(errorElement, 'Seleziona un\'opzione');
    setInvalid(selectElement);
    return false;
  }
  
  clearError(errorElement);
  setValid(selectElement);
  return true;
}

// ===== VALIDAZIONE FORM COMPLETO =====
export function validateForm(formData) {
  const errors = {};
  
  if (!formData.email) {
    errors.email = 'Email obbligatoria';
  } else if (!validateEmail(formData.email)) {
    errors.email = 'Email non valida';
  }
  
  if (!formData.password) {
    errors.password = 'Password obbligatoria';
  } else {
    const validation = validatePassword(formData.password);
    if (!validation.isValid) {
      errors.password = validation.errors[0];
    }
  }
  
  if (formData.passwordConfirm && formData.password !== formData.passwordConfirm) {
    errors.passwordConfirm = 'Le password non coincidono';
  }
  
  if (formData.name && formData.name.trim().length < 2) {
    errors.name = 'Il nome deve avere almeno 2 caratteri';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// ===== UTILITY FUNZIONI =====
function setError(element, message) {
  if (!element) return;
  element.textContent = message;
  element.style.display = 'block';
  element.classList.add('show');
}

function clearError(element) {
  if (!element) return;
  element.textContent = '';
  element.style.display = 'none';
  element.classList.remove('show');
}

function setInvalid(element) {
  element.classList.add('invalid');
  element.classList.remove('valid');
}

function setValid(element) {
  element.classList.add('valid');
  element.classList.remove('invalid');
}

// ===== CALCOLO FORZA PASSWORD =====
function calculatePasswordStrength(password) {
  let strength = 0;
  
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;
  
  if (strength <= 1) return 'weak';
  if (strength <= 2) return 'fair';
  if (strength <= 3) return 'good';
  return 'strong';
}

// ===== VALIDAZIONE PREVENTIVO =====
export function validateQuoteForm(formData) {
  const errors = [];
  
  if (!formData.quantity || formData.quantity <= 0) {
    errors.push('Quantità non valida');
  }
  
  if (!formData.region) {
    errors.push('Regione non selezionata');
  }
  
  if (!formData.quality) {
    errors.push('Qualità non selezionata');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// ===== FEEDBACK VISIVO GLOBALE =====
export function showSuccessMessage(message, duration = 3000) {
  const toast = document.createElement('div');
  toast.className = 'toast toast-success';
  toast.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('show');
  }, 100);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

export function showErrorMessage(message, duration = 3000) {
  const toast = document.createElement('div');
  toast.className = 'toast toast-error';
  toast.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('show');
  }, 100);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

export function showWarningMessage(message, duration = 3000) {
  const toast = document.createElement('div');
  toast.className = 'toast toast-warning';
  toast.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('show');
  }, 100);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ===== DEBOUNCE PER VALIDAZIONE REAL-TIME =====
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ===== SETUP VALIDAZIONE REAL-TIME =====
export function setupRealtimeValidation(inputElement, validationFn, errorElement) {
  const debouncedValidation = debounce(() => {
    validationFn(inputElement, errorElement);
  }, 300);
  
  inputElement.addEventListener('input', debouncedValidation);
  inputElement.addEventListener('blur', () => {
    validationFn(inputElement, errorElement);
  });
}

// ===== FORMATTAZIONE VALUTA =====
export function formatCurrency(value) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR"
  }).format(value);
}

// ===== VALIDAZIONE NUMERO POSITIVO =====
export function isPositiveNumber(value) {
  const num = Number(value);
  return !isNaN(num) && num > 0;
}
