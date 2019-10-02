chrome.tabs.executeScript({ file: 'input.js' });
chrome.tabs.executeScript({ file: 'pageStasher.js' });
document.querySelector("#btnNewStash").addEventListener("click", e => {
	chrome.tabs.query({active: true, currentWindow: true}, tabs => 
		chrome.tabs.sendMessage(tabs[0].id, {action: "retrieveFormData"}, response => {
			document.writeln(response.formData);
		})
	);
});