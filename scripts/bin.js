// require('./extractTests');
// const path = require('path');
// const fs = require('fs');
// const { spawn } = require('child_process');

// const subModuleDir = path.join(__dirname, '..', 'webpack-deep-scope-analysis-plugin');
// const nodeModules = path.join(subModuleDir, 'node_modules');

// const yarn = () => {
//   return spawn('yarn', {
//     cwd: path.join(__dirname, '..', 'webpack-deep-scope-analysis-plugin'),
//     stdio: 'inherit',
//   });
// }

// const yarnBuild = () => {
//   return spawn('yarn', ['build'], {
//     cwd: path.join(__dirname, '..', 'webpack-deep-scope-analysis-plugin'),
//     stdio: 'inherit',
//   });
// }

// if (!fs.existsSync(nodeModules)) {
//   const cp = yarn();
//   cp.on('exit', (code) => {
//     if (code === 0) {
//       yarnBuild();
//     }
//   })
// } else {
//   yarnBuild();
// }
