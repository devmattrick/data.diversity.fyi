const chalk = require('chalk');
const fs = require('fs');
const glob = require('glob');
const Joi = require('@hapi/joi');
const { join, resolve } = require('path');

const infoSchema = Joi.object({
  name: Joi.string().required(),
  website: Joi.string().uri().required(),
  notes: Joi.array().items(Joi.string()),
  stats: Joi.array().items(Joi.object({
    year: Joi.number().required(),
    report: Joi.string().required().uri(),
    data: Joi.object({
      sex: Joi.object({
        female: Joi.number().required(),
        male: Joi.number().required(),
      }).required(),
      race: Joi.object({
        asian: Joi.number().required(),
        black: Joi.number().required(),
        latinx: Joi.number().required(),
        multiracial: Joi.number().required(),
        nativeAmerican: Joi.number().required(),
        white: Joi.number().required(),
      }).required(),
    }).required(),
  }).required()).required(),
}).required();

let hasErrored = false;

function lint(folder) {
  if (!fs.existsSync(join(folder, 'logo.png'))) {
    console.error(`[${chalk.red('ERROR')}] No logo.png provided in ${folder}.`);
    hasErrored = true;
  }

  const infoFilePath = join(folder, 'info.json');
  if (fs.existsSync(infoFilePath)) {
    infoSchema.validate(JSON.parse(fs.readFileSync(infoFilePath)), (err, value) => {
      if (err) {
        err.details.forEach((detail) => {
          console.error(`[${chalk.red('ERROR')}] ${detail.message} in ${resolve(__dirname, '..', folder, 'info.json')}.`);
        });
        hasErrored = true;
      }
    });
  } else {
    console.error(`[${chalk.red('ERROR')}] No info.json provided in ${folder}.`);
    hasErrored = true;
  }
}

glob('data/*', { cwd: resolve(__dirname, '..') }, (err, files) => {
  if (err) {
    console.error(err);
    return;
  }

  files.forEach(lint);

  if (hasErrored) {
    process.exit(1);
  }

  console.log(chalk.green('No issues found.'));
});
