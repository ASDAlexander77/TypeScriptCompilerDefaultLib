function main() 
{
  const city = 'istanbul';

  console.log(city.toLocaleUpperCase('en-US'));
  // Expected output: "ISTANBUL"

  console.log(city.toLocaleUpperCase('TR'));
  // Expected output: "İSTANBUL"

  console.log("alphabet".toLocaleUpperCase()); // 'ALPHABET'
}