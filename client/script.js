document.getElementById('submit').addEventListener('click', async function (event) {
    event.preventDefault();

    const num_bed = document.getElementById('bed-selection').value;
    const num_bath = document.getElementById('bath-selection').value;
    const square_footage = document.getElementById('square-footage').value;
    const lot_size = document.getElementById('lot-size').value;
    const address = document.getElementById('address').value;
    const city = document.getElementById('city').value;
    const state = document.getElementById('state-selection').value;
    const zip_code = document.getElementById('zip').value;

    if (
        num_bed === 'Select Beds...' ||
        num_bath === 'Select Baths...' ||
        !square_footage ||
        !lot_size ||
        !address ||
        !city ||
        !state ||
        !zip_code
    ) {
        alert('Please fill in all fields before submitting.');
        return;
    }

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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(inputData),
            }
        );

        if (response.ok) {
            const data = await response.json();
            const outputDiv = document.getElementById('output');
            const priceSpan = document.getElementById('predicted-price');

            if (data.error) {
                outputDiv.className = 'mt-4 alert alert-danger text-center';
                priceSpan.textContent = data.error;
            } else {
                const formattedPrice = Intl.NumberFormat().format(data.price);
                priceSpan.textContent = `$${formattedPrice}`;
                outputDiv.className = 'mt-4 alert alert-success text-center';
            }

            // Show the output section
            outputDiv.style.display = 'block';

            // Scroll to the output section
            outputDiv.scrollIntoView({ behavior: 'smooth' });
        } else {
            throw new Error('Failed to fetch prediction');
        }
    } catch (error) {
        console.error(error);
        document.getElementById('output').className = 'mt-4 alert alert-danger text-center';
        document.getElementById('predicted-price').textContent =
            'An error occurred while processing your request.';
        document.getElementById('output').style.display = 'block';

        // Scroll to the output section if there's an error
        document.getElementById('output').scrollIntoView({ behavior: 'smooth' });
    }
});
