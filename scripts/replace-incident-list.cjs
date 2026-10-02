const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '..', 'src', 'pages', 'SecurityDashboardPage.jsx');
let content = fs.readFileSync(targetFile, 'utf8');

const importStatement = `import IncidentListPanel from '../components/IncidentListPanel';\n`;
if (!content.includes('IncidentListPanel')) {
  content = content.replace("import SecurityMetricCards", importStatement + "import SecurityMetricCards");
}

const startString = `{/* Left: Live Alerts Feed */}`;
const startIndex = content.indexOf(startString);

const endString = `                );
              })
            )}
          </div>`;
const endIndex = content.indexOf(endString, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = `<IncidentListPanel
              loading={loading}
              displayedIncidents={displayedIncidents}
              activeIncident={activeIncident}
              setActiveIncident={setActiveIncident}
              setDispatchAgency={setDispatchAgency}
              setDispatchUnit={setDispatchUnit}
              setAgencyNotes={setAgencyNotes}
              THREAT_LEVELS={THREAT_LEVELS}
              SlaBadge={SlaBadge}
            />`;
  content = content.substring(0, startIndex) + replacement + content.substring(endIndex + endString.length);
  
  // also need to write the new component
  fs.writeFileSync(targetFile, content);
  console.log('Successfully replaced incident list in SecurityDashboardPage.jsx');
} else {
  console.log('Could not find start or end index.');
  console.log('startIndex:', startIndex);
  console.log('endIndex:', endIndex);
}
