class Stash {
	constructor(id, data) {
		this.id = id;
		this.data = data;
	}
}

chrome.tabs.executeScript({ file: 'input.js' });
chrome.tabs.executeScript({ file: 'pageStasher.js' });
document.querySelector("#btnNewStash").addEventListener("click", e => {
	chrome.tabs.query({active: true, currentWindow: true}, tabs =>
		chrome.tabs.sendMessage(tabs[0].id, {action: "retrieveFormData"}, response => {
			let stashIndex = 0;
			chrome.storage.sync.get(null, stashes => Object.keys(stashes).forEach((key) =>
				stashIndex += key.includes(tabs[0].url)
			));
			let keyShortName = `Stash ${stashIndex}`
			let keyName = `${tabs[0].url}|${keyShortName}`;
			chrome.storage.sync.set({[keyName]: response});
		})
	);
});