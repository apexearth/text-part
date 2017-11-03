## Classes

<dl>
<dt><a href="#TextPart">TextPart</a></dt>
<dd></dd>
</dl>

## Functions

<dl>
<dt><a href="#flatten">flatten(array)</a> ⇒ <code>Array</code></dt>
<dd><p>Flatten an array.</p>
</dd>
<dt><a href="#createRegExp">createRegExp(regex, regexSafe)</a> ⇒ <code>RegExp</code></dt>
<dd><p>Create a RegExp object from a string or RegExp object.</p>
</dd>
</dl>

<a name="TextPart"></a>

## TextPart
**Kind**: global class  

* [TextPart](#TextPart)
    * [new TextPart(name, sections, identifiers, config)](#new_TextPart_new)
    * [.transform(text)](#TextPart+transform) ⇒ <code>Array</code>
    * [.clearRules()](#TextPart+clearRules)
    * [.loadSections(sections)](#TextPart+loadSections)
    * [.loadIdentifiers(identifiers)](#TextPart+loadIdentifiers)
    * [.addSectionIdentifier(identifier, data, config)](#TextPart+addSectionIdentifier)
    * [.addIdentifier(identifier, data, config)](#TextPart+addIdentifier)

<a name="new_TextPart_new"></a>

### new TextPart(name, sections, identifiers, config)

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The name to describe all text types which are processed by the TextPart instance. |
| sections | <code>Array.&lt;(string\|object)&gt;</code> | An array of section identifiers. (RegExp/string) |
| identifiers | <code>Array.&lt;(string\|object)&gt;</code> | An array of identifiers. (RegExp/string) |
| config | <code>object</code> | Configuration options to define how TextPart transforms. |

<a name="TextPart+transform"></a>

### textPart.transform(text) ⇒ <code>Array</code>
Transform a file data string into an array of parts.
The top level array represents the lines.
The arrays, called parts, within each line represent parts within the line.
  Some parts are simple strings, others represent things such as identifiers.

**Kind**: instance method of [<code>TextPart</code>](#TextPart)  

| Param | Description |
| --- | --- |
| text | The text to transform into parts. |

<a name="TextPart+clearRules"></a>

### textPart.clearRules()
Clear all added identifiers.

**Kind**: instance method of [<code>TextPart</code>](#TextPart)  
<a name="TextPart+loadSections"></a>

### textPart.loadSections(sections)
Load an array of section identifiers.

**Kind**: instance method of [<code>TextPart</code>](#TextPart)  

| Param | Type | Description |
| --- | --- | --- |
| sections | <code>Array.&lt;(RegExp\|string)&gt;</code> | An array of strings or RegExp to use as identifiers. |

<a name="TextPart+loadIdentifiers"></a>

### textPart.loadIdentifiers(identifiers)
Load an array of identifiers.

**Kind**: instance method of [<code>TextPart</code>](#TextPart)  

| Param | Type | Description |
| --- | --- | --- |
| identifiers | <code>Array.&lt;(string\|object)&gt;</code> | An array of objects or strings to be loaded as identifiers. [    'identifier1',    { regex: 'identifier2', data: {} },    { regex: ['identifier3','identifier4'], data: {} } ] |

<a name="TextPart+addSectionIdentifier"></a>

### textPart.addSectionIdentifier(identifier, data, config)
Add a section identifier. This is regex which will split the text blob when found.

**Kind**: instance method of [<code>TextPart</code>](#TextPart)  

| Param | Type | Description |
| --- | --- | --- |
| identifier | <code>RegExp</code> \| <code>String</code> | The RegExp to use for identification. |
| data | <code>object</code> | Data to associate with the identifier and anything the identifier creates. |
| config | <code>object</code> | The config options to use. |

<a name="TextPart+addIdentifier"></a>

### textPart.addIdentifier(identifier, data, config)
**Kind**: instance method of [<code>TextPart</code>](#TextPart)  

| Param | Type | Description |
| --- | --- | --- |
| identifier | <code>RegExp</code> \| <code>String</code> | The RegExp to use for identification. |
| data | <code>object</code> | Data to associate with the identifier and anything the identifier creates. |
| config | <code>object</code> | The config options to use. |

<a name="flatten"></a>

## flatten(array) ⇒ <code>Array</code>
Flatten an array.

**Kind**: global function  

| Param | Type |
| --- | --- |
| array | <code>Array.&lt;Array&gt;</code> | 

<a name="createRegExp"></a>

## createRegExp(regex, regexSafe) ⇒ <code>RegExp</code>
Create a RegExp object from a string or RegExp object.

**Kind**: global function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| regex | <code>object</code> \| <code>RegExp</code> |  | The regex to create a RegExp from. |
| regexSafe |  | <code>false</code> | Do we need to escape certain characters in `regex`? |

