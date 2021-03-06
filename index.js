/* Usage:
   random = Random(SEED) // seed is an integer or string
   random() // float 0-1
   random.int(N) // int [0,N-1]
   random.int() // int [0,2147483646]
   random.choice(array) // random element from array
   random.shuffle(array) // Returns shuffled array (mutates array)
   random.reset() // returns PRNG to begining
*/

// PRNG algorithm borrowed from https://gist.github.com/blixt/f17b47c62508be59987b

const Random = seed => {
  // https://stackoverflow.com/a/7616484
  if (typeof seed === 'string') {
    // convert string to integer
    let res = 0
    const len = seed.length
    for (let i = 0; i < len; i++) {
      res = res * 31 + seed.charCodeAt(i)
      res = res & res
    }
    seed = res
  } else if (isNaN(seed)) {
    // seed was neither string or number... pick a truely random seed
    seed = Math.floor(Math.random() * 2147483647)
  }

  let _current
  let n_seed
  const random = () => (random.raw() - 1) / 2147483646 // 0-1

  Object.assign(random, {
    seed: seed,
    int: (min = 2147483647, max) => {
      // min-max or 0-min if no max
      if (max === undefined) {
        max = min
        min = 0
      }
      return Math.floor(random() * (max - min) + min)
    },
    raw: () => (_current = (_current * 16807) % 2147483647), // 0-2147483646
    getNextSeed: () => (n_seed = (n_seed * 16807) % 2147483647), // 0-2147483646
    choice: array => array[random.int(array.length)],
    reset: () => {
      _current = seed % 2147483647
      if (_current <= 0) _current += 2147483646
      // for SEED < 10,000 the first number is always ~ 0.01, so let's burn that one
      // might as well use it to randomize where child seeds come from
      n_seed = Math.floor(1e6 / random())
    },
    setSeed: number => {
      seed = number
      random.reset()
    },
    _getCurrent: () => _current,
    shuffle: array => {
      let i = array.length,
        temp,
        i_rand
      // While there remain elements to shuffle...
      while (0 !== i) {
        // Pick a remaining element...
        i_rand = Math.floor(random() * i)
        i -= 1
        // And swap it with the current element.
        temp = array[i]
        array[i] = array[i_rand]
        array[i_rand] = temp
      }
      return array
    },
  })
  random.reset()

  return random
}

Random.Mixin = (superclass = Object) =>
  class extends superclass {
    // creates a method this.random which is a PRNG based on opts._SEED or opts.parent.random
    constructor(opts = {}) {
      super(opts)
      if (opts._prng) {
        // derive seed from a parent PRNG
        this._SEED = opts._prng.random.getNextSeed()
      } else if (opts._SEED) {
        this._SEED = opts._SEED
      }

      this.setPRNG(this._SEED)
    }
    setPRNG(_SEED) {
      this.random = Random(_SEED)
      this._SEED = this.random.seed // in event there was no seed
    }
  }

// This takes a different approach, where the seed is stored on an obj
const fp = (Random.fp = {
  raw: obj => (obj._PRNG = (obj._PRNG * 16807) % 2147483647), // 0-2147483646

  random: obj => (fp.raw(obj) - 1) / 2147483646, // 0-1
  int: (obj, min = 2147483647, max) => {
    // min-max or 0-min if no max
    if (max === undefined) {
      max = min
      min = 0
    }
    return Math.floor(fp.random(obj) * (max - min) + min)
  },

  choice: (obj, array) => array[fp.int(obj, array.length)],

  shuffle: (obj, array) => {
    let i = array.length,
      temp,
      i_rand
    // While there remain elements to shuffle...
    while (0 !== i) {
      // Pick a remaining element...
      i_rand = Math.floor(fp.random(obj) * i)
      i -= 1
      // And swap it with the current element.
      temp = array[i]
      array[i] = array[i_rand]
      array[i_rand] = temp
    }
    return array
  },
})

export default Random
