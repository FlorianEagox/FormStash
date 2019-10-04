chrome.runtime.onMessage.addListener(
	(request, sender, sendResponse) => {
		const nodes = Array.prototype.slice.call(document.querySelectorAll("*")); // create an array of all dom elements
		switch (request.action) {
			case "retrieveFormData":
				sendResponse(retrieveFormData());
				break;
			case "fillFormData":
				request.elements.forEach(el => {
					if (typeof el[0] == "string")
						document.querySelector("#" + el[0]).value = el[1];
					else
						nodes[el[0]].value = el[1];
				});
				break;
			case "enableLiveUpdate":
				request.elements.forEach(data => {
					let element;
					if(typeof data[0] == "string")
						element = document.querySelector("#" + data[0])
					else
						element = nodes[data[0]];
					element.addEventListener("change", e => {
						chrome.storage.sync.set({ [request.key]: retrieveFormData()});
					});
				})
				break;
		}
		delete nodes;
	}
);

function retrieveFormData() {
	const inputs = []; // The form inputs we collect
	const unsupportedInputTypes = ["submit", "button", "image", "file", "hidden", "password", "reset"]; //All the inputs our extension will ignore
	const querySelection = "input:not([type=" + unsupportedInputTypes.join("]):not([type=") + "]), textarea";

	document.querySelectorAll(querySelection).forEach(el => { // get all the input elements of supported type
		if (el.value) // don't mind empty inputs
			if (el.id && document.querySelectorAll("#" + el.id).length == 1) // If we can, we want to store reference to the ID rather than node index, but not all websites ID their inputs and some have duplicate IDs :/
				inputs.push([el.id, el.value]);
			else
				inputs.push([nodes.indexOf(el), el.value]); // get the index of the input in the array of all elements (please forgive me ^n^)
	});
	return inputs;
}