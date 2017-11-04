const TextPart = require('../src')

const tp = new TextPart({
    name       : 'Example',
    sections   : [
        {
            regex: 'Five',
            data : {message: 'Hey there...'}
        }
    ],
    identifiers: [
        {
            regex: [/in/, /ve/, 'Two'],
            data : {french: 'fries'}
        }
    ],
})

tp.addSectionIdentifier('Five', {message: 'Hey there!'})
tp.addIdentifier(/in/, {ham: 'burger'})

let result = tp.transform(
    'One\n' +
    'Two\n' +
    'Three\n' +
    'Four\n' +
    'Five\n' +
    'Six\n' +
    'Seven\n' +
    'Eight\n' +
    'Nine\n' +
    'Ten\n'
)

console.log(JSON.stringify(result, null, 2))
/*
[
  {
    "type": "section",
    "title": "Example",
    "lines": [
      [
        "One"
      ],
      [
        "Two"
      ],
      [
        "Three"
      ],
      [
        "Four"
      ]
    ]
  },
  {
    "type": "section",
    "title": "Five",
    "lines": [],
    "message": "Hey there..."
  },
  {
    "type": "section",
    "title": "Five",
    "lines": [
      [
        "Fi",
        {
          "type": "identifier",
          "text": "ve",
          "french": "fries"
        },
        ""
      ],
      [
        "Six"
      ],
      [
        "Se",
        {
          "type": "identifier",
          "text": "ve",
          "french": "fries"
        },
        "n"
      ],
      [
        "Eight"
      ],
      [
        "N",
        {
          "type": "identifier",
          "text": "in",
          "french": "fries"
        },
        "e"
      ],
      [
        "Ten"
      ],
      [
        ""
      ]
    ],
    "message": "Hey there!"
  }
]
 */