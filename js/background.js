// // When the user clicks the browser-action button...
// chrome.browserAction.onClicked.addListener(function(tab) {
//     // ...inject 'jquery.min.js' and...
//     chrome.tabs.executeScript(tab.id, {
//         file: "js/jquery-1.10.2.min.js",
//         allFrames: true,
//         runAt: "document_idle"
//     });
//     // ...inject 'popup.js' into the active tab's page
//     chrome.tabs.executeScript(tab.id, {
//         file: "js/popup.js",
//         allFrames: true,
//         runAt: "document_idle"
//     });
// });