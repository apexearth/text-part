const expect   = require('chai').expect
const TextPart = require('./text-part')

describe('text-part', function () {

    it('good transformations', function () {
        let text = (
            'Welcome to file1!\n' +
            'section1\n' +
            'Hey there, identifier1.\n' +
            'This is what is happening.\n' +
            'section2\n' +
            'See ya, identifier2.\n' +
            'Wait, what?\n'
        )

        let tp = new TextPart({
            name       : 'file1',
            sections   : [
                'section1'
            ],
            identifiers: [
                'identifier1'
            ]
        })
        tp.addSectionIdentifier(/section2/)
        tp.addIdentifier(/identifier2/)

        let result = tp.transform(text)
        expect(result).to.deep.equal([
            {
                "lines": [["Welcome to file1!"]],
                "title": "file1",
                "type" : "section",
            },
            {
                "lines": [
                    ["section1"],
                    [
                        "Hey there, ",
                        {
                            "text": "identifier1",
                            "type": "identifier",
                        },
                        "."
                    ],
                    ["This is what is happening."],
                ],
                "title": "section1",
                "type" : "section",
            },
            {
                "lines": [
                    ["section2"],
                    [
                        "See ya, ",
                        {
                            "text": "identifier2",
                            "type": "identifier",
                        },
                        "."
                    ],
                    ["Wait, what?"],
                    [""],
                ],
                "title": "section2",
                "type" : "section",
            }
        ])

        tp.clearRules()
        result = tp.transform(text)
        expect(result).to.deep.equal([
            {
                "lines": [
                    ["Welcome to file1!"],
                    ["section1"],
                    ["Hey there, identifier1."],
                    ["This is what is happening."],
                    ["section2"],
                    ["See ya, identifier2."],
                    ["Wait, what?"],
                    [""],
                ],
                "title": "file1",
                "type" : "section",
            }
        ])

        tp = new TextPart({
            name       : 'file1',
            sections   : [
                'section1'
            ],
            identifiers: [
                {
                    regex: 'identifier1',
                }
            ]
        })
        tp.addSectionIdentifier(/section2/)
        tp.addIdentifier(/identifier2/)

        result = tp.transform(text)
        expect(result).to.deep.equal([
            {
                "lines": [["Welcome to file1!"]],
                "title": "file1",
                "type" : "section",
            },
            {
                "lines": [
                    ["section1"],
                    [
                        "Hey there, ",
                        {
                            "text": "identifier1",
                            "type": "identifier",
                        },
                        "."
                    ],
                    ["This is what is happening."],
                ],
                "title": "section1",
                "type" : "section",
            },
            {
                "lines": [
                    ["section2"],
                    [
                        "See ya, ",
                        {
                            "text": "identifier2",
                            "type": "identifier",
                        },
                        "."
                    ],
                    ["Wait, what?"],
                    [""],
                ],
                "title": "section2",
                "type" : "section",
            }
        ])

        tp = new TextPart({
            name       : 'file1',
            sections   : [
                'section1',
            ],
            identifiers: [
                {
                    regex: [
                        /identifier2/
                    ],
                },
                {
                    regex: [
                        'identifier1',
                    ],
                }
            ]
        })

        result = tp.transform(text)
        expect(result).to.deep.equal([
            {
                "lines": [["Welcome to file1!"]],
                "title": "file1",
                "type" : "section",
            },
            {
                "lines": [
                    ["section1"],
                    [
                        "Hey there, ",
                        {
                            "text": "identifier1",
                            "type": "identifier",
                        },
                        "."
                    ],
                    ["This is what is happening."],
                    ["section2"],
                    ["See ya, ",
                        {
                            "text": "identifier2",
                            "type": "identifier",
                        },
                        "."
                    ],
                    ["Wait, what?"],
                    [""],
                ],
                "title": "section1",
                "type" : "section",
            }
        ])

        tp.clearRules()
        result = tp.transform(text)
        expect(result).to.deep.equal([
            {
                "lines": [
                    ["Welcome to file1!"],
                    ["section1"],
                    ["Hey there, identifier1."],
                    ["This is what is happening."],
                    ["section2"],
                    ["See ya, identifier2."],
                    ["Wait, what?"],
                    [""],
                ],
                "title": "file1",
                "type" : "section",
            }
        ])

        tp.addSectionIdentifier('section2')
        result = tp.transform(text)
        expect(result).to.deep.equal([
            {
                "lines": [
                    ["Welcome to file1!"],
                    ["section1"],
                    ["Hey there, identifier1."],
                    ["This is what is happening."],
                ],
                "title": "file1",
                "type" : "section",
            },
            {
                "lines": [
                    ["section2"],
                    ["See ya, identifier2."],
                    ["Wait, what?"],
                    [""],
                ],
                "title": "section2",
                "type" : "section",
            }
        ])
    })

    it('bad usages', function () {
        let tp = new TextPart()
        expect(() => {
            tp.addIdentifier({waka: 'waka waka!'})
        }).to.throw()
        expect(() => {
            tp.addSectionIdentifier({waka: 'waka waka!'})
        }).to.throw()
    })
})