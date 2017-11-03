const iterateRegex = require('regex-foreach')

class TextPart {
    /**
     *
     * @param name {string} - The name to describe all text types which are processed by the TextPart instance.
     * @param sections {Array.<string|object>} - An array of section identifiers. (RegExp/string)
     * @param identifiers {Array.<string|object>} - An array of identifiers. (RegExp/string)
     * @param config {object} - Configuration options to define how TextPart transforms.
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
            sections       : true,
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
        if (this.config.sections) {
            split = this._transformSections(this.name || split[0][0], split)
        }
        split = this._transformIdentifiers(split)
        return split
    }

    /**
     * Split text into an array of line parts. [['Line One'],['Line Two']]
     * Each element in the array has a .lineNumber
     * @param text - The text to split into the array.
     * @returns {Array}
     * @private
     */
    _split(text) {
        let lineNumber = 0
        return text.split('\n')
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

    /**
     * Return a string based on the given string no greater than the limit in length.
     * @param text {string} - The text to limit.
     * @param limit {number} - The limit.
     * @returns {string}
     * @private
     */
    _limitLineLength(text, limit) {
        return text.length > limit ? text.substring(0, limit) : text
    }

    /**
     * Clear all added identifiers.
     */
    clearRules() {
        this.rules.sections    = []
        this.rules.identifiers = []
    }

    /**
     * Load an array of section identifiers.
     * @param sections {Array.<RegExp|string>} - An array of strings or RegExp to use as identifiers.
     */
    loadSections(sections) {
        for (let i in sections) {
            if (!sections.hasOwnProperty(i)) continue
            let identifier = sections[i]
            this.addSectionIdentifier(identifier)
        }
    }

    /**
     * Load an array of identifiers.
     * @param identifiers {Array.<string|object>} - An array of objects or strings to be loaded as identifiers.
     * [
     *    'identifier1',
     *    { regex: 'identifier2', data: {} },
     *    { regex: ['identifier3','identifier4'], data: {} }
     * ]
     */
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
     * @param identifier {RegExp|String} - The RegExp to use for identification.
     * @param data {object} - Data to associate with the identifier and anything the identifier creates.
     * @param config {object} - The config options to use.
     */
    addSectionIdentifier(identifier, data = {}, config) {
        this.rules.sections.push(this._createSectionIdentifier(identifier, data, config))
    }

    /**
     * @param identifier {RegExp|String} - The RegExp to use for identification.
     * @param data {object} - Data to associate with the identifier and anything the identifier creates.
     * @param config {object} - The config options to use.
     */
    addIdentifier(identifier, data = {}, config) {
        if (typeof identifier === 'string' || identifier.constructor === RegExp) {
            identifier = this._createIdentifier(identifier, data, config)
        }
        if (identifier.type !== 'identifier') {
            throw new Error(`Tried to add something which was not an identifier. (${identifier} (${typeof identifier}))`)
        }
        this.rules.identifiers.push(identifier)
    }

    /**
     * Transform an array of split into an array of sections.
     * @param title - Start off with a section of this name.
     * @param split - The result of a call to _split().
     * @returns {Array} - An array containing the sections.
     * @private
     */
    _transformSections(title, split) {
        let currentSection = this._createTransformedSection(title)
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
                        if (sectionIdentifier.config.norepeat && part === currentSection.title) continue // Skip
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

    /**
     * Process a split, transforming it based on identifiers.
     * @param split - The result of a call to _split().
     * @returns {Array|*}
     * @private
     */
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
     * @param parts {Array|Object} - An array of parts, or a section.
     * @param identifier {*} - The regex to match.
     * @returns {Array|*} - A modification of parts.
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

    /**
     * Create a transformed section. (end result)
     * @param title - The title of the section.
     * @param lines - An array of lines to start the section off with.
     * @param data - Data related to the section.
     * @returns {{type,title,lines,data}|*}
     * @private
     */
    _createTransformedSection(title, lines = [], data = {}) {
        if (typeof title !== 'string') throw new Error(`Invalid type for \`title\` (${typeof title}).`)
        if (!Array.isArray(lines)) throw new Error(`Invalid type for \`lines\` (${typeof lines}).`)
        if (data && typeof data !== "object") throw new Error(`Invalid type for \`data\` (${typeof data}).`)
        return Object.assign({
            type: 'section',
            title,
            lines,
        }, data)
    }

    /**
     * Create a transformed identifier.
     * This is the result of a regex match on a line.
     * @param text - The text of the matched identifier.
     * @param data - Data related to the identifier.
     * @returns {{type,text,data}|*}
     * @private
     */
    _createTransformedIdentifier(text, data) {
        return Object.assign({
            type: 'identifier',
            text,
        }, data)
    }

    /**
     * Create a section identifier.
     * A section identifier is used to identify when sections should be created.
     * @param regex - The RegExp to use in identification.
     * @param data - The data to associate with the identifier.
     * @param config - The config options to use.
     * @returns {{type, regex, data, config}|*}
     * @private
     */
    _createSectionIdentifier(regex, data = {}, config = {norepeat: false}) {
        if (typeof data !== "object") throw new Error(`Invalid type for \`data\` (${typeof data}).`)
        return this._createIdentifier(regex, data, config)
    }

    /**
     * Create an identifier which can have data associated with it.
     * @param regex - The RegExp to use in identification.
     * @param data - The data to associate with the identifier.
     * @param config - The config options to use.
     * @returns {{type: string, regex, data: {}, config: *}}
     * @private
     */
    _createIdentifier(regex, data = {}, config) {
        if (typeof data !== "object") throw new Error(`Invalid type for \`data\` (${typeof data}).`)
        return {
            type : 'identifier',
            regex: createRegExp(regex),
            data,
            config,
        }
    }
}

module.exports = TextPart


// Utility functions
/**
 * Flatten an array.
 * @param array {Array.<Array>}
 * @returns {Array}
 */
function flatten(array) {
    return [].concat.apply([], array)
}

/**
 * Create a RegExp object from a string or RegExp object.
 * @param regex {object|RegExp} - The regex to create a RegExp from.
 * @param regexSafe - Do we need to escape certain characters in `regex`?
 * @returns {RegExp}
 */
function createRegExp(regex, regexSafe = false) {
    if (regex.constructor !== RegExp) {
        if (!regexSafe) {
            regex = regex.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")
        }
    }
    return new RegExp(regex, 'g')
}
