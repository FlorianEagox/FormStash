// Inject our content scripts
chrome.tabs.executeScript({ file: 'input.js' });
chrome.tabs.executeScript({ file: 'pageStasher.js' });
document.querySelector("#btnNewStash").addEventListener("click", e => {
	chrome.tabs.query({active: true, currentWindow: true}, tabs => // get the current tab
		chrome.tabs.sendMessage(tabs[0].id, {action: "retrieveFormData"}, response => { // Tell the content script to collect all the inputs
			 // For stashes un-named by user
			let keyShortName;
			let keyName;
			// go through the existing stashes and figure out how many we already have for this page
			chrome.storage.sync.get(null, stashes => {
				let stashIndex = Object.keys(stashes).filter(key => key.includes(tabs[0].url)).length;
				keyShortName = `Stash ${stashIndex}` // TODO allow user to input stash name, for now
				keyName = `${tabs[0].url}|${keyShortName}`;
				chrome.storage.sync.set({[keyName]: response});
			});
		})
	);
});