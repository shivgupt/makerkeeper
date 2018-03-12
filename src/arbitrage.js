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
    // Borrow if high
    // drawDAI

    // Lock if low
    // Exchange dai => weth => peth
    // Lock 
    
    // Emergency break
    // shut
}
