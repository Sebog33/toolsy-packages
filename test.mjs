import { repairJson } from './packages/json-repair/dist/index.js';

const input = '{"name": John", "age": 30, "city": "New York "';
const result = repairJson(input, {
  logging: true,
});
console.log(result);
