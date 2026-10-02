const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '..', 'src', 'pages', 'SecurityDashboardPage.jsx');
let content = fs.readFileSync(targetFile, 'utf8');

const importStatement = `import SecurityMetricCards from '../components/SecurityMetricCards';\n`;
if (!content.includes('SecurityMetricCards')) {
  content = content.replace("import SecurityDashboardHeader from '../components/SecurityDashboardHeader';", importStatement + "import SecurityDashboardHeader from '../components/SecurityDashboardHeader';");
}

const startIndex = content.indexOf(`        {/* Metric Cards */}`);
const endString = `Live sync with Mobile App SOS</div>\n          </div>\n        </div>`;
const endIndex = content.indexOf(endString) + endString.length;

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = `        {/* Metric Cards */}
        <SecurityMetricCards
          codeRedCount={codeRedCount}
          activeDispatched={activeDispatched}
          totalOpen={totalOpen}
        />`;
  content = content.substring(0, startIndex) + replacement + content.substring(endIndex);
  fs.writeFileSync(targetFile, content);
  console.log('Successfully replaced metric cards in SecurityDashboardPage.jsx');
} else {
  console.log('Could not find start or end index for Metric Cards.');
}
