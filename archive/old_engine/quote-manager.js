/**
 * Quote Manager v2.0 — Preventivi-Smart Pro
 * Implementa le 5 regole base per stabilità e usabilità
 * 
 * REGOLE APPLICATE:
 * 1. UN UTENTE = SOLO I SUOI DATI (filtro uid sempre)
 * 2. STRUTTURA COMPLETA (numero, data, cliente, servizi, totale)
 * 3. VELOCITÀ (campi minimi, duplicazione, riutilizzo)
 * 4. ZERO AMBIGUITÀ (azioni chiare, conferme esplicite)
 * 5. PDF SEMPRE UTILIZZABILE (dati essenziali sempre presenti)
 */

import { 
    collection, 
    addDoc, 
    getDocs, 
    query, 
    where, 
    orderBy, 
    deleteDoc, 
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

// ===== SCHEMA QUOTE COMPLETO =====
export const QuoteSchema = {
    uid: String,              // Regola 1: Filtro proprietario
    numero: Number,           // Regola 2: Numero progressivo
    data: String,             // Regola 2: Data creazione (ISO)
    cliente: String,          // Regola 2: Nome cliente
    servizi: Array,           // Regola 2: Array di servizi
    totale: Number,           // Regola 2: Totale ben visibile
    note: String,             // Opzionale: Note interne
    createdAt: Number,        // Timestamp per ordinamento
    updatedAt: Number         // Timestamp ultimo aggiornamento
};

// ===== CLASSE QUOTE MANAGER =====
export class QuoteManager {
    constructor(db, userId) {
        this.db = db;
        this.userId = userId;
        this.quotesCollection = collection(db, "quotes");
    }

    /**
     * REGOLA 1: Crea query sempre filtrata per uid
     */
    getUserQuotesQuery() {
        return query(
            this.quotesCollection,
            where("uid", "==", this.userId),
            orderBy("createdAt", "desc")
        );
    }

    /**
     * REGOLA 2: Salva preventivo con struttura completa
     * @param {Object} quoteData - Dati preventivo
     * @returns {Promise<string>} ID del documento creato
     */
    async saveQuote(quoteData) {
        try {
            // Validazione struttura minima
            if (!quoteData.cliente || !quoteData.servizi || !quoteData.totale) {
                throw new Error("Dati incompleti: cliente, servizi e totale sono obbligatori");
            }

            // Calcola numero progressivo
            const numero = await this.getNextQuoteNumber();

            const completeQuote = {
                uid: this.userId,
                numero: numero,
                data: new Date().toISOString().split('T')[0],
                cliente: quoteData.cliente,
                servizi: Array.isArray(quoteData.servizi) ? quoteData.servizi : [quoteData.servizi],
                totale: parseFloat(quoteData.totale),
                note: quoteData.note || "",
                createdAt: Date.now(),
                updatedAt: Date.now()
            };

            const docRef = await addDoc(this.quotesCollection, completeQuote);
            return docRef.id;
        } catch (error) {
            console.error("Errore salvataggio preventivo:", error);
            throw error;
        }
    }

    /**
     * REGOLA 3: Duplica preventivo per velocità
     * @param {string} quoteId - ID preventivo da duplicare
     * @returns {Promise<string>} ID nuovo preventivo
     */
    async duplicateQuote(quoteId) {
        try {
            const docSnap = await getDocs(
                query(
                    this.quotesCollection,
                    where("uid", "==", this.userId),
                    where("__name__", "==", quoteId)
                )
            );

            if (docSnap.empty) throw new Error("Preventivo non trovato");

            const originalData = docSnap.docs[0].data();
            const numero = await this.getNextQuoteNumber();

            const duplicatedQuote = {
                ...originalData,
                numero: numero,
                data: new Date().toISOString().split('T')[0],
                createdAt: Date.now(),
                updatedAt: Date.now()
            };

            const docRef = await addDoc(this.quotesCollection, duplicatedQuote);
            return docRef.id;
        } catch (error) {
            console.error("Errore duplicazione preventivo:", error);
            throw error;
        }
    }

    /**
     * REGOLA 3: Carica ultimo preventivo per riutilizzo
     * @returns {Promise<Object|null>} Ultimo preventivo o null
     */
    async getLastQuote() {
        try {
            const q = query(
                this.quotesCollection,
                where("uid", "==", this.userId),
                orderBy("createdAt", "desc")
            );
            const snap = await getDocs(q);
            return snap.empty ? null : snap.docs[0].data();
        } catch (error) {
            console.error("Errore caricamento ultimo preventivo:", error);
            return null;
        }
    }

    /**
     * REGOLA 4: Elimina con conferma esplicita
     * @param {string} quoteId - ID preventivo da eliminare
     * @returns {Promise<boolean>} True se eliminato
     */
    async deleteQuote(quoteId) {
        try {
            // Verifica proprietà
            const docSnap = await getDocs(
                query(
                    this.quotesCollection,
                    where("uid", "==", this.userId),
                    where("__name__", "==", quoteId)
                )
            );

            if (docSnap.empty) throw new Error("Preventivo non trovato o non autorizzato");

            await deleteDoc(doc(this.quotesCollection, quoteId));
            return true;
        } catch (error) {
            console.error("Errore eliminazione preventivo:", error);
            throw error;
        }
    }

    /**
     * REGOLA 1: Carica tutti i preventivi dell'utente
     * @returns {Promise<Array>} Array di preventivi
     */
    async getAllQuotes() {
        try {
            const snap = await getDocs(this.getUserQuotesQuery());
            return snap.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error("Errore caricamento preventivi:", error);
            return [];
        }
    }

    /**
     * REGOLA 2: Calcola numero progressivo per utente
     * @returns {Promise<number>} Numero progressivo
     */
    async getNextQuoteNumber() {
        try {
            const snap = await getDocs(this.getUserQuotesQuery());
            return snap.size + 1;
        } catch (error) {
            console.error("Errore calcolo numero:", error);
            return 1;
        }
    }

    /**
     * REGOLA 5: Genera dati PDF completi
     * @param {string} quoteId - ID preventivo
     * @returns {Promise<Object>} Dati PDF strutturati
     */
    async getPDFData(quoteId) {
        try {
            const docSnap = await getDocs(
                query(
                    this.quotesCollection,
                    where("uid", "==", this.userId),
                    where("__name__", "==", quoteId)
                )
            );

            if (docSnap.empty) throw new Error("Preventivo non trovato");

            const data = docSnap.docs[0].data();

            return {
                numero: data.numero,
                data: data.data,
                cliente: data.cliente,
                servizi: data.servizi,
                totale: data.totale,
                note: data.note,
                createdAt: data.createdAt
            };
        } catch (error) {
            console.error("Errore recupero dati PDF:", error);
            throw error;
        }
    }
}

// ===== EXPORT DEFAULT =====
export default QuoteManager;
