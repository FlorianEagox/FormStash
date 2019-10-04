// This script handles actions run by the popup. Its role is to handle data on the page, it shouldn't interact with the rest of the extension (e.g. files) unless required (like when the popup window might be closed)

const unsupportedInputTypes = ["submit", "button", "image", "file", "hidden", "password", "reset"]; //All the inputs our extension will ignore
const validInputQuerySelection = "input:not([type=" + unsupportedInputTypes.join("]):not([type=") + "]), textarea";
let currentStash; // This is for the auto tracking. Keeps track of which stash is checked (or none)

chrome.runtime.onMessage.addListener(
	(request, sender, sendResponse) => {
		const nodes = Array.prototype.slice.call(document.querySelectorAll("*")); // create an array of all dom elements
		switch (request.action) {
			case "retrieveFormData":
				sendResponse(retrieveFormData());
				break;
			case "fillFormData":
				request.elements.forEach(data => { // go through each element stored in the stash
					if (typeof data[0] == "string") //the storage refers to the ID of an element
						document.querySelector("#" + data[0]).value = data[1];
					else // the storage refers to an index of an element
						nodes[data[0]].value = data[1];
				});
				break;
			case "getCheckedStash": // When determining which box is checked, we need to know which stash is selected
				sendResponse(currentStash);
				break;
			case "setCheckedStash": // When a box checked, update the selected stash
				currentStash = request.newStash;
				break;
			case "enableLiveUpdate":
				// We need to create and remove the event listeners for all possible inputs to autoupdate 
				document.querySelectorAll(validInputQuerySelection).forEach(el =>
					el.addEventListener("change", storeUpdatedFormData)
				);
				break;
			case "disableLiveUpdate":
				currentStash = null; // so that the current stash box won't be checked
				document.querySelectorAll(validInputQuerySelection).forEach(el =>
					el.removeEventListener("change", storeUpdatedFormData)
				);
				break;
		}
		delete nodes;
	}
);

function retrieveFormData() {
	const inputs = []; // The form inputs we collect

	document.querySelectorAll(validInputQuerySelection).forEach(el => { // get all the input elements of supported type
		if (el.value) // don't mind empty inputs
			if (el.id && document.querySelectorAll("#" + el.id).length == 1) // If we can, we want to store reference to the ID rather than node index, but not all websites ID their inputs and some have duplicate IDs :/
				inputs.push([el.id, el.value]);
			else
				inputs.push([nodes.indexOf(el), el.value]); // get the index of the input in the array of all elements (please forgive me ^n^)
	});
	return inputs;
}

 // Whenever an input is updated, update the storage entry. We have to do this here, because the popup JS doesn't recieve messages when closed.
function storeUpdatedFormData() {
	chrome.storage.sync.set({ [currentStash]: retrieveFormData()});
}