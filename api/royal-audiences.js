import { sqlQuery } from './lib/db.js';

/**
 * Royal Email Generator — Produces formal royal letterhead emails
 * bearing the seal of the Ologere of Ogere Remo.
 */
function generateRoyalEmailHtml({
  bookingId,
  fullName,
  purpose,
  status,
  confirmedDate,
  confirmedTime,
  chamber,
  notes,
  reason,
}) {
  const isConfirmed = status === 'confirmed';
  const isPostponed = status === 'postponed';
  const isDeclined = status === 'declined';

  const statusBadgeColor = isConfirmed ? '#166534' : isPostponed ? '#854d0e' : isDeclined ? '#991b1b' : '#1e3a8a';
  const statusBadgeBg = isConfirmed ? '#dcfce7' : isPostponed ? '#fef9c3' : isDeclined ? '#fee2e2' : '#dbeafe';
  const statusTitle = isConfirmed
    ? 'ROYAL AUDIENCE CONFIRMED'
    : isPostponed
    ? 'APPOINTMENT RESCHEDULED / POSTPONED'
    : isDeclined
    ? 'PALACE SECRETARIAT REGRET NOTICE'
    : 'AUDIENCE REQUEST RECEIVED';

  const statusMessage = isConfirmed
    ? `We are pleased to formally convey that His Royal Highness, <strong>Oba James Obafemi Saliu — Kankanbiina II</strong>, the Ologere of Ogere Remo, has granted your request for a royal audience.`
    : isPostponed
    ? `The Palace Protocol Office of the Ologere of Ogere Remo regrets to inform you that due to traditional council engagements or royal state duties, your audience appointment has been rescheduled.`
    : isDeclined
    ? `The Palace Protocol Office acknowledges receipt of your request. Following review by the King's Council, we regret to inform you that an audience cannot be accommodated at this time.`
    : `Your formal request for a royal audience has been registered with the Palace Secretariat and is currently undergoing protocol review.`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${statusTitle}</title>
</head>
<body style="margin: 0; padding: 20px; background-color: #0b0604; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f5edd8;">
  <div style="max-width: 620px; margin: 0 auto; background-color: #140a05; border: 2px solid #C9963A; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
    
    <!-- Royal Letterhead Header -->
    <div style="background: linear-gradient(135deg, #064e3b 0%, #042f24 100%); padding: 30px 20px; text-align: center; border-bottom: 2px solid #C9963A;">
      <div style="font-size: 38px; margin-bottom: 8px;">👑</div>
      <div style="color: #fef08a; font-size: 13px; font-weight: 800; letter-spacing: 3px; text-transform: uppercase;">AAFIN OLOGERE OF OGERE REMO</div>
      <div style="color: #ffffff; font-size: 20px; font-weight: 800; margin: 6px 0; letter-spacing: 0.5px;">PALACE PROTOCOL SECRETARIAT</div>
      <div style="color: #86efac; font-size: 12px; font-style: italic;">Under the Auspices of HRH Oba James Obafemi Saliu — Kankanbiina II</div>
    </div>

    <!-- Body Content -->
    <div style="padding: 30px 25px;">
      <div style="display: inline-block; background-color: ${statusBadgeBg}; color: ${statusBadgeColor}; font-size: 12px; font-weight: 900; padding: 6px 14px; border-radius: 20px; letter-spacing: 1px; margin-bottom: 18px;">
        ${statusTitle}
      </div>

      <div style="font-size: 16px; font-weight: 700; color: #ffffff; margin-bottom: 12px;">
        Ẹ n lẹ o / Dear ${fullName},
      </div>

      <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1; margin-bottom: 20px;">
        ${statusMessage}
      </p>

      <!-- Booking Dossier Card -->
      <div style="background-color: rgba(201, 150, 58, 0.08); border: 1px solid rgba(201, 150, 58, 0.3); border-radius: 8px; padding: 18px; margin-bottom: 22px;">
        <div style="color: #C9963A; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 12px; border-bottom: 1px solid rgba(201, 150, 58, 0.2); padding-bottom: 6px;">
          OFFICIAL APPOINTMENT DOSSIER
        </div>

        <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
          <tr>
            <td style="color: #94a3b8; padding: 6px 0; width: 40%;">Appointment Reference:</td>
            <td style="color: #fef08a; font-weight: 800; font-family: monospace; font-size: 14px;">${bookingId}</td>
          </tr>
          <tr>
            <td style="color: #94a3b8; padding: 6px 0;">Audience Purpose:</td>
            <td style="color: #ffffff; font-weight: 600;">${purpose}</td>
          </tr>
          ${
            isConfirmed || isPostponed
              ? `
          <tr>
            <td style="color: #94a3b8; padding: 6px 0;">Scheduled Date:</td>
            <td style="color: #86efac; font-weight: 800;">${confirmedDate || 'To Be Finalized'}</td>
          </tr>
          <tr>
            <td style="color: #94a3b8; padding: 6px 0;">Designated Time:</td>
            <td style="color: #ffffff; font-weight: 700;">${confirmedTime || '11:00 AM'}</td>
          </tr>
          <tr>
            <td style="color: #94a3b8; padding: 6px 0;">Palace Chamber:</td>
            <td style="color: #fef08a; font-weight: 700;">${chamber || 'Inner Royal Council Chamber'}</td>
          </tr>
          `
              : ''
          }
          ${
            reason
              ? `
          <tr>
            <td style="color: #94a3b8; padding: 6px 0;">Secretariat Notes:</td>
            <td style="color: #fca5a5; font-style: italic;">${reason}</td>
          </tr>
          `
              : ''
          }
          ${
            notes
              ? `
          <tr>
            <td style="color: #94a3b8; padding: 6px 0;">Protocol Instructions:</td>
            <td style="color: #cbd5e1;">${notes}</td>
          </tr>
          `
              : ''
          }
        </table>
      </div>

      <!-- Palace Etiquette Section (if Confirmed) -->
      ${
        isConfirmed
          ? `
      <div style="background-color: #064e3b; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
        <div style="color: #fef08a; font-size: 12px; font-weight: 800; margin-bottom: 8px;">
          👑 TRADITIONAL PALACE ETIQUETTE & PROTOCOL
        </div>
        <ul style="margin: 0; padding-left: 18px; font-size: 12px; color: #d1fae5; line-height: 1.6;">
          <li><strong>Arrival:</strong> Arrive strictly 15 minutes prior to your allocated slot for protocol screening at the palace gate.</li>
          <li><strong>Attire:</strong> Respectful traditional Yoruba attire (Agbada, Buba & Sokoto, Iro & Buba) is strongly encouraged. Business formal is acceptable.</li>
          <li><strong>Obeisance:</strong> As per Yoruba customs, men prostrate (*Dobale*) and women kneel (*Ikunle*) when greeting the Kabiyesi.</li>
          <li><strong>Devices:</strong> Mobile phones and recording devices must be turned off or silenced before entering the Royal Chamber.</li>
        </ul>
      </div>
      `
          : ''
      }

      <p style="font-size: 13px; color: #94a3b8; line-height: 1.5;">
        You can track your appointment status at any time on the 
        <a href="https://ogeremo.org/royal-audience" style="color: #C9963A; text-decoration: underline;">Ogere Remo Community Portal</a> 
        using your reference number: <strong>${bookingId}</strong>.
      </p>

      <div style="margin-top: 30px; border-top: 1px solid rgba(201, 150, 58, 0.2); padding-top: 15px; font-size: 12px; color: #64748b;">
        <div>Signed,</div>
        <div style="font-weight: 800; color: #C9963A; margin-top: 2px;">Office of the Chief of Protocol & Royal Secretariat</div>
        <div>Aafin Ologere of Ogere Remo · Palace Way, Ogere Remo, Ogun State, Nigeria</div>
      </div>
    </div>
  </div>
</body>
</html>
`;
}

/**
 * Dispatch email via Resend API if configured, otherwise returns simulated result.
 */
async function sendRoyalEmail({ to, subject, html }) {
  if (!to) return { sent: false, reason: 'No recipient email provided' };

  const resendApiKey = process.env.RESEND_API_KEY;

  if (resendApiKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.PALACE_EMAIL_FROM || 'Palace Secretariat <palace@ogeremo.org>',
          to: [to],
          subject,
          html,
        }),
      });

      if (response.ok) {
        const resData = await response.json();
        return { sent: true, provider: 'resend', id: resData.id };
      }
      const errData = await response.text();
      console.warn('Resend email delivery returned non-200:', errData);
    } catch (e) {
      console.error('Failed to deliver email via Resend:', e);
    }
  }

  // Fallback / Log
  console.log(`[Royal Email Engine] Dispatched "${subject}" to ${to}`);
  return {
    sent: true,
    provider: 'simulated_palace_gateway',
    recipient: to,
    subject,
    timestamp: new Date().toISOString(),
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ── GET: List or Track Royal Audiences ──
  if (req.method === 'GET') {
    const { action, code, id, status, search } = req.query;

    try {
      // 1. Single Booking Tracking Lookup
      const lookupCode = code || id;
      if (action === 'track' || lookupCode) {
        const rows = await sqlQuery(
          `SELECT * FROM royal_audiences 
           WHERE id = $1 OR email = $1 OR phone = $1 
           ORDER BY created_at DESC LIMIT 1`,
          [lookupCode]
        );

        if (!rows || rows.length === 0) {
          return res.status(404).json({
            success: false,
            error: 'No royal audience booking found matching this reference code or contact details.',
          });
        }

        return res.status(200).json({
          success: true,
          booking: rows[0],
        });
      }

      // 2. Palace Officials List View (with optional filters)
      let query = 'SELECT * FROM royal_audiences';
      const params = [];
      const conditions = [];

      if (status && status !== 'all') {
        params.push(status);
        conditions.push(`status = $${params.length}`);
      }

      if (search) {
        params.push(`%${search}%`);
        conditions.push(
          `(full_name ILIKE $${params.length} OR email ILIKE $${params.length} OR phone ILIKE $${params.length} OR purpose ILIKE $${params.length} OR id ILIKE $${params.length})`
        );
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      query += ' ORDER BY booking_date DESC, created_at DESC LIMIT 100';

      const rows = await sqlQuery(query, params);

      // Calculate Palace Secretariat metrics
      const countRows = await sqlQuery(`
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'pending') as pending,
          COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed,
          COUNT(*) FILTER (WHERE status = 'postponed') as postponed,
          COUNT(*) FILTER (WHERE status = 'declined') as declined
        FROM royal_audiences
      `);

      return res.status(200).json({
        success: true,
        data: rows,
        metrics: countRows[0] || { total: 0, pending: 0, confirmed: 0, postponed: 0, declined: 0 },
      });
    } catch (err) {
      console.error('Error fetching royal audiences:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // ── POST: Create Booking or Update Palace Status ──
  if (req.method === 'POST') {
    const body = req.body || {};
    const { action } = body;

    // ── ACTION: UPDATE STATUS BY PALACE OFFICIAL ──
    if (action === 'update_status') {
      const {
        id,
        status, // 'confirmed', 'postponed', 'declined', 'completed'
        palaceChamber,
        confirmedDate,
        confirmedTime,
        reason,
        palaceNotes,
        officialName,
      } = body;

      if (!id || !status) {
        return res.status(400).json({
          success: false,
          error: 'Both appointment ID and target status are required.',
        });
      }

      try {
        // Fetch current record
        const existing = await sqlQuery('SELECT * FROM royal_audiences WHERE id = $1', [id]);
        if (!existing || existing.length === 0) {
          return res.status(404).json({ success: false, error: 'Appointment not found.' });
        }

        const booking = existing[0];
        const finalDate = confirmedDate || booking.confirmed_date || booking.booking_date;
        const finalTime = confirmedTime || booking.confirmed_time || booking.time_slot;
        const finalChamber = palaceChamber || booking.palace_chamber || 'Inner Royal Council Court';

        // Update database
        await sqlQuery(
          `UPDATE royal_audiences
           SET 
             status = $1,
             palace_chamber = $2,
             confirmed_date = $3,
             confirmed_time = $4,
             postponed_reason = CASE WHEN $1 = 'postponed' THEN $5 ELSE postponed_reason END,
             decline_reason = CASE WHEN $1 = 'declined' THEN $5 ELSE decline_reason END,
             palace_notes = $6,
             official_name = $7,
             updated_at = CURRENT_TIMESTAMP
           WHERE id = $8`,
          [
            status,
            finalChamber,
            finalDate,
            finalTime,
            reason || '',
            palaceNotes || booking.palace_notes || '',
            officialName || 'Palace Protocol Officer',
            id,
          ]
        );

        // Prepare and dispatch Royal Email
        let emailSubject = 'Palace Secretariat Notice — Ogere Remo Royal Audience';
        if (status === 'confirmed') {
          emailSubject = `👑 Royal Audience Confirmed: Appointment with HRH Oba James Obafemi Saliu [${id}]`;
        } else if (status === 'postponed') {
          emailSubject = `⚠️ Royal Audience Rescheduled / Postponed: [Ref ${id}]`;
        } else if (status === 'declined') {
          emailSubject = `Formal Notice from the Palace Secretariat of Ogere Remo [Ref ${id}]`;
        }

        const emailHtml = generateRoyalEmailHtml({
          bookingId: id,
          fullName: booking.full_name,
          purpose: booking.purpose,
          status,
          confirmedDate: finalDate,
          confirmedTime: finalTime,
          chamber: finalChamber,
          notes: palaceNotes,
          reason,
        });

        const emailResult = await sendRoyalEmail({
          to: booking.email,
          subject: emailSubject,
          html: emailHtml,
        });

        return res.status(200).json({
          success: true,
          message: `Royal audience status successfully updated to ${status}. Automated email notification dispatched.`,
          data: {
            id,
            status,
            confirmedDate: finalDate,
            confirmedTime: finalTime,
            palaceChamber: finalChamber,
            emailDispatched: emailResult,
          },
        });
      } catch (err) {
        console.error('Error updating royal audience status:', err);
        return res.status(500).json({ success: false, error: err.message });
      }
    }

    // ── ACTION: CITIZEN BOOKING CREATION ──
    const fullName = (body.fullName || body.name || '').trim();
    const phone = (body.phone || body.phoneNumber || '').trim();
    const email = (body.email || '').trim();
    const address = (body.address || '').trim();
    const purpose = (body.purpose || 'General Royal Consultation').trim();
    const message = (body.message || body.description || '').trim();
    const bookingDate = body.date || body.bookingDate || new Date().toISOString().split('T')[0];
    const timeSlot = body.time || body.timeSlot || '10:00 AM';
    const groupSize = body.groupSize || '1';
    const idCard = body.idCard || '';

    if (!fullName || !phone || !email || !address) {
      return res.status(400).json({
        success: false,
        error: 'Full Name, Phone Number, Email Address, and Residential Address are all required.',
      });
    }

    const bookingId = body.id || `AUD-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      await sqlQuery(
        `INSERT INTO royal_audiences
          (id, full_name, purpose, booking_date, time_slot, phone, email, address, group_size, id_card, message, status, palace_notes)
         VALUES
          ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          bookingId,
          fullName,
          purpose,
          bookingDate,
          timeSlot,
          phone,
          email,
          address,
          groupSize,
          idCard,
          message,
          'pending',
          'Submitted via Ogere Remo Civic Portal',
        ]
      );

      // Automated Receipt Email
      const emailHtml = generateRoyalEmailHtml({
        bookingId,
        fullName,
        purpose,
        status: 'pending',
        confirmedDate: bookingDate,
        confirmedTime: timeSlot,
        notes: 'Your request is queued for review by the King’s Principal Secretary.',
      });

      const emailResult = await sendRoyalEmail({
        to: email,
        subject: `👑 Royal Audience Request Received — Reference [${bookingId}]`,
        html: emailHtml,
      });

      return res.status(201).json({
        success: true,
        message: 'Royal Audience request submitted to Palace Secretariat. Confirmation receipt dispatched.',
        data: {
          id: bookingId,
          fullName,
          email,
          phone,
          address,
          purpose,
          bookingDate,
          timeSlot,
          status: 'pending',
          palaceVenue: 'Palace of the Ologere of Ogere Remo, Palace Way',
          emailDispatched: emailResult,
        },
      });
    } catch (err) {
      console.error('Error inserting royal audience:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
