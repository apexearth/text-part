const expect   = require('chai').expect
const TextPart = require('./text-part')

describe('text-part', function () {

    it('.transform()', function () {
        let text = (
            'Welcome to file1!\n' +
            'section1\n' +
            'Hey there, highlight1.\n' +
            'This is what is happening.\n' +
            'section2\n' +
            'See ya, highlight2.\n' +
            'Wait, what?\n'
        )

        let tp = new TextPart({
            name       : 'file1',
            sections   : [
                'section1'
            ],
            identifiers: {
                critical: [
                    'highlight1'
                ]
            }
        })
        tp.addSectionIdentifier(/section2/)
        tp.addIdentifier(/highlight2/)

        let result = tp.transform(text)
        expect(result).to.deep.equal([
            {
                "data"    : [["Welcome to file1!"]],
                "title"   : "file1",
                "type"    : "section",
                "visible" : false,
                "match"   : null,
                "disabled": false,
                "level"   : undefined,
            },
            {
                "data"    : [
                    ["section1"],
                    [
                        "Hey there, ",
                        {
                            "data"       : "highlight1",
                            "level"      : "critical",
                            "type"       : "highlight",
                            "link"       : undefined,
                            "description": undefined
                        },
                        "."
                    ],
                    ["This is what is happening."],
                ],
                "title"   : "section1",
                "type"    : "section",
                "visible" : false,
                "match"   : "section1",
                "disabled": false,
                "level"   : "critical",
            },
            {
                "data"    : [
                    ["section2"],
                    [
                        "See ya, ",
                        {
                            "data"       : "highlight2",
                            "level"      : "general",
                            "type"       : "highlight",
                            "link"       : undefined,
                            "description": undefined
                        },
                        "."
                    ],
                    ["Wait, what?"],
                    [""],
                ],
                "title"   : "section2",
                "type"    : "section",
                "match"   : "section2",
                "visible" : false,
                "disabled": false,
                "level"   : "general",
            }
        ])

        tp.clearRules()
        result = tp.transform(text)
        expect(result).to.deep.equal([
            {
                "data"    : [
                    ["Welcome to file1!"],
                    ["section1"],
                    ["Hey there, highlight1."],
                    ["This is what is happening."],
                    ["section2"],
                    ["See ya, highlight2."],
                    ["Wait, what?"],
                    [""],
                ],
                "disabled": false,
                "level"   : undefined,
                "match"   : null,
                "title"   : "file1",
                "type"    : "section",
                "visible" : false,
            }
        ])

        tp.addSectionIdentifier('section2')
        result = tp.transform(text)
        expect(result).to.deep.equal([
            {
                "data"    : [
                    ["Welcome to file1!"],
                    ["section1"],
                    ["Hey there, highlight1."],
                    ["This is what is happening."],
                ],
                "disabled": false,
                "level"   : undefined,
                "match"   : null,
                "title"   : "file1",
                "type"    : "section",
                "visible" : false,
            },
            {
                "data"    : [
                    ["section2"],
                    ["See ya, highlight2."],
                    ["Wait, what?"],
                    [""],
                ],
                "disabled": false,
                "level"   : undefined,
                "match"   : "section2",
                "title"   : "section2",
                "type"    : "section",
                "visible" : false,
            }
        ])
    })
})