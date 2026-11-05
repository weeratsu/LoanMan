/****************************************************************
 * Krungsri Dreamloan e-Statement saver (Apps Script)
 * Saves PDFs from "Krungsri Dreamloan of 127852XXXXXX3086" emails into Statements folder.
 * Attachments all share the same name -> renamed to the statement closing date (the 3rd):
 *   e-Statement-127852XXXXXX3086_YYYY-MM-03.PDF  (same pattern as existing files)
 *   closing date = 3rd of the email's month (if email day < 3 -> 3rd of previous month)
 * Dedup: skip if that filename already exists · label DreamStmt-Saved after saving
 * Uses getAs('application/pdf') (not copyBlob) · pages through all threads
 ****************************************************************/
var FOLDER_ID = '1AZopdMqnVaSMULiJBUalwuV8HzvKl--r';
var LABEL     = 'DreamStmt-Saved';
var BASE      = 'subject:"Krungsri Dreamloan of 127852XXXXXX3086" has:attachment filename:pdf';

function _closeDate(d){
  var tz = Session.getScriptTimeZone(), y = +Utilities.formatDate(d,tz,'yyyy'),
      m = +Utilities.formatDate(d,tz,'M'), day = +Utilities.formatDate(d,tz,'d');
  if(day < 3){ m--; if(m < 1){ m = 12; y--; } }
  return y + '-' + ('0'+m).slice(-2) + '-03';
}

/* normal run (hourly trigger): only unlabeled emails */
function saveDreamloanStatements(){ _run(BASE + ' -label:' + LABEL); }

/* one-time backfill: rescan ALL emails (incl. ones already labeled by the old version) */
function backfillDreamloanStatements(){ _run(BASE); }

function _run(q){
  var folder = DriveApp.getFolderById(FOLDER_ID);
  var label  = GmailApp.getUserLabelByName(LABEL) || GmailApp.createLabel(LABEL);
  var saved = 0, skipped = 0, start = 0, threads, names = [];
  while((threads = GmailApp.search(q, start, 50)).length){
    threads.forEach(function(th){
      var ok = true;
      th.getMessages().forEach(function(m){
        var pdfs = m.getAttachments({includeInlineImages:false}).filter(function(a){ return /\.pdf$/i.test(a.getName()); });
        pdfs.forEach(function(a, i){
          var name = 'e-Statement-127852XXXXXX3086_' + _closeDate(m.getDate()) + (i ? '_' + (i+1) : '') + '.PDF';
          if(folder.getFilesByName(name).hasNext()){ skipped++; return; }
          try{ folder.createFile(a.getAs('application/pdf')).setName(name); saved++; names.push(name); }
          catch(e){ ok = false; Logger.log('ERR ' + name + ': ' + e); }
        });
      });
      if(ok) th.addLabel(label);
    });
    start += threads.length;
  }
  Logger.log('saved ' + saved + ' · skipped (exists) ' + skipped + ' · scanned ' + start + '\n' + names.join('\n'));
}
