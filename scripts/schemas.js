var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');

var schemas = [{
  label: 'Syndication Feed',
  type: 'syndication',
}, {
  label: 'Bulk Upload',
  type: 'bulkUploadXml.bulkUploadXML',
}, {
  label: 'Bulk Upload Results',
  type: 'bulkUploadXml.bulkUploadResultXML',
}, {
  label: 'Cue Point Serve',
  type: 'cuePoint.serveAPI',
}, {
  label: 'Cue Point Ingest',
  type: 'cuePoint.ingestAPI',
}, {
  label: 'Drop Folder',
  type: 'dropFolderXmlBulkUpload.dropFolderXml',
}]

schemas.forEach(function(s) {
  s.downloadURL = 'http://www.kaltura.com/api_v3/index.php/service/schema/action/serve/type/' + s.type + '/name/' + s.type + '.xsd';
  s.htmlURL = 'http://www.kaltura.com/api_v3/xsdDoc/index.php?type=' + s.type;
})

var SCHEMA_MD = fs.readFileSync(__dirname + '/../markdown/templates/schema.md', 'utf8');
const OUTPUT_DIR = __dirname + '/../markdown/generated/';

function getContents(s) {
  return SCHEMA_MD.replace('{{ label }}', s.label).replace('{{ html }}', s.html);
}

if (require.main === module) {
  schemas.forEach(function(s) {
    request.get(s.downloadURL, function(err, resp, body) {
      if (err || resp.statusCode !== 200) throw new Error(err || resp.statusCode);
      s.xsd = body;
      request.get(s.htmlURL, function(err, resp, body) {
        if (err || resp.statusCode !== 200) throw new Error(err || resp.statusCode);
        var $ = cheerio.load(body);
        s.html = $('#doc').html();
        fs.writeFileSync(OUTPUT_DIR + s.type + '.md', getContents(s));
      })
    })
  })
}
