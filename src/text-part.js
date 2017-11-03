const iterateRegex = require('regex-foreach')

class TextPart {
    /**
     *
     * @param name - The name to describe all text types which are processed by the TextPart instance.
     * @param sections - An array of section identifiers. (RegExp/string)
     * @param identifiers - An array of identifiers. (RegExp/string)
     * @param config - Configuration options to define how TextPart transforms.
     */
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
     *   Some parts are simple strings, others represent things such as identifiers.
     * @param text - The text to transform into parts.
     * @returns {Array}
     */
    transform(text) {
        let split = this._split(text)
        split     = this._transformSections(this.name || split[0][0], split)
        split     = this._transformIdentifiers(split)
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
        for (let i in identifiers) {
            if (!identifiers.hasOwnProperty(i)) continue
            let identifier = identifiers[i]
            if (typeof identifier.regex === 'object' && identifier.regex.length) { // regex exists and is an array
                for (let regexIndex = 0; regexIndex < identifier.regex.length; regexIndex++) {
                    this.addIdentifier(identifier.regex[regexIndex], identifier.data)
                }
            } else if (identifier.regex) {
                this.addIdentifier(identifier.regex, identifier.data)
            } else { // Identifier is probably (and should be) a string
                this.addIdentifier(identifier, {})
            }
        }
    }

    /**
     * Add a section identifier. This is regex which will split the text blob when found.
     * @param identifier
     * @param data
     */
    addSectionIdentifier(identifier, data = {}) {
        this.rules.sections.push(this._createSectionIdentifier(identifier, data))
    }

    /**
     * @param identifier {object} as created by .createIdentifier
     * @param data
     */
    addIdentifier(identifier, data = {}) {
        if (typeof identifier === 'string' || identifier.constructor === RegExp) {
            identifier = this._createIdentifier(identifier, data)
        }
        if (identifier.type !== 'identifier') {
            throw new Error(`Tried to add something which was not an identifier. (${identifier} (${typeof identifier}))`)
        }
        this.rules.identifiers.push(identifier)
    }

    /**
     * Transform an array of lines into an array of sections.
     * @param title - Start off with a section of this name.
     * @param lines - The lines to transform into sections.
     * @returns {Array} - An array containing the sections.
     * @private
     */
    _transformSections(title, lines) {
        let currentSection = this._createTransformedSection(title, [], {})
        let sections       = [currentSection]
        // Loop through each line and load them into sections.
        // Create new sections on the go as section matches are found.
        lines.forEach((parts) => {
            // Create a new section, if needed.
            this.rules.sections.forEach(sectionIdentifier => {
                for (let i in parts) {
                    if (!parts.hasOwnProperty(i)) continue
                    let part  = parts[i]
                    let match = null
                    if (match = sectionIdentifier.regex.exec(part)) {
                        if (sectionIdentifier.norepeat && match[0] === currentSection.match) continue // Skip
                        currentSection = this._createTransformedSection(part, [], sectionIdentifier.data)
                        sections.push(currentSection)
                        break
                    }
                }
            })
            // Add parts line to current section.
            currentSection.lines.push(parts)
        })
        return sections
    }

    _transformIdentifiers(split) {
        const iterateIdentifiers = (parts) => {
            this.rules.identifiers.forEach(identifier => {
                parts = this._transformIdentifier(parts, identifier)
            })
            return parts
        }

        return split.map(function (parts) {
            if (parts.type === 'section') {
                parts.lines = parts.lines.map(iterateIdentifiers)
            } else {
                parts = iterateIdentifiers(parts)
            }
            return parts
        })
    }

    /**
     * Search collection of parts for identifiers, insert identifiers when found.
     * @param parts {Array|Object} An array of parts, or a section.
     * @param identifier {*}       The regex to match.
     * @returns {*}                A modification of parts.
     */
    _transformIdentifier(parts, identifier) {
        let {
                regex,
                data,
            } = identifier

        // create a flat array of parts of strings or identifier strings.
        let newParts        = flatten(parts.map(part => {
            if (typeof part !== 'string') return part
            let result    = []
            let lastIndex = 0
            iterateRegex(regex, part, (value, index) => {
                result    = result.concat([
                    part.substring(lastIndex, index),
                    this._createTransformedIdentifier(value, data)
                ])
                lastIndex = index + value.length
            })
            result.push(part.substring(lastIndex))
            return result
        }))
        newParts.lineNumber = parts.lineNumber // TODO: We have to be careful to not lose our line numbers.
        return newParts
    }

    _createTransformedIdentifier(text, data) {
        return Object.assign({
            type: 'identifier',
            text,
        }, data)
    }

    _createTransformedSection(title, lines, data) {
        return Object.assign({
            type : 'section',
            title: title,
            lines: lines,
        }, data)
    }

    _createSectionIdentifier(regex, data = {}) {
        if (typeof data !== "object") throw new Error(`Invalid type for \`data\` (${typeof data}).`)
        return this._createIdentifier(regex, data)
    }

    _createIdentifier(regex, data) {
        if (typeof data !== "object") throw new Error(`Invalid type for \`data\` (${typeof data}).`)
        return {
            type : 'identifier',
            regex: createRegExp(regex),
            data,
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
