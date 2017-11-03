const iterateRegex = require('regex-foreach')

class TextPart {
    constructor({
        name = "",
        sections = [],
        identifiers = [],
        config = {}
    } = {}) {
        this.name   = name
        this.rules  = {
            sections   : [],
            identifiers: []
        }
        this.config = Object.assign({
            lineLengthLimit: undefined
        }, config)

        this.loadSections(sections)
        this.loadIdentifiers(identifiers)
    }

    /**
     * Transform a file data string into an array of parts.
     * The top level array represents the lines.
     * The arrays, called parts, within each line represent parts within the line.
     *   Some parts are simple strings, others represent things such as highlights.
     * @param text
     * @param sectionsExpanded (default: false)
     * @returns {Array}
     */
    transform(text, sectionsExpanded = false) {
        let split = this._split(text)
        split     = this._transformSections(this.name || split[0][0], split, sectionsExpanded)
        split     = this._transformHighlights(split)
        return split
    }

    _split(data) {
        let lineNumber = 0
        return data.split('\n')
            .map(line => {
                if (this.config.lineLengthLimit) {
                    line = [this._limitLineLength(line, this.config.lineLengthLimit)]
                } else {
                    line = [line]
                }
                line.lineNumber = ++lineNumber
                return line
            })
    }

    _limitLineLength(data, limit) {
        return data.length > limit ? data.substring(0, limit) : data
    }

    clearRules() {
        this.rules.sections    = []
        this.rules.identifiers = []
    }

    loadSections(sections) {
        for (let i in sections) {
            if (!sections.hasOwnProperty(i)) continue
            let identifier = sections[i]
            this.addSectionIdentifier(identifier)
        }
    }

    loadIdentifiers(identifiers) {
        for (let level in identifiers) {
            if (!identifiers.hasOwnProperty(level)) continue
            for (let i in identifiers[level]) {
                if (!identifiers[level].hasOwnProperty(i)) continue
                let identifier = identifiers[level][i]
                if (typeof identifier.regex === 'object' && identifier.regex.length) { // regex exists and is an array
                    if (identifier.highlight === false) continue
                    for (let regexIndex = 0; regexIndex < identifier.regex.length; regexIndex++) {
                        this.addIdentifier(identifier.regex[regexIndex], level, identifier.description, identifier.link)
                    }
                } else if (identifier.regex) {
                    if (identifier.highlight === false) continue
                    this.addIdentifier(identifier.regex, level, identifier.description, identifier.link)
                } else { // Identifier is probably (and should be) a string
                    this.addIdentifier(identifier, level)
                }
            }
        }
    }

    /**
     * @param sectionIdentifier {string} (regex as string)
     */
    addSectionIdentifier(sectionIdentifier) {
        let regex    = sectionIdentifier.regex || sectionIdentifier
        let norepeat = sectionIdentifier.norepeat
        this.rules.sections.push(this._createSectionIdentifier(regex, norepeat))
    }

    /**
     * @param identifier {object} as created by .createIdentifier
     * @param level {string}
     * @param description {string}
     * @param link {string}
     */
    addIdentifier(identifier, level = 'general', description, link) {
        if (typeof identifier === 'string' || identifier.constructor === RegExp) {
            identifier = this._createIdentifier(identifier, level, description, link)
        }
        if (identifier.type !== 'identifier') {
            throw new Error(`Tried to add something which was not an identifier. (${identifier} (${typeof identifier}))`)
        }
        this.rules.identifiers.push(identifier)
    }

    _transformSections(title, split, sectionsExpanded) {
        let currentSection = this._createSection(title, null, sectionsExpanded)
        let sections       = [currentSection]
        // Loop through each line and load them into sections.
        // Create new sections on the go as section matches are found.
        split.forEach((parts) => {
            // Create a new section, if needed.
            this.rules.sections.forEach(sectionIdentifier => {
                for (let i in parts) {
                    if (!parts.hasOwnProperty(i)) continue
                    let part  = parts[i]
                    let match = null
                    if (match = sectionIdentifier.regex.exec(part)) {
                        if (sectionIdentifier.norepeat && match[0] === currentSection.match) continue // Skip
                        currentSection = this._createSection(part, match[0], sectionsExpanded)
                        sections.push(currentSection)
                        break
                    }
                }
            })
            // Add parts line to current section.
            currentSection.data.push(parts)
            currentSection.disabled = false
        })
        return sections
    }

    _transformHighlights(split) {
        const highestLevel = (data) => {
            let highestLevel = undefined
            data.forEach(parts =>
                parts.forEach(part => {
                    if (highestLevel === undefined && part.level === 'general')
                        highestLevel = 'general'
                    else if ((highestLevel === undefined || highestLevel === 'general') && part.level === 'important')
                        highestLevel = 'important'
                    else if ((highestLevel === undefined || highestLevel === 'general' || highestLevel === 'important') && part.level === 'critical')
                        highestLevel = 'critical'
                })
            )
            return highestLevel
        }

        const iterateIdentifiers = (parts) => {
            this.rules.identifiers.forEach(identifier => {
                parts = this._transformHighlight(parts, identifier)
            })
            return parts
        }

        return split.map(function (parts) {
            if (parts.type === 'section') {
                parts.data  = parts.data.map(iterateIdentifiers)
                parts.level = highestLevel(parts.data)
            } else {
                parts = iterateIdentifiers(parts)
            }
            return parts
        })
    }

    /**
     * Search collection of parts for highlights, insert highlights when found.
     * @param parts {Array|Object} An array of parts, or a section.
     * @param identifier {*}       The regex to match.
     * @returns {*}                A modification of parts.
     */
    _transformHighlight(parts, identifier) {
        let {
                regex,
                level,
                description,
                link
            } = identifier

        // create a flat array of parts of strings or highlighted strings.
        let newParts        = flatten(parts.map(part => {
            if (typeof part !== 'string') return part
            let result    = []
            let lastIndex = 0
            iterateRegex(regex, part, (value, index) => {
                result    = result.concat([
                    part.substring(lastIndex, index),
                    this._createHighlight(value, level, description, link)
                ])
                lastIndex = index + value.length
            })
            result.push(part.substring(lastIndex))
            return result
        }))
        newParts.lineNumber = parts.lineNumber // TODO: We have to be careful to not lose our line numbers.
        return newParts
    }

    _createHighlight(string, level = 'general', description, link) {
        return {
            type: 'highlight',
            level,
            data: string,
            description,
            link
        }
    }

    _createSection(title, match, sectionsExpanded = false) {
        return {
            type    : 'section',
            title   : title,
            match   : match,
            data    : [],
            visible : sectionsExpanded,
            disabled: true
        }
    }

    _createSectionIdentifier(regex, norepeat = false, level = 'general', description, link) {
        let identifier      = this._createIdentifier(regex, level, description, link)
        identifier.norepeat = norepeat
        return identifier
    }

    _createIdentifier(regex, level = 'general', description, link) {
        return {
            type : 'identifier',
            level: level,
            regex: createRegExp(regex),
            description,
            link,
        }
    }
}

module.exports = TextPart


// Utility functions
function flatten(array) {
    return [].concat.apply([], array)
}

function createRegExp(regex, regexSafe = false) {
    if (regex.constructor !== RegExp) {
        if (!regexSafe) {
            regex = regex.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")
        }
    }
    return new RegExp(regex, 'g')
}
