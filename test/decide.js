
////////////////////////////////////////
// Internal Helper Functions
////////////////////////////////////////

// return confidence of price change
// positive = predict price increase
// negative = predict price decrease
const predict = (price, history) => {
    return (price > history[0]) ? -0.5 : 0.5
}

////////////////////////////////////////
// Define Exported Object
////////////////////////////////////////

const decide = (price, history) => {

    // decide next would be high or low - next is sell or buy
    if( predict(price, history) < 0) {
        return (['sell', 1])
    } else {
        return (['buy', 1])
    }
}

export default decide
