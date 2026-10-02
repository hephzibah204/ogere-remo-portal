const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '..', 'src', 'pages', 'SecurityDashboardPage.jsx');
let content = fs.readFileSync(targetFile, 'utf8');

const startString = `{/* Left: Live Alerts Feed */}`;
const startIndex = content.indexOf(startString);

const endString = `                );
              })
            )}
          </div>`;
const endIndex = content.indexOf(endString, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
  const extractedCode = content.substring(startIndex, endIndex + endString.length);
  const componentCode = `import React from 'react';

export default function IncidentListPanel({
  loading,
  displayedIncidents,
  activeIncident,
  setActiveIncident,
  setDispatchAgency,
  setDispatchUnit,
  setAgencyNotes,
  THREAT_LEVELS,
  SlaBadge
}) {
  return (
    ${extractedCode.replace(/\n/g, '\n    ')}
  );
}
`;
  fs.writeFileSync(path.join(__dirname, '..', 'src', 'components', 'IncidentListPanel.jsx'), componentCode);
  console.log('Successfully created IncidentListPanel.jsx');
}
