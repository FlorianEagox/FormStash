// populate the popup with the existing stashes
const stashList = document.querySelector("#stashList");
displayStashes();

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
					displayStashes();
				});
			} else {
				keyName += stashName;
				chrome.storage.sync.set({ [keyName]: response });
				displayStashes();
			}
			document.querySelector("#stashName").value = "";
		}));
}

function displayStashes() {
	stashList.innerHTML = ""; // clear the existing ones
	chrome.tabs.query({ active: true, currentWindow: true }, tab => {
		chrome.storage.sync.get(null, stashes => Object.keys(stashes).forEach(stash => { // get all the stashes
			if (stash.split("|")[0].includes(tab[0].url) || tab[0].url.includes(stash.split("|")[0])) { // if you're on a page you've saved a stash for
				let li = document.createElement("li");
				let a = document.createElement("a");
				a.id = stash;
				a.text = stash.split("|")[1];
				a.href = "";
				a.className = "stashItemName";
				a.addEventListener("click", e => {
					e.preventDefault();
					// populate the web page with the stash data
					chrome.tabs.sendMessage(tab[0].id, { action: "fillFormData", elements: stashes[stash] });
				})
				li.appendChild(a);

				const controls = document.createElement("div");
				controls.className = "stashControls";
				
				const lblCheck = document.createElement("label");
				lblCheck.htmlFor = "chk" + stash;
				lblCheck.innerHTML = '<i class="fas fa-sync"></i>';
				lblCheck.title = "Auto Update Stash"
				controls.appendChild(lblCheck);
				
				
				const chkEnableLive = document.createElement("input");
				chkEnableLive.type = "checkbox";
				chkEnableLive.class = "chkEnLive";
				chkEnableLive.id = "chk" + stash;
				// check if the current stash is the selected one (this runs when the popup is opened only)
				chrome.tabs.query({active: true, currentWindow: true}, tabs => 
					chrome.tabs.sendMessage(tabs[0].id, {action: "getCheckedStash"}, response => {
						if(response == stash) {
							chkEnableLive.checked = true;
							lblCheck.className = "accented";
						}
				}));

				chkEnableLive.addEventListener("change", e =>
					chrome.tabs.query({ active: true, currentWindow: true }, tabs =>{
						if(chkEnableLive.checked) { // if we check the box, set the content script's stash to this one, and add the event listeners.
							chrome.tabs.sendMessage(tabs[0].id, { action: "setCheckedStash", newStash: stash });
							chrome.tabs.sendMessage(tabs[0].id, { action: "enableLiveUpdate" });
							document.querySelectorAll("label").forEach(label => label.classList.remove("accented")); //un check the other labels
							lblCheck.classList.add("accented");
						} else { // if we uncheck, stop updating.
							chrome.tabs.sendMessage(tabs[0].id, { action: "disableLiveUpdate" });
							lblCheck.classList.remove("accented");
						}
				}));
				controls.appendChild(chkEnableLive);

				const btnUpdate = document.createElement("button");
				btnUpdate.innerHTML = '<i class="fas fa-edit"></i>';
				
				btnUpdate.className = "btnUpdateStash";
				btnUpdate.addEventListener("click", () => updateStashData(stash));
				btnUpdate.title = "Update This Stash";

				controls.appendChild(btnUpdate);

				const btnDelete = document.createElement("button");
				btnDelete.innerHTML = '<i class="fas fa-trash"></i>';;
				btnDelete.className = "btnStashDelete";
				btnDelete.title = "Delete This Stash";
				btnDelete.addEventListener("click", e => {
					chrome.storage.sync.remove(stash, result => displayStashes());
				});
				controls.appendChild(btnDelete);
				
				li.appendChild(controls);
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