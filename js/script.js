chrome.storage.local.get(
    ["url", "tab", "option", "settings"], function(items){
    
    url = items.url
    tab = items.tab
    option = items.option
    SETTINGS = items.settings

    setAllSettings(SETTINGS)

    environmentId = determineSourcePage(url)
    //console.log(environmentId)
    // Assign environmentId to determine source
    var environmentId = determineSourcePage(url)
    var main =''

    // Go into github Script
    if( environmentId == 1 ) {
        console.log(environmentId)
        if ( option == 'commit' )
            main = getGithubCommitMessage(url)
        else 
            main = getGithubBranchMessage(url)

    }

    // go into azure scripts
    else if ( environmentId == 2  ) {
        console.log(environmentId)

        if ( option == 'commit' )
            main = getAzureCommitMessage(url)
        else 
            main = getAzureBranchMessage(url)
        
    }
    // Failsafe
    else { main = "" } 
        
    // Now that we have the message itself we need to do the clipboard hack
    // call injected function and assign to var
    copyTextToClipboard(main)

})


// Page source detection
function determineSourcePage(pageUrl) {
    
    if (pageUrl.includes('github.com'))
        return 1
    else if (pageUrl.includes('dev.azure.com')) 
        return 2
    else 
        return 0
}

function copyTextToClipboard(text) {
	//Create a text-box field where we can insert text to.
	var copyFrom = document.createElement("textarea");

	//Set the text content to be the text you wished to copy.
	copyFrom.textContent = text;

	//Append the text-box field into the body as a child.
	//"execCommand()" only works when there exists selected text, and the text is inside
	//document.body (meaning the text is part of a valid rendered HTML element).
	document.body.appendChild(copyFrom);

	//Select all the text!
	copyFrom.select();

	//Execute command
	document.execCommand('copy');

	//(Optional) De-select the text using blur().
	copyFrom.blur();

	//Remove the textbox field from the document.body, so no other JavaScript nor
	//other elements can get access to this.
	document.body.removeChild(copyFrom);
  }


// *** ---------- START: AZURE ------------  *** //
function getAzureCommitMessage(pageUrl) {
    // Get The title of the task -- Emails - Reply To All
    var tempEl = document.querySelector('[id^="witc_"][id$="txt"]').id;
    var inputBox = document.getElementById(tempEl)
    var commitTitle = !! inputBox ? inputBox.value : ''

    // Get the number of the task -- 422
    var formId = document.getElementsByClassName("work-item-form-id")[0].innerText;
 
    // Assemble Commit Message
    var commitMsg = '[ AB#' + formId + ' ] - ' + commitTitle 
    var main = commitMsg;
 
     if( !main ){
         if(!formId) console.log('Form Id not getting found')
         if(!commitTitle) console.log('Commit Title not being found')
     }
 
     return main
 }
 function getAzureBranchMessage(pageUrl) {
     // bug = 1
     // US = 2
    let branchText = ''
    var itemTitle = document.querySelector('.caption').innerText    
    azureStoryNumber = getLastString(itemTitle)  
    let type = getItemType(itemTitle);

     switch (type) {
        case 1: // Bug
            branchText = `bugfix/${TEAM_INITIALS}/${azureStoryNumber}`
            break;
        case 2: // User Story
            branchText = `feature/${TEAM_INITIALS}/${azureStoryNumber}`
            break;
        default:
            branchText = `${TEAM_INITIALS}/${azureStoryNumber}`
            break;
     }
  
     var main = branchText;
      if( !main ){
          if(!formId) console.log('Form Id not getting found')
          if(!branchHandle) console.log('branchHandle not being found')
      }
  
      return removeWhitespace(main)
  }
 // *** ---------- END: AZURE ------------  *** //
 
 
 
// *** ---------- START: GITHUB ------------  *** //
function getGithubCommitMessage(pageUrl) {
    // https://github.com/ORG/PROJECT-NAME/projects/4
    // 0: "https:"
    // 1: ""
    // 2: "github.com"
    // 3: "ORG"
    // 4: "PROJECT-NAME"
    // 5: "endpoint"
    // 6: "NUMBER"
    var org = ''
    var projectName = ''
    var urlSplit = pageUrl.split('/')
    if( !! urlSplit ) {
        org = urlSplit[3]
        projectName = urlSplit[4]
    }
    // Need to grab project
    var prefix = org + '/' + projectName
    var commitTitle = ''

    // FULL SCREEN TAB
    // [ org/projectName#6294 ] - Task Title
    // Get The title of the task -- Emails - Reply To All
    var tempEl = document.querySelector('span.js-issue-title');
    if( !! tempEl )
        commitTitle = tempEl.innerText
    
    // Get the number of the task -- 422
    var formId = ''
    if( !! document.getElementsByClassName("gh-header-number") && document.getElementsByClassName("gh-header-number").length > 0 ) {
        var formId = document.getElementsByClassName("gh-header-number")[0].innerText;
    }
    else {
        var formIdHandleLink = ''
        var formIdHandle = document.querySelector(".js-project-card-details-external-link")
        // POPOUT WINDOW
        if( !! formIdHandle ) {
            var formIdHandleLink = formIdHandle.href.split('/');
            formId = '#' + formIdHandleLink.at(-1)

        }
    }

    var commitMsg = ''
    var main = ''
    // Assemble Commit Message
    if( !! prefix && !! formId && !! commitTitle ) {
        commitMsg = '[ ' + prefix + formId + ' ] - ' + commitTitle 
        main = commitMsg
    }
    
    return main
}
// FOR GITHUB BRANCH CODE
function getGithubBranchMessage(pageUrl) {
    // https://github.com/ORG/PROJECT-NAME/projects/4
    // 0: "https:"
    // 1: ""
    // 2: "github.com"
    // 3: "ORG"
    // 4: "PROJECT-NAME"
    // 5: "endpoint"
    // 6: "NUMBER"
    var org = ''
    var projectName = ''
    var urlSplit = pageUrl.split('/')
    if( !! urlSplit ) {
        org = urlSplit[3]
        projectName = urlSplit[4]
    }
    // Need to grab project
    var prefix = org + '/' + projectName
    var branchTitle = ''
    var preBranchText = 'hotfix/'

    // FULL SCREEN TAB
    // [ org/projectName#6294 ] - Task Title
    // Get The title of the task -- Emails - Reply To All
    var tempEl = document.querySelector('.js-issue-sidebar-form a.Link--secondary');
    if( !! tempEl )
        branchTitle = tempEl.innerText

        // Get the number of the task -- 422
    var formId = ''
    if( !! document.getElementsByClassName("gh-header-number") && document.getElementsByClassName("gh-header-number").length > 0 ) {
        var formId = document.getElementsByClassName("gh-header-number")[0].innerText;
    }
    else {
        var formIdHandleLink = ''
        var formIdHandle = document.querySelector(".js-project-card-details-external-link")
        // POPOUT WINDOW
        if( !! formIdHandle ) {
            var formIdHandleLink = formIdHandle.href.split('/');
            formId = '-' + formIdHandleLink.at(-1)

        }
    }
    var branchMsg = ''

    var branchMsg = ''
    var main = ''
    // Assemble Commit Message
    if( !! preBranchText && !! branchTitle && !! formId ) {
        branchMsg = preBranchText + branchTitle + formId;
        main = branchMsg
    }
    
    return removeWhitespace(main)
}
// *** ---------- END: GITHUB ------------  *** //


function getItemType(item) {
    // No Clue = 0
    //Bug = 1
    //UserStory = 2
    if(! item) return 0
    item = item.toLowerCase()
    
    if(item.includes('bug')) return 1
    else if(item.includes('story')) return 2

}

function setAllSettings(settings) {
    if(!settings) return
    TEAM_INITIALS = settings.teamInitials
}

function getLastString(text) {
    let temp = text.split(' ')
    return temp[temp.length - 1];
}

function removeWhitespace(input) {
    input = input.replace(/\s/g, '');
    return input;
}