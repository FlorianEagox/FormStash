document.querySelector("#btnNewStash").addEventListener("click", e => {
	chrome.tabs.executeScript({
		file: 'pageStasher.js'
	});
});