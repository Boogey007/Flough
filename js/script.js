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
        if ( option == 'commit' )
            main = getGithubCommitMessage(url)
        else 
            main = getGithubBranchMessage(url)

    }

    // go into azure scripts
    else if ( environmentId == 2  ) {
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
    if(!pageUrl) return 0
    if (pageUrl.includes('github.com'))
        return 1
    else if (pageUrl.includes('dev.azure.com')) 
        return 2
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

    function getDefectAndNumber() {
        // Select the defect type
        const defectElement = document.querySelector('.work-item-form-header span[aria-label]');
        const defectType = defectElement ? defectElement.getAttribute('aria-label' || '').toLowerCase() : '';
    
        // Select the number from the specific div
        const numberElement = document.querySelector('.work-item-form-header .body-xl');
        const number = numberElement ? numberElement.textContent.trim() : '';
    
        return { defectType, number };
    }
    
// *** ---------- START: AZURE ------------  *** //
function getAzureCommitMessage(pageUrl) {
    let tempEl = document.querySelector('[id^="witc_"][id$="txt"]');
    let number = '';
    let title = '';
    
    // Check if tempEl exists and set tempEl to its id if it does
    tempEl = tempEl ? tempEl.id : '';

    if (!tempEl) {
        // Select the number from the specific div
        const numberElement = document.querySelector('.work-item-form-header .body-xl');
        number = numberElement ? numberElement.textContent.trim() : '';
        
        // Select the title from the input field
        const titleElement = document.querySelector('.work-item-title-textfield input');
        title = titleElement ? titleElement.value.trim() : '';      
    }

    const inputBox = document.getElementById(tempEl);
    const commitTitle = inputBox ? inputBox.value : '';

    // Use number and title if they have values
    const finalNumber = number || (document.querySelector('.work-item-form-id') ? document.querySelector('.work-item-form-id').innerText : '');
    const finalTitle = title || commitTitle;

    // Assemble Commit Message
    let commitMsg = `[ AB#${finalNumber} ] - ${finalTitle}`;
    
    // Strip quotes
    commitMsg = commitMsg.replaceAll('"', '').replaceAll("'", '');

    if (!commitMsg) {
        if (!finalNumber) console.log('Form Id not getting found');
        if (!finalTitle) console.log('Commit Title not being found');
    }

    return commitMsg;
 }

// Example usage
 function getAzureBranchMessage(pageUrl) {
    let branchText = '';
    let prefaceText = '';
    let azureStoryNumber = '';

    const itemTitle = document.querySelector('.caption');

    let type = 0;

    if (!itemTitle || !itemTitle.innerText) {
        const result = getDefectAndNumber();
        azureStoryNumber = result.number;
        type = getItemType(result.defectType);
    } else {
        azureStoryNumber = getLastString(itemTitle.innerText);
        type = getItemType(itemTitle.innerText);
    }

    switch (type) {
        case 1: // Bug
            prefaceText = `bugfix/`;
            break;
        case 2: // User Story
            prefaceText = `feature/`;
            break;
        default:
            prefaceText = ``;
            break;
    }

    // Form Branch Text
    if (TEAM_INITIALS) {
        branchText = `${prefaceText}${TEAM_INITIALS}/${azureStoryNumber}`;
    } else {
        branchText = `${prefaceText}${azureStoryNumber}`;
    }

    return removeWhitespace(branchText);
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

    TEAM_INITIALS = settings.teamInitials ? settings.teamInitials : ''
}

function getItemType(str) {
    if (!str) return 0;
    if (str.toLowerCase().includes('bug')) {
        return 1;
    } else if (str.toLowerCase().includes('user story')) {
        return 2;
    } else {
        return 0;
    }
}

function getLastString(text) {
    if(!text) return ''

    let temp = text.split(' ')
    return temp[temp.length - 1];
}

function removeWhitespace(str) {
    return str.replace(/\s+/g, '');
}
