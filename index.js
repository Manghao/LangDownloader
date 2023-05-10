const fs = require('fs');

const { mkdir, stat, readFile } = fs.promises;
const path = require('path');
const { Readable } = require('stream');
const { finished } = require('stream/promises');

const config = require('./config');

async function createFolders(dirPath) {
  try {
    await stat(dirPath);
  } catch (err) {
    if (err?.code === 'ENOENT') {
      await mkdir(dirPath, { recursive: true });
      return Promise.resolve();
    }
    return Promise.reject(err);
  }

  return Promise.resolve();
}

async function download(url, dest) {
  const stream = fs.createWriteStream(dest);

  let body;
  try {
    const res = await fetch(url);
    body = await res.body;
  } catch (err) {
    console.error(err);
    return Promise.reject(new TypeError(`Cannot download file [${url}]`));
  }

  try {
    await finished(Readable.fromWeb(body).pipe(stream));
  } catch (err) {
    console.error(err);
    return Promise.reject(new TypeError(`Cannot save file [${dest}]`));
  }

  return Promise.resolve();
}

async function readFileContent(filePath) {
  let fileContent;
  try {
    fileContent = await readFile(path.resolve(filePath), { encoding: 'utf8' });
  } catch (err) {
    return Promise.reject(new TypeError(`Cannot read file [${filePath}]`));
  }

  if (fileContent.length <= 0) {
    return Promise.reject(new TypeError(`File [${filePath}] is empty`));
  }

  return fileContent;
}

function template(sentence, params) {
  let res = sentence;
  Object.entries(params).forEach((param) => {
    res = res.replaceAll(`{${param[0]}}`, param[1]);
  });

  return res;
}

async function getLangFiles() {
  for (let i = 0; i < Object.keys(config.cdn).length; i += 1) {
    const cdn = Object.keys(config.cdn).at(i);

    if (!cdn) {
      console.error(`CDN [${cdn}] not found`);
    }

    const outputDir = path.resolve(__dirname, config.dest);

    try {
      await createFolders(path.resolve(outputDir, cdn, 'lang', 'swf'));
    } catch (err) {
      console.error(err);
      continue;
    }

    for (let j = 0; j < config.lang.length; j += 1) {
      const lang = config.lang.at(j);

      const versionFileUri = template(config.versionFileUri, { cdn: config.cdn[cdn], lang });
      const versionFilePath = template(config.versionFileUri, { cdn: `${cdn}/`, lang });
      const versionOutputPath = path.resolve(`${outputDir}/${versionFilePath}`);

      console.log(`Downloading [${versionFileUri}] version file`);
      try {
        await download(versionFileUri, versionOutputPath);
      } catch (err) {
        console.error(err);
        continue;
      }

      let fileContent;
      try {
        fileContent = await readFileContent(versionOutputPath);
      } catch (err) {
        console.error(err);
        console.error(`Cannot read file [${versionOutputPath}]`);
        continue;
      }

      const reg = new RegExp(/([a-zA-Z]*,[a-z]*,[0-9]*)/g);
      const matchs = [];
      let match = null;

      // Get all occurances (<file>_<language>_<version>)
      while (match = reg.exec(fileContent)) {
        matchs.push(match);
      }

      for (let k = 0; k < matchs.length; k += 1) {
        const { groups } = /(?<file>[a-z]*),(?<language>[a-z]*),(?<version>[0-9]*)/g.exec(matchs.at(k).at(0));
        const { file, language, version } = groups;

        const swfFileUri = template(config.swfFileUri, {
          cdn: config.cdn[cdn], file, lang: language, version,
        });
        const swfFilePath = template(config.swfFileUri, {
          cdn: `${cdn}/`, file, lang: language, version,
        });
        const swfOutputPath = path.resolve(`${outputDir}/${swfFilePath}`);

        console.log(`Downloading [${swfFileUri}] swf file`);
        try {
          await download(swfFileUri, swfOutputPath);
        } catch (err) {
          console.error(err);
          console.error(`Cannot download file [${swfFileUri}]`);
          continue;
        }
      }
    }
  }
}

getLangFiles()
  .catch(console.error);
