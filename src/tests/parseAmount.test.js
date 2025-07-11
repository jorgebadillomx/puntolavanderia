const assert = require('assert');
const { test } = require('node:test');
const { parseAmount } = require('../utils/parseAmount');

test('comma and dot decimals parse equally', () => {
  assert.strictEqual(parseAmount('1,50'), 1.5);
  assert.strictEqual(parseAmount('1.50'), 1.5);
});