# `ur-random`

This is a pseudo random number generator (PRNG) with a second stream of randomness for avoiding "the butterfly effect". Checkout the gh-page for more details:

https://chriscauley.github.io/ur-random/

# Installation

`npm install ur-random`

# Usage

``` javascript
import Random from 'ur-random'

const random = Random(1234)
random() // returns a float between 0 and 1, just like Math.random()
```

* `random()` - A float [0,0.999...]

* `random.int()` - An int [0,2147483646]

* `random.int(10)` - I'm thinking of a number between 0 and 9

* `random.int(1,11)` - I'm thinking of a number between 1 and 10

* `random.choice(["heads","tails"])` - Flip a coin!

* `random.shuffle(range(5))` - Shuffled array, [0-4]

* `random.reset()` - Reset the PRNG

* `random()` - Same float as the first row