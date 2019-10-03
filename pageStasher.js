chrome.runtime.onMessage.addListener(
	(request, sender, sendResponse) => {
		if (request.action == "retrieveFormData") {
			const inputs = [];
			const unsupportedInputTypes = ["submit", "button", "image", "file", "hidden", "password", "reset"]; //All the inputs our extension will ignore
			const querySelection = "input:not([type=" + unsupportedInputTypes.join("]):not([type=") + "]), textarea";
			const nodes = Array.prototype.slice.call(document.querySelectorAll("*")); // create an array of all dom elements

			document.querySelectorAll(querySelection).forEach(el => { // get all the input elements of supported type
				if (el.value != "") // don't mind empty inputs
					if (el.id != "") // If we can, we want to store reference to teh ID rather than node index, but not all websites ID their inputs :/
						inputs.push(new Input(el.id, el.value));
					else
						inputs.push(new Input(nodes.indexOf(el), el.value)); // get the index of the input in the array of all elements (please forgive me ^n^)
			});
			delete nodes;
			//For now return as array
			sendResponse(inputs);
		}
	}
);