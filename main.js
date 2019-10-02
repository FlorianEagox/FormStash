document.querySelector("#btnNewStash").addEventListener("click", e => {
	chrome.tabs.executeScript({file: 'input.js'});
	chrome.tabs.executeScript({file: 'pageStasher.js'});
});