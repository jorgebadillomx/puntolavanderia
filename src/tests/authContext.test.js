const assert = require('assert');
const { test } = require('node:test');

// Attempt to import the provider and abrirTurno function
const { AuthProvider } = require('../context/AuthContext.tsx');

// This test simulates calling abrirTurno with administrator credentials
// and expects setUser to be called with the administrator user object.

test('abrirTurno authenticates administrator user', async (t) => {
  const setUser = t.mock.fn();
  // In a real environment abrirTurno would come from the provider's value
  const { abrirTurno } = require('../context/AuthContext.tsx');
  await abrirTurno({ username: 'badis', billetes: '1983', monedas: '0' });
  assert.deepStrictEqual(setUser.mock.calls[0][0], { username: 'badis', role: 'administrador' });
});