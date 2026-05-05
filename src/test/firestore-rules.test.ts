import { initializeTestEnvironment, RulesTestContext, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { describe, it, beforeAll, afterAll, beforeEach } from 'vitest';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'preventivi-smart-test',
    firestore: {
      rules: readFileSync('firestore.rules', 'utf8'),
      host: 'localhost',
      port: 8080,
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

describe('Firestore Rules', () => {
  it('User autenticato può creare propria quote', async () => {
    const user1 = testEnv.authenticatedContext('user-1');
    const quoteRef = user1
      .firestore()
      .collection('users')
      .doc('user-1')
      .collection('quotes')
      .doc('quote-1');

    const now = new Date();
    await assertSucceeds(
      quoteRef.set({
        id: 'quote-1',
        numero: '2026-001',
        uid: 'user-1',
        data: '2026-05-05',
        createdAt: now,
        updatedAt: now,
        cliente: 'Mario Rossi',
        ambito: 'edilizia',
        sottotipo: 'muratura',
        stato: 'bozza',
        source: 'manuale',
        servizi: [{ nome: 'test', prezzo: 100 }],
        totale: 100
      })
    );
  });

  it('User NON può leggere quote di altri', async () => {
    const user1 = testEnv.authenticatedContext('user-1');
    const user2QuoteRef = user1
      .firestore()
      .collection('users')
      .doc('user-2')
      .collection('quotes')
      .doc('quote-1');

    await assertFails(user2QuoteRef.get());
  });

  it('Unauthenticated user NON può creare quote', async () => {
    const unauth = testEnv.unauthenticatedContext();
    const quoteRef = unauth
      .firestore()
      .collection('users')
      .doc('user-1')
      .collection('quotes')
      .doc('quote-1');

    await assertFails(quoteRef.set({ id: 'quote-1' }));
  });

  it('Quote deve avere struttura valida', async () => {
    const user = testEnv.authenticatedContext('user-1');
    const quoteRef = user
      .firestore()
      .collection('users')
      .doc('user-1')
      .collection('quotes')
      .doc('quote-1');

    // ❌ Missing fields
    await assertFails(quoteRef.set({ totale: 5000 }));
  });
});
