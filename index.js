const start = hrstart = process.hrtime()

const mkdirp = require('mkdirp')
const fs = require('fs')
const path = require('path')
const request = require('request')

// Lang languages
const languages = ['de', 'en', 'es', 'fr', 'it', 'nl', 'pt']

// URL AG
const agLang = 'http://staticns.ankama.com/dofus/gamedata/dofus/lang'

// Output
const out = path.resolve('out/lang')
const outSwf = path.resolve(`${out}/swf`)

// Creare outputs folder
try {
  mkdirp(outSwf, (err) => {
    if (err) console.error(err)

    // Download versions.swf
    request.get(`${agLang}/versions.swf`).pipe(fs.createWriteStream(`${out}/versions.swf`))

    // Download all langs by language
    languages.forEach(language => {

      // Download file with file version inside
      request.get(`${agLang}/versions_${language}.txt`, (req, res) => {
        const regex = new RegExp(/([a-zA-Z]*,[a-z]*,[0-9]*)/g)
        let matchs = []
        let match = null
      
        // Get all occurances (FILE_LANGAUAGE_VERSION)
        while (match = regex.exec(res.body)) {
          matchs.push(match)
        }
      
        // Browse all occurances
        matchs.forEach(m => {
          // Regex to get all params, (file, language, version)
          const data = /([a-zA-Z]*),([a-z]*),([0-9]*)/g.exec(m[0])
          
          // Download swf file
          request.get(`${agLang}/swf/${data[1]}_${data[2]}_${data[3]}.swf`).pipe(fs.createWriteStream(`${outSwf}/${data[1]}_${data[2]}_${data[3]}.swf`))
        })
      })
    })

    const hrend = process.hrtime(hrstart)

    console.log(`All langs downloaded in ${Math.ceil(hrend[1] / 1000000)} ms !`)
  })
} catch (error) {
  console.error(error)
}