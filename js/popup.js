function getCurrentTabUrl(callback) {
	// Query filter to be passed to chrome.tabs.query - see
	// https://developer.chrome.com/extensions/tabs#method-query
	var queryInfo = {
		active: true,
		currentWindow: true
	};

	chrome.tabs.query(queryInfo, (tabs) => {
		// chrome.tabs.query invokes the callback with a list of tabs that match the
		// query. When the popup is opened, there is certainly a window and at least
		// one tab, so we can safely assume that |tabs| is a non-empty array.
		// A window can only have one active tab at a time, so the array consists of
		// exactly one tab.
		let tab = tabs[0];
		// console.log(tab);

		// A tab is a plain object that provides information about the tab.
		// See https://developer.chrome.com/extensions/tabs#type-Tab
		let url = tab.url;

		// tab.url is only available if the "activeTab" permission is declared.
		// If you want to see the URL of other tabs (e.g. after removing active:true
		// from |queryInfo|), then the "tabs" permission is required to see their
		// "url" properties.
		console.assert(typeof url == 'string', 'tab.url should be a string');

		callback(url, tab);
	});
}


// Main handler get commit msg text
function popUpButtonPressed(url, tab, option, settings) {
    chrome.storage.local.set({ 
        "url": url,
        "tab": tab,
        "option": option,
		"settings":settings
     }, function(){
        //  Data has been saved boys and girls, go on home
    });
	chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['js/script.js']

        }
    );

}

// Popup button click listeners
document.addEventListener('DOMContentLoaded', () => {
	getCurrentTabUrl((url, tab) => {
        // Track on Commit Button
		var commitClick = document.getElementById('mybCommit');
        // Track on Branch Button
        var branchClick = document.getElementById('mybBranch');
		let settings = null;

		chrome.storage.sync.get("teamInitials", function (prefs) {
			settings = prefs;
		});
		
        // buttonClick
		commitClick.addEventListener('click', () => {
			popUpButtonPressed(url, tab, 'commit', settings);
		});

         // buttonClick
         branchClick.addEventListener('click', () => {
			popUpButtonPressed(url, tab, 'branch', settings);
		});
        
	});
});