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
			const key = tabs[0].url;
			chrome.storage.sync.get(key, storage => {
				const name = "Stash ";
				if(!storage[key])
					storage[key] = [new Stash(name + "1", response.formData)];
				else
					storage[key].push(new Stash(name + storage[key].length + 1, response.formData));
				chrome.storage.sync.set({[key]: storage[key]});
			});
		})
	);
});