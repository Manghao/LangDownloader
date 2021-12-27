const fs = require('fs');
const { mkdir, stat, readFile } = fs.promises;
const path = require('path');
const http = require('http');

const outSwf = path.resolve(process.cwd(), 'out', 'lang', 'swf');

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

function download(url, dest) {
  http.get(`${url}`, (response) => {
    const file = fs.createWriteStream(dest);
    response.pipe(file);
  }).on('error', (err) => {
    fs.unlink(dest);
    return Promise.reject(err);
  });
}

async function downloadFiles(outDir) {
  const languages = ['de', 'en', 'es', 'fr', 'it', 'nl', 'pt'];

  const agLang = 'http://dofusretro.cdn.ankama.com/lang';

  const parentDir = path.dirname(outDir);

  console.log(`Downloading [${agLang}/versions.swf] file`);
  try {
    await download(`${agLang}/versions.swf`, `${parentDir}/versions.swf`);
  } catch (err) {
    console.error(err);
    console.error(`Cannot download file [${agLang}/versions.swf]`);
  }

  for (let i = 0; i < languages.length; i += 1) {
    const language = languages[i];

    console.log(`Downloading [${agLang}/versions_${language}.txt] file`);
    try {
      await download(`${agLang}/versions_${language}.txt`, `${parentDir}/versions_${language}.txt`);
    } catch (err) {
      console.error(err);
      console.error(`Cannot download file [${agLang}/versions_${language}.txt]`);
    }

    let fileContent;
    try {
      fileContent = await readFile(`${parentDir}/versions_${language}.txt`, { encoding: 'utf8' });
    } catch (err) {
      console.error(err);
      console.error(`Cannot read file [${parentDir}/versions_${language}.txt]`);
    }

    if (fileContent.length <= 0) {
      console.error(`File [${parentDir}/versions_${language}.txt] is empty`);
      continue;
    }

    const reg = new RegExp(/([a-zA-Z]*,[a-z]*,[0-9]*)/g);
    const matchs = [];
    let match = null;

    // Get all occurances (FILE_LANGAUAGE_VERSION)
    while (match = reg.exec(fileContent)) {
      matchs.push(match);
    }

    for (let j = 0; j < matchs.length; j += 1) {
      const [m] = matchs[j];
      const data = /([a-zA-Z]*),([a-z]*),([0-9]*)/g.exec(m);

      console.log(`Downloading [${agLang}/swf/${data[1]}_${data[2]}_${data[3]}.swf] file`);
      try {
        await download(`${agLang}/swf/${data[1]}_${data[2]}_${data[3]}.swf`, `${outDir}/${data[1]}_${data[2]}_${data[3]}.swf`);
      } catch (err) {
        console.error(err);
        console.error(`Cannot download file [${agLang}/swf/${data[1]}_${data[2]}_${data[3]}.swf]`);
      }
    }
  }
}

createFolders(outSwf)
  .then(downloadFiles(outSwf))
  .catch(console.error);
