process.env.ADMIN_KEY = 'test-admin-key';
import test from 'node:test';
import assert from 'node:assert/strict';

test('QA Test 1: Fallback DB Engine - Schema & Query Parser Remediation Verification', async (t) => {
  const { sqlQuery } = await import('../api/lib/db.js');

  await t.test('Health check query works', async () => {
    const res = await sqlQuery('SELECT NOW() as db_time');
    assert.equal(Array.isArray(res), true);
    assert.equal(res.length, 1);
    assert.ok(res[0].db_time);
  });

  await t.test('VERIFICATION: INSERT into fallbackStore succeeds with updated regex extractor', async () => {
    const insertQuery = 'INSERT INTO users (id, full_name, email, phone, password_hash, citizen_type, quarter, compound, id_card_number, role, agency_name, badge_number, is_officer_verified, is_verified) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, TRUE)';
    const params = ['u_qa_001', 'QA Test Citizen', 'qa_citizen@ogere.ng', '08012345678', 'hash', 'indigene', 'Oke-Ogere', 'Palace', 'OGR-QA-101', 'citizen', null, null, false];
    
    const insertRes = await sqlQuery(insertQuery, params);
    assert.equal(Array.isArray(insertRes), true);
    assert.equal(insertRes.length, 1, 'INSERT correctly records row into fallbackStore');
    assert.equal(insertRes[0].id, 'u_qa_001');
    assert.equal(insertRes[0].email, 'qa_citizen@ogere.ng');
  });

  await t.test('VERIFICATION: UPDATE in fallbackStore succeeds with updated regex extractor', async () => {
    const updateQuery = 'UPDATE id_cards SET status = $1, verified_by = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *';
    const params = ['approved', 'HRH Palace Secretary', 'OGR-782910'];

    const updateRes = await sqlQuery(updateQuery, params);
    assert.equal(Array.isArray(updateRes), true);
    assert.equal(updateRes.length, 1, 'UPDATE correctly mutates row in fallbackStore');
    assert.equal(updateRes[0].status, 'approved');
    assert.equal(updateRes[0].verified_by, 'HRH Palace Secretary');
  });
});

test('QA Test 2: Backend api/auth User Lifecycle & Persistence Remediation Verification', async (t) => {
  const authHandler = (await import('../api/auth.js')).default;
  
  await t.test('User registration generates valid response and token', async () => {
    const regReq = {
      method: 'POST',
      url: 'http://localhost/api/auth',
      headers: { host: 'localhost' },
      query: {},
      body: {
        action: 'register',
        fullName: 'Server Citizen',
        email: 'servercitizen@ogere.ng',
        phone: '08099881122',
        password: 'Password123!',
        citizenType: 'indigene',
        quarter: 'Oke-Ogere',
      },
    };

    let regStatus = 0;
    let regData = null;
    const regRes = {
      setHeader: () => {},
      status: (c) => { regStatus = c; return regRes; },
      json: (d) => { regData = d; return regRes; },
      end: () => regRes,
    };

    await authHandler(regReq, regRes);
    assert.equal(regStatus, 201);
    assert.equal(regData.success, true);
    assert.ok(regData.user.idCardNumber);
    assert.ok(regData.token);
  });

  await t.test('VERIFICATION: Login succeeds for registered user via fallback persistence', async () => {
    const loginReq = {
      method: 'POST',
      url: 'http://localhost/api/auth',
      headers: { host: 'localhost' },
      query: {},
      body: {
        action: 'login',
        identifier: 'servercitizen@ogere.ng',
        password: 'Password123!',
      },
    };

    let loginStatus = 0;
    let loginData = null;
    const loginRes = {
      setHeader: () => {},
      status: (c) => { loginStatus = c; return loginRes; },
      json: (d) => { loginData = d; return loginRes; },
      end: () => loginRes,
    };

    await authHandler(loginReq, loginRes);
    assert.equal(loginStatus, 200, 'Registered user successfully authenticates against persisted user record');
    assert.equal(loginData.success, true);
    assert.equal(loginData.user.email, 'servercitizen@ogere.ng');
    assert.ok(loginData.token);
  });
});

test('QA Test 3: Emergency Operations & Security Authorization Verification', async (t) => {
  const securityHandler = (await import('../api/security.js')).default;
  const adminActionsHandler = (await import('../api/admin-actions.js')).default;

  await t.test('Public user can dispatch incident report and trigger sitreps', async () => {
    const req = {
      method: 'POST',
      url: 'http://localhost/api/incidents',
      headers: { host: 'localhost' },
      body: {
        category: 'Armed Robbery / Banditry',
        severity: 'Critical',
        threatLevel: 'CODE_RED',
        location: 'KM 67 Lagos-Ibadan Expressway',
        description: 'Test incident from QA harness',
        reporterName: 'Anonymous Tester',
      },
    };

    let statusCode = 0;
    let respData = null;
    const res = {
      setHeader: () => {},
      status: (c) => { statusCode = c; return res; },
      json: (d) => { respData = d; return res; },
      end: () => res,
    };

    await securityHandler(req, res);
    assert.equal(statusCode, 201);
    assert.equal(respData.success, true);
    assert.equal(respData.incident.threat_level, 'CODE_RED');
  });

  await t.test('VERIFICATION: Unauthenticated user is BLOCKED from /api/admin-actions with 401', async () => {
    const req = {
      method: 'POST',
      url: 'http://localhost/api/admin-actions',
      headers: { host: 'localhost' }, // No Authorization header
      body: {
        actionType: 'id_card_status',
        targetId: 'OGR-782910',
        status: 'approved',
        notes: 'Unauthorized approval test',
      },
    };

    let statusCode = 0;
    let respData = null;
    const res = {
      setHeader: () => {},
      status: (c) => { statusCode = c; return res; },
      json: (d) => { respData = d; return res; },
      end: () => res,
    };

    await adminActionsHandler(req, res);
    assert.equal(statusCode, 401, 'Protected endpoint correctly rejects unauthenticated requests with 401');
    assert.equal(respData.success, false);
    assert.match(respData.error, /Authorization/i);
  });

  await t.test('VERIFICATION: Authenticated admin can successfully execute /api/admin-actions', async () => {
    const adminKey = process.env.ADMIN_KEY || (process.env.ADMIN_KEY || 'test-admin-key');
    const req = {
      method: 'POST',
      url: 'http://localhost/api/admin-actions',
      headers: { 
        host: 'localhost',
        authorization: `Bearer ${adminKey}`,
      },
      body: {
        actionType: 'id_card_status',
        targetId: 'OGR-782910',
        status: 'approved',
        notes: 'Authorized admin approval',
      },
    };

    let statusCode = 0;
    let respData = null;
    const res = {
      setHeader: () => {},
      status: (c) => { statusCode = c; return res; },
      json: (d) => { respData = d; return res; },
      end: () => res,
    };

    await adminActionsHandler(req, res);
    assert.equal(statusCode, 200, 'Authenticated admin action successfully executes');
    assert.equal(respData.success, true);
    assert.equal(respData.data.id, 'OGR-782910');
  });
});

test('QA Test 4: Financial Transactions & API Route Resilience Verification', async (t) => {
  const donationsHandler = (await import('../api/donations.js')).default;

  await t.test('VERIFICATION: Missing req.query is handled gracefully without unhandled crashes', async () => {
    const reqWithoutQuery = {
      method: 'POST',
      url: 'http://localhost/api/donations',
      headers: { host: 'localhost' },
      body: {
        amount: 25000,
        donorName: 'Test Contributor',
        donorEmail: 'test@ogere.ng',
      },
    };

    let statusCode = 0;
    let respData = null;
    const res = {
      setHeader: () => {},
      status: (c) => { statusCode = c; return res; },
      json: (d) => { respData = d; return res; },
      end: () => res,
    };

    await donationsHandler(reqWithoutQuery, res);
    assert.equal(statusCode, 201, 'Endpoint handles undefined req.query safely and processes donation');
    assert.equal(respData.success, true);
    assert.equal(respData.data.amount, 25000);
  });

  await t.test('Donation stats endpoint retrieves metrics correctly when req.query is supplied', async () => {
    const req = {
      method: 'GET',
      url: 'http://localhost/api/donations?stats=true',
      headers: { host: 'localhost' },
      query: { stats: 'true' },
    };

    let statusCode = 0;
    let respData = null;
    const res = {
      setHeader: () => {},
      status: (c) => { statusCode = c; return res; },
      json: (d) => { respData = d; return res; },
      end: () => res,
    };

    await donationsHandler(req, res);
    assert.equal(statusCode, 200);
    assert.equal(respData.success, true);
    assert.equal(respData.currency, 'NGN');
  });
});

test('QA Test 5: Second-Pass Security Hardening & Administrative Protection Audit', async (t) => {
  const royalAudiencesHandler = (await import('../api/royal-audiences.js')).default;
  const adminOfficersHandler = (await import('../api/admin-officers.js')).default;
  const securityHandler = (await import('../api/security.js')).default;

  await t.test('POST /api/royal-audiences (action: update_status) rejects unauthenticated caller with 401', async () => {
    const req = {
      method: 'POST',
      url: 'http://localhost/api/royal-audiences',
      headers: { host: 'localhost' },
      body: {
        action: 'update_status',
        id: 'ROYAL-AUD-101',
        status: 'confirmed',
      },
    };

    let statusCode = 0;
    let respData = null;
    const res = {
      setHeader: () => {},
      status: (c) => { statusCode = c; return res; },
      json: (d) => { respData = d; return res; },
      end: () => res,
    };

    await royalAudiencesHandler(req, res);
    assert.equal(statusCode, 401, 'Unauthenticated status update attempt rejected with 401');
    assert.equal(respData.success, false);
  });

  await t.test('GET /api/admin-officers rejects unauthenticated caller with 401', async () => {
    const req = {
      method: 'GET',
      url: 'http://localhost/api/admin-officers',
      headers: { host: 'localhost' },
    };

    let statusCode = 0;
    let respData = null;
    const res = {
      setHeader: () => {},
      status: (c) => { statusCode = c; return res; },
      json: (d) => { respData = d; return res; },
      end: () => res,
    };

    await adminOfficersHandler(req, res);
    assert.equal(statusCode, 401, 'Unauthenticated access to officer roster and command metrics rejected with 401');
    assert.equal(respData.success, false);
  });

  await t.test('PATCH /api/security rejects unauthenticated caller attempting to mutate incident records', async () => {
    const req = {
      method: 'PATCH',
      url: 'http://localhost/api/security',
      headers: { host: 'localhost' },
      body: {
        id: 'INC-2026-901',
        status: 'resolved',
      },
    };

    let statusCode = 0;
    let respData = null;
    const res = {
      setHeader: () => {},
      status: (c) => { statusCode = c; return res; },
      json: (d) => { respData = d; return res; },
      end: () => res,
    };

    await securityHandler(req, res);
    assert.equal(statusCode, 401, 'Unauthenticated PATCH attempt on incidents rejected with 401');
    assert.equal(respData.success, false);
  });

  await t.test('Authenticated admin can access GET /api/admin-officers', async () => {
    const req = {
      method: 'GET',
      url: 'http://localhost/api/admin-officers',
      headers: { 
        host: 'localhost',
        authorization: 'Bearer ' + (process.env.ADMIN_KEY || 'test-admin-key'),
      },
    };

    let statusCode = 0;
    let respData = null;
    const res = {
      setHeader: () => {},
      status: (c) => { statusCode = c; return res; },
      json: (d) => { respData = d; return res; },
      end: () => res,
    };

    await adminOfficersHandler(req, res);
    assert.equal(statusCode, 200, 'Authenticated admin allowed access to officer roster');
    assert.equal(respData.success, true);
    assert.ok(respData.stats, 'Response includes system stats');
  });
});

test('QA Test 6: Civic Expansion Subsystems (Disputes, Escrow, FixMyStreet) Verification', async (t) => {
  const communityHandler = (await import('../api/community.js')).default;

  await t.test('GET /api/community?type=customary-disputes retrieves dispute arbitration cases', async () => {
    const req = {
      method: 'GET',
      url: 'http://localhost/api/community?type=customary-disputes',
      headers: { host: 'localhost' },
      query: { type: 'customary-disputes' },
    };

    let statusCode = 0;
    let respData = null;
    const res = {
      setHeader: () => {},
      status: (c) => { statusCode = c; return res; },
      json: (d) => { respData = d; return res; },
      end: () => res,
    };

    await communityHandler(req, res);
    assert.equal(statusCode, 200);
    assert.equal(respData.success, true);
    assert.ok(Array.isArray(respData.disputes), 'Disputes returned as an array');
    assert.ok(respData.disputes.length > 0, 'Seed disputes present');
  });

  await t.test('POST /api/community?type=customary-disputes registers new customary arbitration dispute', async () => {
    const req = {
      method: 'POST',
      url: 'http://localhost/api/community?type=customary-disputes',
      headers: { host: 'localhost' },
      query: { type: 'customary-disputes' },
      body: {
        title: 'Farmland Boundary Incursion near Tollgate',
        category: 'land_boundary',
        complainantName: 'Chief Babatunde',
        complainantPhone: '08031234567',
        respondentName: 'Pa Adeleke',
        description: 'Boundary dispute between farm plots.',
      },
    };

    let statusCode = 0;
    let respData = null;
    const res = {
      setHeader: () => {},
      status: (c) => { statusCode = c; return res; },
      json: (d) => { respData = d; return res; },
      end: () => res,
    };

    await communityHandler(req, res);
    assert.equal(statusCode, 201);
    assert.equal(respData.success, true);
    assert.ok(respData.data.id.startsWith('DISP-'));
  });

  await t.test('GET /api/community?type=diaspora-escrow retrieves capital projects and milestone grant states', async () => {
    const req = {
      method: 'GET',
      url: 'http://localhost/api/community?type=diaspora-escrow',
      headers: { host: 'localhost' },
      query: { type: 'diaspora-escrow' },
    };

    let statusCode = 0;
    let respData = null;
    const res = {
      setHeader: () => {},
      status: (c) => { statusCode = c; return res; },
      json: (d) => { respData = d; return res; },
      end: () => res,
    };

    await communityHandler(req, res);
    assert.equal(statusCode, 200);
    assert.equal(respData.success, true);
    assert.ok(Array.isArray(respData.projects));
    assert.ok(respData.projects.length > 0);
  });

  await t.test('POST /api/community?type=fix-my-street registers public works issue', async () => {
    const req = {
      method: 'POST',
      url: 'http://localhost/api/community?type=fix-my-street',
      headers: { host: 'localhost' },
      query: { type: 'fix-my-street' },
      body: {
        title: 'Fallen Electric Pole on Hospital Road',
        category: 'power_transformer',
        quarter: 'Isale-Ogere',
        location: 'Hospital Road / Primary Health Centre',
        severity: 'CRITICAL',
        reporterName: 'Taiwo Olawale',
        description: 'Heavy rainfall knocked down low-voltage wooden pole.',
      },
    };

    let statusCode = 0;
    let respData = null;
    const res = {
      setHeader: () => {},
      status: (c) => { statusCode = c; return res; },
      json: (d) => { respData = d; return res; },
      end: () => res,
    };

    await communityHandler(req, res);
    assert.equal(statusCode, 201);
    assert.equal(respData.success, true);
    assert.ok(respData.data.id.startsWith('FMS-'));
  });
});





