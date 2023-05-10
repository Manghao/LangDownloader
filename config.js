module.exports = {
  cdn: {
    retro: 'http://dofusretro.cdn.ankama.com/',
    temporis: 'http://dofusretro.cdn.ankama.com/temporis/',
    temporis2: 'http://dofusretro.cdn.ankama.com/ephemeris2releasebucket/',
  },
  lang: ['de', 'en', 'es', 'fr', 'it', 'nl', 'pt'],
  versionFileUri: '{cdn}lang/versions_{lang}.txt',
  swfFileUri: '{cdn}lang/swf/{file}_{lang}_{version}.swf',
  dest: 'output',
};
