// populate the popup with the existing stashes
const stashList = document.querySelector("#stashList");
updateStashList();

// Inject our content scripts
chrome.tabs.executeScript({ file: 'contentScript.js' });

document.querySelector("#stashInfo").addEventListener("submit", e => {
	e.preventDefault();
	createNewStash();
	
});


function createNewStash(e) {
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
					const now = new Date();
					
					keyName += `Stash ${stashIndex} ${now.toLocaleDateString().substring(0, now.toLocaleDateString().length - 4)}${now.getFullYear().toString().substr(-2)} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
					chrome.storage.sync.set({ [keyName]: response });
					updateStashList();
				});
			} else {
				keyName += stashName;
				chrome.storage.sync.set({ [keyName]: response });
				updateStashList();
			}
			document.querySelector("#stashName").value = "";
		}));
}

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
				const deleteBtn = document.createElement("button");
				deleteBtn.innerHTML = "Delete";
				deleteBtn.class = "btnStashDelete";
				deleteBtn.addEventListener("click", e => {
					chrome.storage.sync.remove(stash, result => updateStashList());
				});
				li.appendChild(deleteBtn);
				stashList.appendChild(li);
			}
		}))
	});
}