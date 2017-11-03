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
        let text2 = (
            'Welcome to file1!\n' +
            'section\n' +
            'Hey there, identifier1.\n' +
            'This is what is happening.\n' +
            'section\n' +
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
            identifiers: [
                {
                    regex: 'identifier1',
                }
            ]
        })
        tp.addSectionIdentifier(/section/, {}, {norepeat: true})
        tp.addIdentifier(/identifier2/)

        result = tp.transform(text2)
        expect(result).to.deep.equal([
            {
                "lines": [["Welcome to file1!"]],
                "title": "file1",
                "type" : "section",
            },
            {
                "lines": [
                    ["section"],
                    [
                        "Hey there, ",
                        {
                            "text": "identifier1",
                            "type": "identifier",
                        },
                        "."
                    ],
                    ["This is what is happening."],
                    ["section"],
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
                "title": "section",
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

    describe('config options', () => {
        it('lineLengthLimit', () => {
            let tp       = new TextPart({
                config: {
                    lineLengthLimit: 5
                }
            })
            let sections = tp.transform(
                "1234567890\n" +
                "1234"
            )
            let section  = sections[0]

            expect(section.lines[0][0]).to.equal('12345')
            expect(section.lines[1][0]).to.equal('1234')
        })
        it('sections', () => {
            let tp    = new TextPart({
                config: {
                    sections: false
                }
            })
            let lines = tp.transform(
                "1234567890\n" +
                "1234"
            )

            expect(lines[0][0]).to.equal('1234567890')
            expect(lines[1][0]).to.equal('1234')
        })

    })

    describe('functions', function () {
        let tp = new TextPart()
        it('.addIdentifier()', () => {
            expect(() => {
                tp.addIdentifier({waka: 'waka waka!'})
            }).to.throw()
        })
        it('.addSectionIdentifier()', () => {
            expect(() => {
                tp.addSectionIdentifier({waka: 'waka waka!'})
            }).to.throw()
        })
        it('._createIdentifier()', () => {
            tp._createIdentifier('regex')
            expect(() => {
                tp._createIdentifier('regex', 'not an object')
            }).to.throw()
        })
        it('._createSectionIdentifier()', () => {
            tp._createSectionIdentifier('regex')
            expect(() => {
                tp._createSectionIdentifier('regex', 'not an object')
            }).to.throw()
        })
    })
})