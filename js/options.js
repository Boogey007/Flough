// Save button
let saveButton = document.getElementById("SaveButton");

saveButton.addEventListener('click', () => {
  saveOptions()
});

// Init
getUserOptions()

// Saves options to chrome.storage
function saveOptions() {
    const teamInitials = document.getElementById('teamInitials').value;
    chrome.storage.sync.set(
      { teamInitials: teamInitials },
      () => {
        // // Update status to let user know options were saved.
        // const status = document.getElementById('status');
        // status.textContent = 'Options saved.';
        // setTimeout(() => {
        //   status.textContent = '';
        // }, 750);
      }
    );
};

function getUserOptions() {
    chrome.storage.sync.get("teamInitials", function (settings) {
        if(settings.teamInitials) 
            document.getElementById('teamInitials').value = settings.teamInitials;
    });
}

