# FormTemplate
Google Form Add-on to automate the deployment of templatized resources.

![FormTemplate](FormTemplate.png)

## Try it out
* Open/create a Google Form.
* Install the FormTemplate from the Add-ons MarketPlace https://gsuite.google.com/marketplace/mydomainapps (must be logged in to contino G-suite domain)
* Accept authorizations to complete installation.
* Try existing test form https://docs.google.com/forms/d/1htminAZqalsdj4EIP8kpvE_wgutUGoUMTyTIXiisb_E/edit (or Create your own new Form)
* The "top" output directory will default to the standard "Delivery" location, but can be change using the FormTemplate addon "Output Folder" menu item
* Fill in the form with desired value for each ${} Variable. 
* Submit the form to create a new folder and copy the templated resources and apply the templating.
* All asset in the "source" template directory will be copied to a new "client" folder under the "top" output directory, and templating will be applied to each. Form responses are saved in the client folder to vars.json file.
* Be patient, it can take a while to copy the assets over to the new "client" folder.

v* [FormTemplate Test](https://docs.google.com/forms/d/1htminAZqalsdj4EIP8kpvE_wgutUGoUMTyTIXiisb_E/edit)
* [TestTemplate](https://docs.google.com/presentation/d/1fqtCE8iTxzaf1ZgcICB_qb4cjEaFoOuXnj9xG6PlMH8/edit#slide=id.g5e5b0c9b58_0_1)
* [Standard Project Kickoff](https://docs.google.com/presentation/d/1bb_Dw5Hyvb8POGhNyoLSxw9dIwKMgKsv7CUBFJarf8s)
* [Data Strategy Pitch Template](https://docs.google.com/presentation/d/1LYlnNRtLgAOS29H29M5cUGtHKIVFtpKJsvPIzQzQi0U/edit#slide=id.g7ebd95ecfd_0_316)

## Publish
* In Script Editor, select "Resources" & "Cloud Platform project...".  Join to existing "standard" GCP project using the project number (Project Number = 599254386247 https://console.cloud.google.com/iam-admin/settings/project?project=arched-run-214623 )
FormTemplate is published to the G-Suite marketplace for just Contino.io G-Suite domain.
* Under "File" & "Manage versions" create/select a version.
* Under "File" & "Project properties" note the Project Key MpEWpV9GCmTyHANsCxvtUJrlUvHYZZW4p
* Under "File" & "Project properties" note "Scopes" (slightly enhanced)
```
  https://www.googleapis.com/auth/script.external_request
  https://www.googleapis.com/auth/calendar
  https://www.googleapis.com/auth/documents
  https://www.googleapis.com/auth/forms
  https://www.googleapis.com/auth/forms.currentonly
  https://www.googleapis.com/auth/presentations
  https://www.googleapis.com/auth/drive
  https://www.googleapis.com/auth/tasks
```
* These API must also be enabled for gcp project: https://console.cloud.google.com/apis/library
* "APIs & Services" & "OAuth consent screen"
```
  Application tye: Internal
  Application name: FormTemplate and pick logo 
```
* "APIs & Services" & "Credentials": create credentials drop-down menu, select OAuth client ID, Application type=Web, fill in the resulting form if needed. Click Create when finished, download your credential file containing your client ID and client secret.
https://console.cloud.google.com/apis/credentials/oauthclient/599254386247-n50a9np8gtjc4a027lgdfbm0s2qal0dm.apps.googleusercontent.com?project=arched-run-214623
* Enable G Suite Marketplace SDK 
* "Configuration"
https://console.cloud.google.com/apis/library/appsmarket-component.googleapis.com?q=Marketplace&id=1e37cda3-dfcf-4c07-9bec-fa8b595aa4d5&project=arched-run-214623&authuser=0&folder&organizationId
```
  Fill in required values
  Add Oauth 2.0 Scopes from above
  Forms add-on: MpEWpV9GCmTyHANsCxvtUJrlUvHYZZW4p and version from above
  Visiblity: My Domain (only contino.io)
```
* "Publish"
```
  Fill in required values
  Developer website: https://github.com/contino/FormTemplate
  Post Install Tip: Fill out form and submit to generate templated assets
  Category: Office Application
  All regions
```

## Install
* quicklink: https://gsuite.google.com/marketplace/mydomainapps
* or in Add-ons marketplace, search for "FormTemplate"
* From "Script editor" & "Edit" & "Current Project's triggers", add trigger: OnSubmit, Head, From form, On form submit, Notify me immediatlye

bhood gcp account, project https://console.cloud.google.com/apis/api/appsmarket.googleapis.com/overview?project=formtemplate
* https://developers.google.com/gsuite/add-ons/how-tos/editor-publish-overview
* https://developers.google.com/gsuite/add-ons/how-tos/publishing-editor-addons

## General Templating Guidelines
* Standardize variable DELMITER approaches such as ${var} or jinja2 {{var}} across all templated assets would be preferred.
* Templatized assets other than G-suite assets (e.g. Confluence templates/blueprints, git repos, etc.) may be optimally used with their native DELIMITERs.  For example, some confluence pages use <var>. At a mimimum, each asset type should use the same preferred DELIMITERs across all templates and jinja2 {{ }} should be default if not advantage is gain by using another DELIMITER.
* Google G-suite assets (Slides, Docs, Sheets) should indicate variables using common DELIMITERS jinja2 {{var}}.
* Allowed characters include [A-Za-z0-9_ ], so underscore or spaces or camelcase can be use in variable names.  In Add-ons and Forms, the **var** is presented to the user and must align with values in the templated assets.
* IMAGE variables are indicated with a prefix of IMAGE on the variable name.  These values must a full http/https url to a image resource.  For example, ${IMAGElogoUrl} indicates a logoUrl which must be a http/https url to an image.  For Slides, this variable must be in it's own textbox by itself, and the image will be resized to fix the text box dimensions (future dditional semantics on the IMAGE var could indicate sizing) and the textbox is removed.  Textbox should have the same aspect ratio everywhere, but can be resized to fit space. 
* For Docs, IMAGE vars are replace inline wherever they appears as text.
* The most common IMAGE application is for logo replacement, so a libary of client logs with a common aspect ratio and transparent background should be maintained. 
* G-suite features such as Slide Master/Layout and Doc Header/Footer should be used whenever possible.  Template processing will occur on these as in the body portion of the G-Suite asset.
* Formatting of elements which contain template variables should be constructed to render well with a variety of short/long values.

## Template Variable Guidelines
The **var** portion of the ${**var**} should follow common naming practices whenever possible to maximimize template utility.
* Each "domain" such as delivery or business development or HR will typically have a vocabulary of commonly used variables, and we should stive to maintain commonality across all assets and certainly within a "domain".  Since anyone can easily add new variables to templated assets, we may find it useful to automate the checking of compliance of variables to standardized variables in the future. This could be done by scanning or during the process of submitting or updating a templated resource to a common libary.
* In addition to names, type and validation for each variable should be adhered to.  
* Maximum length guidelines should be included for potential outliers (e.g. foreign names or just really long project names). In some cases the templated asset will react well to these by scrolling or fitting, but in other cases text could overlap and require manual resizing.
* Google Forms should enforce validation.
* For Deliver domain, standard variables include:
```
${Client}  - Client Name
${ProjectName} - Project Name
${Stakeholder} - Stakeholder Full Name
${Location} - Location of kick-off
${TP} - Technical Principal Full Name
${AP} - Account Principal Full Name
${CP} - Client Principal Full Name
${LC1}  - Lead Consultant Full Name
${LC2}  - Lead Consultant Full Name
${Outcome1}  - Outcome 1 from  SOW
${Outcome2}  - Outcome 2 from  SOW
${Outcome3}  - Outcome 3 from  SOW
${Outcome4}  - Outcome 4 from  SOW
${Outcome5}  - Outcome 5 from  SOW 
${TimeZone}  - Local time zone @ kickoff location. example: Eastern Standard Time (EST)
${ConferenceType}  - Zoom, WebEx, etc
${ConferenceID}  - ID to get onto conference bridge / webshare
```

## Dev set up (embedded)
* Your form should have question "titles" which match those used in the templated resources. Create a new Google Form and add some variables or use an existing Form that has questions already.
* From within your form, select the "three dots" in upper right corner and Script editor. If you are presented with a welcome screen, click Blank Project.
* Delete any code in the script editor and rename Code.gs to formtemplate.gs.
* Replace any code in these two files with the following content, respectively:
[formtemplate.gs](template.gs)
* Under the "Resources" & "Advanced Google Services", select Calendar API, Drive API, Google Docs API, Google Sheets API, Google Slides API, People API, and Tasks API
* Select the menu item File > Save all. Name your new script "FormTemplate" and click OK. The script's name is shown to end users in several places, including the authorization dialog.
* Switch back to your Form and reload the page.
* Fill out the response to the questions and click "Send" button.
* The first time you will get a dialog box indicates that the script requires authorization. Click Continue. A second dialog box requests authorization for specific Google services. Click Allow. This step needs to be done once.

## Learn more
* [Apps Script Slides API](https://developers.google.com/apps-script/reference/slides)
* [Extending Google Slides](https://developers.google.com/apps-script/guides/slides)
* [Translate](https://developers.google.com/apps-script/guides/slides/samples/translate)
* https://developers.google.com/gsuite/add-ons/editors/slides/quickstart/translate
* [Doc Variables](http://docvariables.com/) is similar, but no source
* https://docs.google.com/presentation/d/1bb_Dw5Hyvb8POGhNyoLSxw9dIwKMgKsv7CUBFJarf8s/edit#slide=id.g5e5b0c9b58_0_1
* https://developers.google.com/gsuite/add-ons/editors/slides
* https://codelabs.developers.google.com/codelabs/apps-script-intro/#6
* https://groups.google.com/forum/?utm_medium=email&utm_source=footer#!forum/doc-variables----support-and-requests
* https://zapier.com/apps/google-sheets/integrations/miro
* https://github.com/gsuitedevs/apps-script-samples
