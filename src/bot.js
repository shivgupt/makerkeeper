import roots from 'durand-kerner'


// return object containing number of steps and step ratio (higher than slr) to hit tlr
// tlr = target liquidity ratio
// slr = safe low ratio
const findStep = (slr, tlr) => {
    const result = {
        step: 1,
        ratio: slr
    }
    var poly = [(tlr - 1), -1]
    for ( let i = 1; i < 6; i++){
        var r = roots(poly)[0]
        r.sort(function(a, b){return a - b})
        for (let j = 0; j < r.length; j++){
            if ( r[j] >= slr ) {
                result.step = i
                result.ratio = r[j]
                return result
            }
        }
        poly.unshift(tlr - 1)
    }
}

const arbitrage = () => {
    // Stock: Eth
    // Bond: Dai
    //
    // eth price low
    //
    // Short(dai):
    // - sell(dai)
    // - lock(peth)
    //
    //
    // eth price high
    //
    // Short(eth): 
    // - wipe(debt)
    // - borrow(dai)
    //
    // Goal: amount(eth) >= init(eth) at ${maturity} 

    // p + s = c + b

}
