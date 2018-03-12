
class TraderBot {

  constructor(price) {
    // memory
    this.lastPrice = price // price at last action

    // magic numbers
    this.collateral = 5

    this.targetRatio = 2.5 // safelow & target for this.collateral/this.debt
    this.dai = (5 * price) / this.targetRatio
    this.debt = (5 * price) / this.targetRatio
    this.threshold = 50 // distance from lastPrice to trigger next action

  }

  print(price) {
    console.log(`score ${this.score(price)} (${this.long_score()}) | ${Math.round(this.dai)} dai | ${this.debt} debt | collateral ${this.collateral} is worth ${this.collateral*price}; ${this.getRatio(price)} ratio`)
  }

  long_score() {
    return this.score(1000)
  }

  score(price) {
    return Math.round( this.dai - this.debt + (this.collateral * price) )
  }

  getRatio(price) {
    return this.collateral * price / this.debt
  }

  decide(price) {
    if (Math.abs(price - this.lastPrice) >= 50) {

      if (price > this.lastPrice) {

        const delta = ( (price * this.collateral) / this.targetRatio ) - this.debt

        this.dai += delta
        this.debt += delta

      } else {

        const delta = (this.targetRatio * this.debt) - (this.collateral * price)

        this.collateral += delta / price
        this.dai -= delta
        this.debt -= this.dai/2
        this.dai /= 2
      }

      this.lastPrice = price

    }
  }

};

const pricefeeds = {
  mountain: [800, 850, 900, 850, 800 ],
  valley: [900, 850, 800, 850, 900 ]
}

for (let prop in pricefeeds) {

  let feed = pricefeeds[prop]

  console.log(`===== ${prop} =====`)

  let bot = new TraderBot(feed[0])

  for (let i=0; i<feed.length; i++) {
    let price = feed[i]
    bot.decide(price)
    bot.print(price)
  }
  console.log(' ')
}
