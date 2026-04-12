/**
 * Preventivi-Smart Pro — Secure Loader v1.0
 * Caricamento dinamico e offuscamento di moduli sensibili
 * Impedisce il reverse-engineering del codice critico
 */

export class SecureLoader {
  constructor() {
    this.loadedModules = new Map();
    this.moduleCache = new WeakMap();
    this.integrityChecks = new Map();
  }

  /**
   * Carica un modulo in modo sicuro con verifica di integrità
   */
  async loadSecureModule(moduleName, modulePath, integrityHash = null) {
    // Controlla cache
    if (this.loadedModules.has(moduleName)) {
      return this.loadedModules.get(moduleName);
    }

    try {
      // Carica il modulo
      const module = await import(modulePath);

      // Verifica integrità se hash fornito
      if (integrityHash) {
        const moduleHash = await this.computeModuleHash(module);
        if (moduleHash !== integrityHash) {
          throw new Error(`Integrity check failed for ${moduleName}`);
        }
      }

      // Crea wrapper protetto
      const secureWrapper = this.createSecureWrapper(moduleName, module);

      // Salva in cache
      this.loadedModules.set(moduleName, secureWrapper);

      console.log(`%c✓ Secure module loaded: ${moduleName}`, "color: #059669; font-size: 11px;");
      return secureWrapper;

    } catch (error) {
      console.error(`Failed to load secure module ${moduleName}:`, error);
      throw error;
    }
  }

  /**
   * Crea un wrapper che protegge il modulo da accessi non autorizzati
   */
  createSecureWrapper(moduleName, module) {
    return new Proxy(module, {
      get: (target, prop) => {
        // Log accessi (opzionale)
        // console.log(`Accessing ${moduleName}.${String(prop)}`);

        // Blocca accessi a proprietà interne
        if (String(prop).startsWith("_") || String(prop) === "constructor") {
          throw new Error(`Access denied to ${moduleName}.${String(prop)}`);
        }

        return target[prop];
      },

      set: (target, prop, value) => {
        throw new Error(`Cannot modify ${moduleName}.${String(prop)}`);
      },

      deleteProperty: (target, prop) => {
        throw new Error(`Cannot delete ${moduleName}.${String(prop)}`);
      },

      ownKeys: (target) => {
        // Nasconde proprietà interne
        return Object.keys(target).filter(key => !key.startsWith("_"));
      },

      getOwnPropertyDescriptor: (target, prop) => {
        if (String(prop).startsWith("_")) {
          return undefined;
        }
        return Object.getOwnPropertyDescriptor(target, prop);
      }
    });
  }

  /**
   * Calcola hash di integrità di un modulo
   */
  async computeModuleHash(module) {
    const moduleStr = JSON.stringify(module);
    const encoder = new TextEncoder();
    const data = encoder.encode(moduleStr);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
  }

  /**
   * Offusca una funzione critica
   */
  obfuscateFunction(fn, name = "anonymous") {
    // Crea una versione offuscata della funzione
    const fnStr = fn.toString();
    const obfuscated = this.obfuscateCode(fnStr);

    // Ritorna una funzione che esegue il codice offuscato
    return new Function(`return (${obfuscated})`).call({});
  }

  /**
   * Offusca codice JavaScript
   */
  obfuscateCode(code) {
    // Rimuovi commenti
    code = code.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*/g, "");

    // Rinomina variabili
    const vars = new Set();
    const varRegex = /\b(var|let|const)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\b/g;
    let match;

    while ((match = varRegex.exec(code)) !== null) {
      vars.add(match[2]);
    }

    // Crea mappatura casuale
    const varMap = new Map();
    vars.forEach(v => {
      varMap.set(v, `_${Math.random().toString(36).substr(2, 9)}`);
    });

    // Sostituisci variabili
    varMap.forEach((newName, oldName) => {
      const regex = new RegExp(`\\b${oldName}\\b`, "g");
      code = code.replace(regex, newName);
    });

    // Comprimi spazi
    code = code.replace(/\s+/g, " ").trim();

    return code;
  }

  /**
   * Crea una funzione "dummy" che distrae dal codice reale
   */
  createDecoyFunction(realFunction) {
    const decoy = function() {
      // Codice decoy che non fa nulla
      const dummy = Math.random();
      const arr = [1, 2, 3, 4, 5];
      const sum = arr.reduce((a, b) => a + b, 0);
      console.log("Decoy function executed");
      return null;
    };

    // Ritorna la funzione reale, ma con un nome ingannevole
    Object.defineProperty(realFunction, "name", {
      value: "decoy_" + Math.random().toString(36).substr(2, 9)
    });

    return realFunction;
  }

  /**
   * Proteggi una funzione critica con timeout e rate limiting
   */
  createRateLimitedFunction(fn, maxCalls = 100, timeWindow = 60000) {
    let callCount = 0;
    let lastReset = Date.now();

    return (...args) => {
      const now = Date.now();

      // Reset counter se finestra temporale è passata
      if (now - lastReset > timeWindow) {
        callCount = 0;
        lastReset = now;
      }

      // Controlla rate limit
      if (callCount >= maxCalls) {
        throw new Error("Rate limit exceeded");
      }

      callCount++;
      return fn(...args);
    };
  }

  /**
   * Crea una funzione che si auto-distrugge dopo N esecuzioni
   */
  createSelfDestructingFunction(fn, maxExecutions = 1) {
    let executionCount = 0;

    return (...args) => {
      if (executionCount >= maxExecutions) {
        throw new Error("Function has been destroyed");
      }

      executionCount++;

      // Esegui la funzione
      const result = fn(...args);

      // Se raggiunto il limite, distruggi
      if (executionCount >= maxExecutions) {
        fn = null;
      }

      return result;
    };
  }

  /**
   * Cripta una stringa sensibile
   */
  encryptSensitiveString(str, key = "default") {
    // Usa una semplice XOR cipher per offuscamento base
    // In produzione, usa una libreria di crittografia vera
    const encoded = btoa(str); // Base64 encode
    let result = "";

    for (let i = 0; i < encoded.length; i++) {
      result += String.fromCharCode(
        encoded.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }

    return btoa(result); // Doppio encoding
  }

  /**
   * Decripta una stringa sensibile
   */
  decryptSensitiveString(encrypted, key = "default") {
    try {
      const decoded = atob(encrypted);
      let result = "";

      for (let i = 0; i < decoded.length; i++) {
        result += String.fromCharCode(
          decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length)
        );
      }

      return atob(result);
    } catch (e) {
      console.error("Decryption failed");
      return null;
    }
  }

  /**
   * Monitora accessi a variabili globali sensibili
   */
  protectGlobalVariable(varName, value) {
    const descriptor = {
      value: value,
      writable: false,
      enumerable: false,
      configurable: false
    };

    Object.defineProperty(window, varName, descriptor);

    // Monitora tentativi di accesso
    const handler = {
      get: (target, prop) => {
        if (prop === varName) {
          console.warn(`Access to protected variable: ${varName}`);
        }
        return target[prop];
      }
    };

    return new Proxy(window, handler);
  }

  /**
   * Genera un "canary" per rilevare modifiche non autorizzate
   */
  createIntegrityCanary(data) {
    const canary = {
      data: data,
      hash: this.simpleHash(JSON.stringify(data)),
      timestamp: Date.now(),
      checksum: Math.random()
    };

    return new Proxy(canary, {
      get: (target, prop) => {
        if (prop === "data") {
          // Verifica integrità
          const currentHash = this.simpleHash(JSON.stringify(target.data));
          if (currentHash !== target.hash) {
            throw new Error("Data integrity compromised");
          }
        }
        return target[prop];
      }
    });
  }

  /**
   * Hash semplice per verifiche di integrità
   */
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16);
  }

  /**
   * Crea una funzione che registra tutti gli accessi
   */
  createAuditedFunction(fn, functionName = "anonymous") {
    return (...args) => {
      const timestamp = new Date().toISOString();
      const callStack = new Error().stack;

      // Log della chiamata
      console.log(`[AUDIT] Function called: ${functionName} at ${timestamp}`);

      // Esegui la funzione
      try {
        const result = fn(...args);
        console.log(`[AUDIT] Function ${functionName} completed successfully`);
        return result;
      } catch (error) {
        console.error(`[AUDIT] Function ${functionName} failed:`, error);
        throw error;
      }
    };
  }
}

// ===== SINGLETON INSTANCE =====
export const secureLoader = new SecureLoader();

export default secureLoader;
