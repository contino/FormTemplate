/**
FormTemplate:  G-Suite Form to automating creation of templated assets.

The Form submit will include variables which are used to automate and templatize assets.

- Create new drive folder, copy drive template folder to new folder, apply templates.  (Link back to source doc and var.json)
- Create Confluence folder from templates (from G-Docs or from Confluence Templates
- Create Tasks for additional non-automated tasks to do
- Create GitHub repo from templates
- Create slack channel(s) #us-{{client}}-delivery, assign people
- Create group calendar
- Project GitHub Repository
- Send out email to interested parties


More vars to consider:
{
“Client_Full”: “Davita Healthcare”,
“DressCode”: “Casual”,
“DeliveryCategory:” “DevOps|BigData|CloudMigration|CloudNative”,
“DeliveryType:” “Assessment|Agile|DevOps|SRE|COE|Other|DataLake”, MULTI-VAL
“Size”: $1.5 M initial, $2.3M Total”,
“StartDate”: 10 December 2018
“EndDate”: 10 December 2018
“ParnerFunding”: “AWS”,
. . .
}

https://contino.atlassian.net/wiki/spaces/CONTINO/pages/1046773767/Confluence+Templates+-+Guide
https://contino.atlassian.net/wiki/spaces/CONTINO/pages/1046708349/Engagement+Kickoff+Catalog

Delivery has a client level and a engagement/project level
engagements can have multiple workstreams: Overview, outcomes, Contino resources, client resources 
Input from Kimble/SalesForce or update Kimble?
existing docs: Deal Sheet, Expense Policies, SOW, Client org chart, assessment
Templated Links, maybe form vars are supplemented with templated "derived": Jumbotron Link, Delivery Plan Link
Could be some "loose" existing docs as input: (Expense Policy, SOW)
Jinja2 or other TEMPLATE delimiters - should be consistent across asset type


*/

//var TEMPLATE_PREFIX = '{{';
//var TEMPLATE_SUFFIX = '}}';
var TEMPLATE_PREFIX = '${';
var TEMPLATE_SUFFIX = '}';
var TEMPLATE_IMAGE = 'IMAGE';
var VAR_JSON = "var.json";

//Local for testing
//var DEFAULT_PARENT_FOLDER_ID =  "1UMCaMTv3dYTU1PR0hIrm1o_wPb7cpGO9";
//var DEFAULT_TEMPLATE_FOLDER_ID = "10tkr-9ugxqMPNjIKek7oObxa6NNzjRLi";
//Shared Drive
var DEFAULT_PARENT_FOLDER_ID =  "147fs_NGIcDtl287iDuSpRvPETDPLcxLH";
var TDEFAULT_EMPLATE_FOLDER_ID = "1F0ZH3d9V37ZIV75D8ToEaF7-Euj8NX4S";

function onOpen(event) {
  FormApp.getUi().createAddonMenu()
      .addItem('Output Folder','showPicker')
      .addToUi();
  
//  var form = FormApp.getActiveForm();
//  for (item in form.getItems(ListItem)) {
//       Logger.log(item.getTitle());
    //TODO: People API to fill in choices
//    item.setChoices([
//         item.createChoice('Bill Hood'),
//         item.createChoice('Mike Connors')
//     ]);
//   }
}

/**
 * Displays an HTML-service dialog that contains client-side
 * JavaScript code for the Google Picker API.
 */
function showPicker() {
  var html = HtmlService.createHtmlOutputFromFile('picker.html')
      .setWidth(600)
      .setHeight(425)
      .setSandboxMode(HtmlService.SandboxMode.IFRAME);
  FormApp.getUi().showModalDialog(html, 'Select Folder');
}

function getOAuthToken() {
  DriveApp.getRootFolder();
  return ScriptApp.getOAuthToken();
}

function setPickerFolder(folderId) {
  Logger.log("setPickerFolder" + folderId);
  var properties = PropertiesService.getScriptProperties();
  properties.setProperty('PARENT_FOLDER_ID',folderId);
}

// This function will be called when the form is submitted
function onSubmit(event) { 
  // The event is a FormResponse object:
  // https://developers.google.com/apps-script/reference/forms/form-response
  var formResponse = event.response;
  // Gets all ItemResponses contained in the form response
  // https://developers.google.com/apps-script/reference/forms/form-response#getItemResponses()  
  var itemResponses = formResponse.getItemResponses();
  // Gets the actual response strings from the array of ItemResponses, just the values as a string[]
  //var responses = itemResponses.map(function getResponse(e) { return e.getItem().getTitle().replace(/\s+/g, '')+e.getResponse(); });
  var responses = new Object();
  itemResponses.forEach(function(e) { responses[e.getItem().getTitle().replace(/\s+/g, '')] = e.getResponse();  });  
  process(responses);
}

//used for debug
function test() {
  var responses = {"Client": "ACME", 
                   "IMAGElogoUrl": "https://github.com/contino/SlideTemplate/raw/master/icon96_96.png",
                   "ProjectName": "projectx", 
                   "Stakeholder": "Jim Bob",
                   "Outcome1": "someoutcome 1",
                   "Outcome2": "someoutcome 2",
                   "Outcome3": "someoutcome 3",
                   "TimeZone": "EST",
                   "AP": "Mike Connors",
                   "TP": "Sam Treslor",
                   "CP": "Dan Grace",
                   "LC1": "Bill Hood",
                   "LC2": "Sandeep Nakka",
                   "Location": "Nashville",
                   "ConferenceType": "Google",
                   "ConferenceID": "https://chat.davita.com"    
                  }
  process(responses);
}

// if client folder does not already exist under the parent then create it and copy all the files under templateFolder to new clientFolder
// save the response JSON
// apply templating to all files in the clientFolder
// other templated resources and automation
function process(responses) {
  var properties = PropertiesService.getScriptProperties();
  if (properties.getProperty('PARENT_FOLDER_ID') == null) {
    properties.setProperty('PARENT_FOLDER_ID',DEFAULT_PARENT_FOLDER_ID);
  }
  if (properties.getProperty('TEMPLATE_FOLDER_ID') == null) {
    properties.setProperty('TEMPLATE_FOLDER_ID',DEFAULT_TEMPLATE_FOLDER_ID);
  }
  var parentFolder = DriveApp.getFolderById(properties.getProperty('PARENT_FOLDER_ID'));
  var templateFolder = DriveApp.getFolderById(properties.getProperty('TEMPLATE_FOLDER_ID'));
  Logger.log("parentFolder " + parentFolder.getName());
  Logger.log("templateFolder " + templateFolder.getName());

  var client = responses['Client'];    
  Logger.log("Client " + client);

  var topFolder;
  var topFolders = parentFolder.getFoldersByName(client);
  if (topFolders.hasNext()) {
    topFolder = topFolders.next();
  } else {
    topFolder = parentFolder.createFolder(client);
    copyDrive(templateFolder, topFolder);  
  }

  //save the responses to var.json  (versioned file woudl be better)
  var varFile;
  var varFiles = topFolder.getFilesByName(VAR_JSON);
  if (varFiles.hasNext()) {
    Logger.log("removing existing " + VAR_JSON);
    varFile = varFiles.next();
    //versioned file woudl be better
    //file = Drive.Files.insert(varFile, JSON.stringify({"responses": responses }));
    DriveApp.removeFile(varFile);
  }
  Logger.log("creating " + VAR_JSON);
  varFile = DriveApp.createFile(VAR_JSON, JSON.stringify({"responses": responses }),"text/json");
  topFolder.addFile(varFile);
  
  //TODO: apply templates to Doc and Slides
  applyTemplate(topFolder,responses);

  //TODO: apply templates to Confluence template
  
  //TODO: apply templates to GitHub projects
  
  //submit to cloudfunction - this could be good for other automations
  //var url = "https://us-central1-slidetemplate.cloudfunctions.net/form-trigger";
  //submitCloudFunction(url,event);

  //TODO: save logo from url to logo file here  
  //TODO: create slack channel, add users
  //TODO: create delivery calendar, add users
  //TODO: create Tasks
  //TODO: send email to users
}

//https://developers.google.com/apps-script/advanced/drive
function fileUpload(title,url) {
  var image = UrlFetchApp.fetch(url.getBlob());
  var file = {
    title: title,
    mimeType: 'image/png'
  };
  file = Drive.Files.insert(file, image);
  Logger.log('ID: %s, File size (bytes): %s', file.id, file.fileSize);
  return file;
}

// recursively copy google drive folder
function copyDrive(sourceFolder, destFolder) {
  var files = sourceFolder.getFiles();
  while (files.hasNext()) {
    var file = files.next();
    file.makeCopy(file.getName(),destFolder);
    //Logger.log("copyDrive file="+file.getName());
  }
  var folders = sourceFolder.getFolders();
  while (folders.hasNext()) {
    var folder = folders.next();
    var destSubFolder = destFolder.createFolder(folder.getName());
    copyDrive(folder,destSubFolder);
  }
}
    
// recursively apply templates to all files in google drive folder
function applyTemplate(folder,varList) {
  var files = folder.getFiles();
  while (files.hasNext()) {
    var file = files.next();
    Logger.log("applyTemplate file="+file.getName() + file.getMimeType());
    if ('application/vnd.google-apps.presentation' === file.getMimeType()) {
      var presentation = SlidesApp.openByUrl(file.getUrl());
      applySlideTemplate(presentation, varList);
    }
    if ('application/vnd.google-apps.document' === file.getMimeType()) {
      var doc = DocumentApp.openByUrl(file.getUrl());
      applyDocTemplate(doc, varList);
    }
  }
  var subFolders = folder.getFolders();
  while (subFolders.hasNext()) {
    var subFolder = subFolders.next();
    applyTemplate(subFolder,varList);
  }
}

function applyDocTemplate(doc,varList) {
  //templateSmart(doc,varList);
  for (key in varList) {
    if (varList[key] !== null) {
      var searchPattern = (TEMPLATE_PREFIX + "\\s*" + key + "\\s*" + TEMPLATE_SUFFIX).replace("$", "\\$");
      if (!key.startsWith(TEMPLATE_IMAGE)) {
        doc.getBody().replaceText(searchPattern, varList[key]);
        if (doc.getHeader() != null) {
          doc.getHeader().rereplaceText(searchPattern, varList[key]);
        }
        if (doc.getHeader() != null) {
          doc.getFooter().replaceText(searchPattern, varList[key]);
        }
      } else {
        Logger.log(varList[key]);
        var image = UrlFetchApp.fetch(varList[key]).getBlob();
        do {
          var next = replaceTextToImage(doc.getBody(), searchPattern, image);
          //force width, maintain aspect ratio
          //var next = replaceTextToImage(doc.getBody(), searchPattern, image, 200);
        } while (next);
        if (doc.getHeader() != null) {
          do {
            var next = replaceTextToImage(doc.getHeader(), searchPattern, image);
          } while (next);
        }
        if (doc.getFooter() != null) {
          do {
            var next = replaceTextToImage(doc.getFooter(), searchPattern, image);
          } while (next);
        }
      }
    }
  }
}

function replaceTextToImage(body, searchText, image, width) {
  var next = body.findText(searchText);
  if (!next) return;
  var r = next.getElement();
  r.asText().setText("");
  var img = r.getParent().asParagraph().insertInlineImage(0, image);
  if (width && typeof width == "number") {
    var w = img.getWidth();
    var h = img.getHeight();
    img.setWidth(width);
    img.setHeight(width * h / w);
  }
  return next;
} 

function applySlideTemplate(presentation,varList) {
  templateSmart(presentation,varList);
  for (key in varList) {
    if (!key.startsWith(TEMPLATE_IMAGE)) {
      //TODO: whitespace between TEMPLATE_PREFIX and key and TEMPLATE_SUFFIX matters!
      if (varList[key] !== null) presentation.replaceAllText(TEMPLATE_PREFIX + key + TEMPLATE_SUFFIX, varList[key], true);
    }
  }
}

/**
 * Apply all "smart" templates like IMAGE to each slide
 * @param {string} varList The varList
 */

function templateSmart(presentation,varList) {
  var masters = presentation.getMasters();
  for (var i = 0; i < masters.length; i++) {
    var replacedElements=[];
    var elements = masters[i].getPageElements().forEach(function(element) {   
     if (element.getPageElementType() ===  SlidesApp.PageElementType.SHAPE) {
       element = element.asShape()
       //Logger.log("replace IMAGE master " +element);
       text = element.getText();
       for (key in varList) {
         if ((varList[key] != null) && (varList[key].length > 0) && (text.asRenderedString().startsWith(TEMPLATE_PREFIX + TEMPLATE_IMAGE)) && (text.asRenderedString().startsWith(TEMPLATE_PREFIX+key))) {
           //Logger.log("replace IMAGE master " + i + " " + key  + '=' + varList[key]);
           var image = masters[i].insertImage(varList[key]);
           resizeImage(image,element);
           replacedElements.push(element);
         }
       }
     }
    });
    //Logger.log(replacedElements);
    replacedElements.forEach(function(element) {
      element.remove();
    });
  }

  var layouts = presentation.getLayouts();
  for (var i = 0; i < layouts.length; i++) {
    var replacedElements=[];
    var elements = layouts[i].getPageElements().forEach(function(element) {   
     if (element.getPageElementType() ===  SlidesApp.PageElementType.SHAPE) {
       element = element.asShape();
       text = element.getText();
       for (key in varList) {
         if ((varList[key] !== null) && (varList[key].length > 0) && (text.asRenderedString().startsWith(TEMPLATE_PREFIX + TEMPLATE_IMAGE)) && (text.asRenderedString().startsWith(TEMPLATE_PREFIX+key))) {
           //Logger.log("replace IMAGE layout " + i + " " + key  + '=' + varList[key]);
           var image = layouts[i].insertImage( varList[key]);
           resizeImage(image,element);
           replacedElements.push(element);
         }
       }
     }
    });
    //Logger.log(replacedElements);
    replacedElements.forEach(function(element) {
      element.remove();
    });
  }
  
  var slides = presentation.getSlides();
  for (var i = 0; i < slides.length; i++) {
    var replacedElements=[];
    var elements = slides[i].getPageElements().forEach(function(element) {   
     if (element.getPageElementType() ===  SlidesApp.PageElementType.SHAPE) {
       element = element.asShape()
       text = element.getText();
       for (key in varList) {
         if ((varList[key] !== null) && (varList[key].length > 0) && (text.asRenderedString().startsWith(TEMPLATE_PREFIX + TEMPLATE_IMAGE)) && (text.asRenderedString().startsWith(TEMPLATE_PREFIX+key))) {
           //Logger.log("replace IMAGE slide " + i + " " + key  + '=' + varList[key]);
           var image = slides[i].insertImage( varList[key]);
           resizeImage(image,element);
           replacedElements.push(element);
         }
       }
     }
    });
    //Logger.log(replacedElements);
    replacedElements.forEach(function(element) {
      element.remove();
    });
  }
  return;
}

/**
 * Resizes an image to the same size as the element it is replacing
 * @param {Image} image An Image object to resize
 * @param {element} the element (Shape) to size to
 */
function resizeImage(image, element) {
    image.setWidth(element.getWidth());
    image.setHeight(element.getHeight());
    image.setLeft(element.getLeft());
    image.setTop(element.getTop());
}


//create a new google Calendar
function setupCalendar(client) {
  var calendar = CalendarApp.createCalendar(client, {
  summary: 'Group delivery calendar for' +client+'.',
  color: CalendarApp.Color.BLUE, 
  timezone: 'EST'});
}

// create a slack channel, add people
function setupSlack(client) {
  //#us-{{client}}-delivery
  //https://slack.com/api/channels.create?name=blah2-test-delivery&pr 
  //token
}

// submit the form responses to a cloudfunction
function submitCloudFunction(responses,url) {
  // Post the payload as JSON to our Cloud Function  
  UrlFetchApp.fetch(
    url,
    {
      "method": "POST",
      "payload": JSON.stringify({
        "responses": response
      })
    }
  );

}