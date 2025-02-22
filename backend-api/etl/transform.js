// transform.js
function transformRecord(record) {
    // Build an array of proprietor objects from CSV fields.
    const proprietors = [];
    // Loop for up to 4 proprietor entries
    for (let i = 1; i <= 4; i++) {
      const name = record[`Proprietor Name (${i})`];
      if (name && name.trim() !== '') {
        proprietors.push({
          name,
          companyRegistrationNo: record[`Company Registration No. (${i})`],
          proprietorshipCategory: record[`Proprietorship Category (${i})`],
          address1: record[`Proprietor (${i}) Address (1)`],
          address2: record[`Proprietor (${i}) Address (2)`],
          address3: record[`Proprietor (${i}) Address (3)`]
        });
      }
    }
  
    // Convert date from 'dd-mm-yyyy' format to a Date object.
    let dateProprietorAdded = null;
    if (record['Date Proprietor Added']) {
      const [day, month, year] = record['Date Proprietor Added'].split('-');
      dateProprietorAdded = new Date(year, month - 1, day);
    }
  
    return {
      titleNumber: record['Title Number'],
      tenure: record['Tenure'],
      propertyAddress: record['Property Address'],
      district: record['District'],
      county: record['County'],
      region: record['Region'],
      postcode: record['Postcode'],
      multipleAddressIndicator: record['Multiple Address Indicator'] === 'Y',
      pricePaid: Number(record['Price Paid']),
      proprietors,
      dateProprietorAdded,
      additionalProprietorIndicator: record['Additional Proprietor Indicator'] === 'Y'
    };
  }
  
  module.exports = transformRecord;
  