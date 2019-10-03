// populate the popup with the existing stashes
const stashList = document.querySelector("#stashList");
updateStashList();

// Inject our content scripts
chrome.tabs.executeScript({ file: 'contentScript.js' });

document.querySelector("#btnNewStash").addEventListener("click", e => {
	chrome.tabs.query({ active: true, currentWindow: true }, tabs => // get the current tab
		chrome.tabs.sendMessage(tabs[0].id, { action: "retrieveFormData" }, response => { // Tell the content script to collect all the inputs
			// For stashes un-named by user
			let keyShortName;
			let keyName = `${tabs[0].url}|`;
			let stashName = document.querySelector("#stashName").value;
			if (!stashName) {
				// go through the existing stashes and figure out how many we already have for this page
				chrome.storage.sync.get(null, stashes => {
					let stashIndex = Object.keys(stashes).filter(key => key.includes(tabs[0].url)).length;
					keyName += `Stash ${stashIndex}`;
					chrome.storage.sync.set({ [keyName]: response });
				});
			} else {
				keyName += stashName;
				chrome.storage.sync.set({ [keyName]: response });
			}
			updateStashList();
		}));
});

function updateStashList() {
	stashList.innerHTML = "";
	chrome.tabs.query({ active: true, currentWindow: true }, tab => {
		chrome.storage.sync.get(null, stashes => Object.keys(stashes).forEach(stash => {
			if (stash.split("|")[0].includes(tab[0].url) || tab[0].url.includes(stash.split("|")[0])) {
				let li = document.createElement("li");
				let a = document.createElement("a");
				a.id = stash;
				a.text = stash.split("|")[1];
				a.href = "#";
				a.class = "stashItem"
				a.addEventListener("click", e => {
					e.preventDefault();
					// populate the web page with the stash data
					chrome.tabs.sendMessage(tab[0].id, { action: "fillFormData", elements: stashes[stash] });
				})
				li.appendChild(a);
				stashList.appendChild(li);
			}
		}))
	});
}