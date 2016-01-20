/* ***** BEGIN LICENSE BLOCK *****
 *   Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 * 
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Porn Detection.
 *
 * The Initial Developer of the Original Code is
 * Rizqi Putri Nourma Budiarti.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 * 
 * ***** END LICENSE BLOCK ***** */

var origImgs = [];  // record the original filenames before rotation
//var inverted = 0;   // current rotation mode
var extDir = "/tmp/";  // change to your directory
var imgDir = "/tmp/";
var maxImg = 0; //var for jumlah image
var extName = "porndetection@nuarlyss.wordpress.com";

var prefs = Components.classes["@mozilla.org/preferences-service;1"]
		.getService(Components.interfaces.nsIPrefBranch);

function exportImages()
{   
    maxImg = 0; 

    var file = Components.classes["@mozilla.org/file/directory_service;1"]
                     .getService(Components.interfaces.nsIProperties)
                     .get("ProfD", Components.interfaces.nsIFile);
    file.append("porndetect");
    if( !file.exists() || !file.isDirectory() ) {   // if it doesn't exist, create
       file.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0777);
    }

    var download;
    if (prefs.getPrefType("browser.download.dir") == prefs.PREF_STRING){
       download = prefs.getCharPref("browser.download.dir");
    }

    prefs.setCharPref("browser.download.dir",file.path);
    imgDir = file.path;

    var sitenya = content.document.location.protocol +"//"+content.document.location.host;
    
    prefs.setCharPref("capability.policy.localfilelinks.checkloaduri.enabled","allAccess");
    prefs.setCharPref("capability.policy.localfilelinks.sites", sitenya);
    prefs.setCharPref("capability.policy.policynames", "localfilelinks");


    var allImgs = content.document.getElementsByTagName("IMG");

    for (var n = 0; n < allImgs.length; n++){
      
      saveURL( allImgs[n].src, null, null, false, true, null );
      origImgs[n] = allImgs[n].src;
      maxImg++;
          
    }//for all image tags
    
    // if enough images to process
    if( maxImg > 2 )
    { 
      var waitTim = maxImg * 50
      setTimeout('runPornDetect()', waitTim );
    }//if enough images to process
    
    prefs.setCharPref("browser.download.dir",download);
}//exportImages

function runPornDetect()
{
     var profilku = Components.classes["@mozilla.org/file/directory_service;1"]
                     .getService(Components.interfaces.nsIProperties)
                     .get("ProfD", Components.interfaces.nsIFile);

     extDir = profilku.path + "/extensions/" + extName ;

     var fileExe = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
     fileExe.initWithPath(extDir + "/defaults/bin/cek.sh");
  
     var process = Components.classes["@mozilla.org/process/util;1"].createInstance(Components.interfaces.nsIProcess);
     process.init(fileExe);
  
     var args = [];
     args[0] = extDir;
     args[1] = imgDir;

     process.run(true, args, args.length);

     var fileIn = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
     fileIn.initWithPath("/tmp/pornchecked");

     var istream = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream);
     istream.init(fileIn, 0x01, 0444, 0);
     istream.QueryInterface(Components.interfaces.nsILineInputStream);

     var data = "";
     var fstream = Components.classes["@mozilla.org/network/file-input-stream;1"]
                        .createInstance(Components.interfaces.nsIFileInputStream);
     var sstream = Components.classes["@mozilla.org/scriptableinputstream;1"]
                        .createInstance(Components.interfaces.nsIScriptableInputStream);
     fstream.init(fileIn, -1, 0, 0);
     sstream.init(fstream); 

     var str = sstream.read(4096);
     while (str.length > 0) {
       data += str;
       str = sstream.read(4096);
     }

    sstream.close();
    fstream.close();
    
      if (data != 0 ) {
         alert("This site contain "+data+" porn content");
      }

    var posisi;

     var allImgs = content.document.getElementsByTagName("IMG");
     for (var n = 0; n < allImgs.length; n++){
        posisi = allImgs[n].src.lastIndexOf("/");
        allImgs[n].src = "file://" + imgDir + "/checked/" + allImgs[n].src.substr(posisi);

     }//for all image tags

}//runPornDetect

function statusreport(){
  alert("document has loaded")
}


var porndetection = {
  onLoad: function() {
    // initialization code
    this.initialized = true;
    this.strings = document.getElementById("porndetection-strings");
    document.getElementById("contentAreaContextMenu")
            .addEventListener("popupshowing", function(e) { this.showContextMenu(e); }, false);
  },

  showContextMenu: function(event) {
    // show or hide the menuitem based on what the context menu is on
    // see http://kb.mozillazine.org/Adding_items_to_menus
    document.getElementById("context-porndetection").hidden = gContextMenu.onImage;
  },
  onMenuItemCommand: function(e) {
    var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                                  .getService(Components.interfaces.nsIPromptService);
    promptService.alert(window, this.strings.getString("helloMessageTitle"),
                                this.strings.getString("helloMessage"));
  },
  onToolbarButtonCommand: function(e) {
    // just reuse the function above.  you can change this, obviously!
    porndetection.onMenuItemCommand(e);
  }

};
window.addEventListener("load", function(e) { porndetection.onLoad(e); }, false);


var prefAutoload = prefs.getBoolPref("extensions.porndetection.boolpref");

if(prefAutoload) {
  if (document.addEventListener)
    document.addEventListener("DOMContentLoaded", exportImages, false) //invoke function
}

