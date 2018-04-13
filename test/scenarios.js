import decide from './bot'
    
longPrice = 1000 // expected price in future

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
    this.lastAction = 'init'
    this.lastPurchase = 0 // amt of collateral purchased at last dip

  }

  print(price, tag) {
    console.log(`[${tag}] score ${this.score(price)} (${this.score(longPrice)}) | ${Math.round(this.dai)} dai | ${this.debt} debt | collateral ${this.collateral} is worth ${this.collateral*price}; ${this.getRatio(price)} ratio | ${this.lastAction} was our last move`)
  }

  score(price) {
    return Math.round( this.dai - this.debt + (this.collateral * price) )
  }

  getRatio(price) {
    return this.collateral * price / this.debt
  }

  draw(dai) {
    if (dai < 0){
        console.log("Incorrect draw amount!")
        return 
    }
    this.dai += dai
    this.debt += dai
    this.lastAction = 'draw'

  }

  // Increase ratio until hits target
  lock(price, delta) {
    if (delta < 0 || delta > this.dai){
        console.log("Incorrect lock amount!")
        return 
    }
    this.collateral += delta / price
    this.dai -= delta
    this.lastAction = 'lock'
    this.lastPurchase = delta / price
  }

  free(price, delta) {
    if (delta > this.collatoral) {
        console.log("Cannot free collatoral")
    }
    this.collateral -=delta 
    let val = delta * price
    this.dai += Math.min(0, this.debt - val)
    this.debt -= Math.max(0, this.debt - val)
    this.lastAction = 'free'
  }

  implement(decision, amt) {
    if (decision === 'sell') {
          this.draw(amt)
    } else {
          this.free(amt)
    }
  }
};

const pricefeeds = {
  saw: [800, 850, 800, 850, 800, 850, 800, 850, 800, 850, 800, 850, 800 ],
  mountain: [800, 850, 900, 850, 800, 850, 900, 850, 800, 850, 900, 850, 800 ],
  valley: [800, 750, 700, 750, 800, 750, 700, 750, 800, 750, 700, 750, 800 ],
  bull: [800, 750, 900, 950, 1000, 750, 900, 950, 1000, 750, 900, 950, 1000],
  bear: [800, 850, 700, 650, 600, 850, 700, 650, 600, 850, 700, 650, 600]
}

for (let prop in pricefeeds) {

  let feed = pricefeeds[prop]

  console.log(`===== ${prop} =====`)

  let bot = new TraderBot(feed[0])
  let bot2 = new TraderBot(feed[0])
  let bot3 = new TraderBot(feed[0])

  for (let i=0; i<feed.length; i++) {
    let price = feed[i]
    bot.implement(decide(price, [0]))

    bot2.decide2(price)
    bot3.decide3(price)
    bot.decide(price)

    bot.print(price, 'bot1')
    bot2.print(price, 'bot2')
    bot3.print(price, 'bot3')

  }

  console.log('')
}
