chrome.runtime.onMessage.addListener(
	(request, sender, sendResponse) => {
		switch (request.action) {
			case "retrieveFormData":
				const inputs = []; // The form inputs we collect
				const unsupportedInputTypes = ["submit", "button", "image", "file", "hidden", "password", "reset"]; //All the inputs our extension will ignore
				const querySelection = "input:not([type=" + unsupportedInputTypes.join("]):not([type=") + "]), textarea";
				const nodes = Array.prototype.slice.call(document.querySelectorAll("*")); // create an array of all dom elements

				document.querySelectorAll(querySelection).forEach(el => { // get all the input elements of supported type
					if (el.value) // don't mind empty inputs
						if (el.id && document.querySelectorAll(el.id).length == 1) // If we can, we want to store reference to the ID rather than node index, but not all websites ID their inputs and some have duplicate IDs :/
							inputs.push([el.id, el.value]);
						else
							inputs.push([nodes.indexOf(el), el.value]); // get the index of the input in the array of all elements (please forgive me ^n^)
						});
				delete nodes;
				sendResponse(inputs);
		}
	}
);