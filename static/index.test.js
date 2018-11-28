test('split',()=>{
  let s="Hello\n awesome, world!";
  expect(s.split('\n')[0]).toBe('Hello');
  expect(s).toBe("Hello\n awesome, world!");
})