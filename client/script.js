document.getElementById('submit').addEventListener('click', async function (event) {
	event.preventDefault();

	// Get input values from user through html
	const num_bed = document.getElementById('bed-selection').value;
	const num_bath = document.getElementById('bath-selection').value;
	const lot_size = document.getElementById('lot-size').value;
	const square_footage = document.getElementById('square-footage').value;
	const address = document.getElementById('address').value;
	const city = document.getElementById('city').value;
	const state = document.getElementById('state-selection').value;
	const zip_code = document.getElementById('zip').value;

	// Make sure inputs are valid
	if (
		num_bed == 'Select Beds...' ||
		num_bath == 'Select Baths...' ||
		square_footage == '' ||
		lot_size == '' ||
		city == '' ||
		zip_code == '' ||
		state == '' ||
		address == ''
	) {
		alert('At least one field box is not entered');
	} else {
		// Send data to API
		const inputData = {
			num_bed: parseInt(num_bed),
			num_bath: parseInt(num_bath),
			acre_lot: parseFloat(lot_size),
			house_size: parseFloat(square_footage),
			address: address,
			city: city,
			state: state,
			zip_code: zip_code,
		};

		try {
			const response = await fetch(
				'https://csci4050-project-443664441532.northamerica-northeast2.run.app/predict',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(inputData),
				}
			);

			// Check for a good response
			if (response.ok) {
				const data = await response.json();

				// Display the prediction result in the output div
				const resultDiv = document.getElementById('output');
				if (data.error) {
					let result = `<strong>Error:</strong> ${data.error}`;
					resultDiv.innerHTML = result;
				} else {
					let price = Intl.NumberFormat().format(data.price);
					let result = `<strong>Predicted Price:</strong> $${price}`;
					resultDiv.innerHTML = result;
				}
			} else {
				throw new Error('Unable to predict price given input data');
			}
		} catch (error) {
			console.error('Error:', error);
			document.getElementById('output').innerHTML =
				'<strong>Error:</strong> Unable to fetch data from server.';
		}
	}
});
