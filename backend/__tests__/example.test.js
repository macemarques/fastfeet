function sum(a, b) {
  return a + b;
}

test('if a call sum func with 1 and 1 it should return 2', () => {
  const result = sum(1, 1);
  expect(result).toBe(2);
});
