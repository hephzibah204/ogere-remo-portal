// Mock database records / serverless resolver for Ogere Digital IDs
const VERIFIED_IDS = {
  'OGR-782910': {
    id: 'OGR-782910',
    fullName: 'Adewale Babatunde Ogunleke',
    cardType: 'indigene',
    dob: '1992-06-14',
    compound: 'Kankanbina',
    quarter: 'Oke-Ogere',
    occupation: 'Civil Engineer',
    status: 'approved',
    issuedDate: '2024-01-15',
    expiryDate: '2027-01-15',
    verifiedBy: 'HRH Ologere Palace Office',
  },
  'OGR-D-492019': {
    id: 'OGR-D-492019',
    fullName: 'Dr. Folashade Adeyemi-Clark',
    cardType: 'diaspora',
    dob: '1985-11-22',
    compound: 'Ejigboye',
    quarter: 'Isale-Ogere',
    occupation: 'Consultant Surgeon',
    status: 'approved',
    issuedDate: '2024-03-01',
    expiryDate: '2027-03-01',
    verifiedBy: 'OCDA Diaspora Secretariat',
  },
  'OGR-R-839201': {
    id: 'OGR-R-839201',
    fullName: 'Chief Emeka Okafor',
    cardType: 'resident',
    dob: '1978-04-09',
    compound: 'Other',
    quarter: 'Ajura Zone',
    occupation: 'Logistics Director',
    status: 'approved',
    issuedDate: '2023-11-12',
    expiryDate: '2026-11-12',
    verifiedBy: 'Ogere Central Community Council',
  },
};

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { code, id } = req.query;
  const lookupKey = (code || id || '').trim().toUpperCase();

  if (!lookupKey) {
    return res.status(400).json({
      success: false,
      error: 'Please provide a valid ID card reference number (e.g. OGR-782910)',
    });
  }

  const found = VERIFIED_IDS[lookupKey];

  if (found) {
    return res.status(200).json({
      success: true,
      valid: true,
      data: found,
      verificationTimestamp: new Date().toISOString(),
      issuer: 'Kingdom of Ogere Remo Official Registry',
    });
  }

  return res.status(404).json({
    success: false,
    valid: false,
    message: `No active official community ID record found matching reference "${lookupKey}".`,
  });
}
