const { repairJson } = require('./dist/index');

const brokenJson = '{name: Seb, age: 42,}';
console.log(repairJson(brokenJson));
