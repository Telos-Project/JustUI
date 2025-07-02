# JustUI

## 1 - Abstract

***Just U & I***

JustUI is an ultra lightweight UI framework which provides a direct JSON based DOM interface and a
declarative component system.

## 2 - Contents

### 2.1 - DOM JSON

DOM JSON is a JSON object format for representing HTML elements.

A DOM JSON object may have the field "tag", specifying the tag name of the element. If this field
is absent, the tag name of the element shall default to "div".

A DOM JSON object may have the field "attributes", containing an object where each field contains a
string, the alias and value of each field specifying the name and value of an attribute of the
element respectively.

A DOM JSON object may have the field "style", similar in form to the attributes field, but for CSS
styles instead of attributes.

A DOM JSON object may have the field "content", containing a string, another DOM JSON object, or an
array of such values, with strings representing text children of the element and DOM JSON objects
representing element children of the element.

A DOM JSON object may have the field "fields", where each field may contain a miscellaneous value,
with the aliases and values of such fields becoming object property aliases and values of the
element object in the DOM. As such, in JS code, such field values may be data types not
serializable in JSON, such as functions.

#### 2.1 - Example

Here is an example of a DOM JSON object:

    {
    	attributes: { id: "my-element" },
    	style: { background: "red" },
    	content: [
    		{ tag: "h1", content: "Hello!" },
    		{
    			tag: "button",
    			content: "Click me!",
    			fields: { onclick: () => alert("CLICKED!"); }
    		}
    	]
    }

### 2.2 - Script

JustUI is implemented as a JS script, which may be loaded via CDN from the following link:

    https://cdn.jsdelivr.net/gh/Telos-Project/JustUI/Code/JustUI.js

When included, it establishes a "JustUI" object in the global namespace. The functions for the DOM
interface and the component system are located in the "JustUI.core" object.

### 2.3 - DOM Interface

#### 2.3.1 - Elements

##### 2.3.1.1 - Create

The JustUI.core.create function takes a DOM JSON object, and returns a DOM element object matching
the specified properties.

##### 2.3.1.2 - Get

The JustUI.core.get function takes a CSS selector as a string, and returns an array of every
matching element on the page.

##### 2.3.1.3 - Remove

The JustUI.core.remove function takes a CSS selector as a string, and removes every matching
element on the page.

It may also take a DOM element object instead, which will result in said element's removal from the
page.

##### 2.3.1.4 - Set

The JustUI.core.set function takes a DOM element object as its first argument, and a DOM JSON
object as its second, and applies the properties specified in the latter to the former.

##### 2.3.1.5 - Extend

The JustUI.core.extend function takes a DOM element object as its first argument, and either a DOM
element object or a DOM JSON object as its second, and shall append the latter to the former.

Alternatively, it may only take the second argument, in which case the element shall be appended to
the root element.

#### 2.3.2 - Conversion

##### 2.3.2.1 - To HTML

The JustUI.core.toHTML function takes a DOM JSON object and returns an equivalent HTML string.

##### 2.3.2.2 - To Element

The JustUI.core.toElement function takes an HTML string and returns an equivalent DOM JSON object.

#### 2.3.3 - Load

The JustUI.core.load function takes an indefinite number of script and stylesheet links, and
dynamically loads them into the page.

### 2.4 - Component System

The JustUI component system operates using a DOM JSON component object, which is a JSON object for
which the key of each field is a CSS selector, and the value of each field is a DOM JSON object.
When the component system is active, the properties specified in the DOM JSON objects in the
component object shall be applied to every element on the page matching the corresponding selector.

The component system also features a script engine, which, for every DOM element object with an
"onStart" function, will execute said function once on initialization, and for every DOM element
object with an "onUpdate" function, will execute said function at regular intervals (60 times a
second by default). Each of said functions shall have a reference to the elements to which they are
attached passed to them as an argument.

The component object used by JustUI is "JustUI.core.components".

The JustUI component system may be started by calling the JustUI.core.startComponentEngine
function, and may be stopped by calling the JustUI.core.stopComponentEngine function.