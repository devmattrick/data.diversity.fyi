const chalk = require('chalk');
const fs = require('fs');
const glob = require('glob');
const mkdirp = require('mkdirp');
const ncp = require('ncp');
const { resolve } = require('path');
const rimraf = require('rimraf');

let atlas = [];

function build(folder) {
  ncp(resolve(__dirname, '../data', folder), resolve(__dirname, '../dist', folder), (err) => {
    if (err) {
       console.error(err);
    }
  });

  const infoFilePath = resolve(__dirname, '../data', folder, 'info.json');
  const company = JSON.parse(fs.readFileSync(infoFilePath));
  const stats = company.stats.reduce((prev, curr) => prev.year > curr.year ? prev : curr);
  atlas.push({
    name: company.name,
    website: company.website,
    info: `${folder}/info.json`,
    logo: `${folder}/logo.png`,
    stats,
  });
}

glob('*', { cwd: resolve(__dirname, '../data') }, (err, files) => {
  if (err) {
    console.error(err);
    return;
  }

  rimraf.sync(resolve(__dirname, '../dist'));
  mkdirp(resolve(__dirname, '../dist'));
  files.forEach(build);

  fs.writeFileSync(resolve(__dirname, '../dist/atlas.json'), JSON.stringify(atlas));

  console.log(chalk.green('Built successfully!'));
});
