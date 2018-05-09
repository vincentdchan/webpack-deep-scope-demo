const fs = require('fs');
const path = require('path');

const fixturesPath = path.join(
  __dirname,
  '..',
  'webpack-deep-scope-analysis-plugin',
  'tests',
  'fixtures',
);

const readJSONContent = filename => {
  const content = fs.readFileSync(filename, 'utf8');
  return JSON.parse(content);
}

const fixtureDirs = fs.readdirSync(fixturesPath);
const fixturesData = fixtureDirs.map(fixtureName => {
  const fixtureDir = path.join(fixturesPath, fixtureName);
  const inputName = path.join(fixtureDir, 'input.js');
  const inputCodeContent = fs.readFileSync(inputName, 'utf8');
  const casesDirs = fs.readdirSync(path.join(fixtureDir, 'cases'));
  const caseData = casesDirs.map(caseName => {
    const casePath = path.join(fixtureDir, 'cases', caseName);
    const usedExportsPath = path.join(casePath, 'usedExports.json');
    const exportPath = path.join(casePath, 'expect.json');
    return {
      caseName,
      uesdExports: readJSONContent(usedExportsPath),
      exportPath: readJSONContent(exportPath),
    };
  });
  return {
    fixtureName,
    inputCodeContent,
    caseData,
  };
});

fs.writeFileSync('testData.json', JSON.stringify(fixturesData, null, 2), 'utf8');
