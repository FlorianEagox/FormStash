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
					let stashIndex = 1 + Object.keys(stashes).filter(key => key.includes(tabs[0].url)).length;
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

				const chkEnableLive = document.createElement("input");
				chkEnableLive.type = "checkbox";
				chkEnableLive.class = "chkEnLive";
				chkEnableLive.title = "Auto Update Stash"
				chrome.tabs.query({active: true, currentWindow: true}, tabs => 
					chrome.tabs.sendMessage(tabs[0].id, {action: "getCheckedStash"}, response => 
						chkEnableLive.checked = (response == stash)
				));
				chkEnableLive.addEventListener("change", e => {
					chrome.tabs.query({ active: true, currentWindow: true }, tabs =>{
						if(chkEnableLive.checked) {
							chrome.tabs.sendMessage(tabs[0].id, { action: "setCheckedStash", newStash: stash });
							chrome.tabs.sendMessage(tabs[0].id, { action: "enableLiveUpdate" });
						} else
							chrome.tabs.sendMessage(tabs[0].id, { action: "disableLiveUpdate" });
					});
				});
				li.appendChild(chkEnableLive);

				const btnUpdate = document.createElement("button");
				btnUpdate.innerHTML = "Update";
				btnUpdate.className = "btnUpdateStash"
				btnUpdate.addEventListener("click", () => updateStashData(stash));
					
				li.appendChild(btnUpdate);

				const btnDelete = document.createElement("button");
				btnDelete.innerHTML = "Delete";
				btnDelete.className = "btnStashDelete";
				btnDelete.addEventListener("click", e => {
					chrome.storage.sync.remove(stash, result => updateStashList());
				});
				li.appendChild(btnDelete);

				stashList.appendChild(li);
			}
		}))
	});
}

function updateStashData(stash) {
	chrome.tabs.query({ active: true, currentWindow: true }, tabs =>
		chrome.tabs.sendMessage(tabs[0].id, { action: "retrieveFormData" }, response =>
			chrome.storage.sync.set({ [stash]: response })
		));
}