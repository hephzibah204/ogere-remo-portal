const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '..', 'src', 'pages', 'SecurityDashboardPage.jsx');
let content = fs.readFileSync(targetFile, 'utf8');

const importStatement = `import ActiveDispatchTerminal from '../components/ActiveDispatchTerminal';\n`;
if (!content.includes('ActiveDispatchTerminal')) {
  content = content.replace("import IncidentListPanel", importStatement + "import IncidentListPanel");
}

const startString = `{/* Right: Tactical Dispatch Control Panel */}`;
const startIndex = content.indexOf(startString);

const endString = `              </div>
            </div>
          )}`;
const endIndex = content.indexOf(endString, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
  const extractedCode = content.substring(startIndex, endIndex + endString.length);
  const componentCode = `import React from 'react';

export default function ActiveDispatchTerminal({
  activeIncident,
  setActiveIncident,
  dispatchAgency,
  setDispatchAgency,
  dispatchUnit,
  setDispatchUnit,
  agencyNotes,
  setAgencyNotes,
  AGENCIES,
  isUpdating,
  handleUpdateStatus,
  handleScanCctv,
  CCTV_CAMERAS,
  claimedIncidents,
  adminSelectedStation,
  setAdminSelectedStation,
  adminRouteToStation,
  SlaBadge
}) {
  return (
    <>
      ${extractedCode.replace(/\n/g, '\n      ')}
    </>
  );
}
`;
  fs.writeFileSync(path.join(__dirname, '..', 'src', 'components', 'ActiveDispatchTerminal.jsx'), componentCode);
  
  const replacement = `<ActiveDispatchTerminal
            activeIncident={activeIncident}
            setActiveIncident={setActiveIncident}
            dispatchAgency={dispatchAgency}
            setDispatchAgency={setDispatchAgency}
            dispatchUnit={dispatchUnit}
            setDispatchUnit={setDispatchUnit}
            agencyNotes={agencyNotes}
            setAgencyNotes={setAgencyNotes}
            AGENCIES={AGENCIES}
            isUpdating={isUpdating}
            handleUpdateStatus={handleUpdateStatus}
            handleScanCctv={handleScanCctv}
            CCTV_CAMERAS={CCTV_CAMERAS}
            claimedIncidents={claimedIncidents}
            adminSelectedStation={adminSelectedStation}
            setAdminSelectedStation={setAdminSelectedStation}
            adminRouteToStation={adminRouteToStation}
            SlaBadge={SlaBadge}
          />`;
  content = content.substring(0, startIndex) + replacement + content.substring(endIndex + endString.length);
  
  fs.writeFileSync(targetFile, content);
  console.log('Successfully extracted ActiveDispatchTerminal to a new component!');
} else {
  console.log('Could not find start or end index.');
  console.log('startIndex:', startIndex);
  console.log('endIndex:', endIndex);
}
