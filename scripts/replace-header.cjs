const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '..', 'src', 'pages', 'SecurityDashboardPage.jsx');
let content = fs.readFileSync(targetFile, 'utf8');

const importStatement = `import SecurityDashboardHeader from '../components/SecurityDashboardHeader';\n`;
if (!content.includes('SecurityDashboardHeader')) {
  content = content.replace("import SEO from '../components/SEO';", importStatement + "import SEO from '../components/SEO';");
}

const startIndex = content.indexOf(`{/* Top Threat Banner */}`);
const endString = `+ Log Rapid Tactical Alert\n          </button>\n        </div>\n      </div>`;
const endIndex = content.indexOf(endString) + endString.length;

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = `<SecurityDashboardHeader
        codeRedCount={codeRedCount}
        audioEnabled={audioEnabled}
        stopAlarm={stopAlarm}
        setAudioEnabled={setAudioEnabled}
        triggerAudioAlarm={triggerAudioAlarm}
        setShowBroadcastModal={setShowBroadcastModal}
        setShowTipsModal={setShowTipsModal}
        setShowPatrolModal={setShowPatrolModal}
        setNewIncidentForm={setNewIncidentForm}
        tips={tips}
      />`;
  content = content.substring(0, startIndex) + replacement + content.substring(endIndex);
  fs.writeFileSync(targetFile, content);
  console.log('Successfully replaced header in SecurityDashboardPage.jsx');
} else {
  console.log('Could not find start or end index.');
}
