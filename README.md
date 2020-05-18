# GraphDocs GraphQL Documentation

## Basics

---

To Make or Edit Documentation:

- set endpoint and authorization headers in /src/custom/authorization.js
- write up to four .md files in /public/content (one main + 3 others) that will be used to your documentation
- set mainPage and otherPages in /src/custom/pages.js

To Test:

- npm start

To Build:

- npm build

---

## Writing Documentation

---

Documentation is generated from markdown files in /public. To write documenation, simply write it as you would a simple markdown file. You can use headers to break up your documentation. '#' Will create the largest posible header, '##' and '###' will create smaller headers, and anything smaller will create the smallest type of header and push themselves and anything underneeth them into the right column. A sidebar will be automaticaly generated, using the largest headers ('#') as as the main links in the sidebar and the next two smallest headers ('##' and '###') as subheaders.

### Formatting Tags

If you want to format the documentation yourself, you can use the following formatting tags to customize your documentation a bit. Please note that using any of these tags will override any automatic formating of your documentation.

#### Sidebar Tags

These tags can be used only to create/within the a sidebar

- `<Sidebar></Sidebar>` : specifies that the stuff between these tags should be used to render the sidebar.
- `<Header></Header>` : specifies that the stuff between these tags should be used as a header in the sidebar.
- `<Subheader></Subheader>` : specifies that the stuff between these tags should be used as a subheader in the sidebar.
- `<Logo></Logo>` : renders an instance of your logo with a link pointing to whatever url is given between the tags.

note: most of the time, headers and subheaders will contain links (eg. [something](#heading-name) ), that will point to the id a heading (given by `##` or `<h1>` etc.) in the rest of the documentation. All headers are automaticaly asigned ids that are the same as their names but with all lower case letters and special characters (space,!,. etc.) replaced with -. (Eg '##My Introduction' would have an id 'my-introduction' and could be linked to with a header `<Header>`[Intro](#my-introduction).)

#### Body Tags

These tags can be used only to create/within the body of the documentation

- `<Body></Body>` : specifies that the stuff between these tags will constitute the body of the documentation.
- `<Full></Full>` : specifies that whatever is in-between these two tags will render such that it will take up the full width of the body
- `<Left></Left>` & `<Right></Right>` : These tags must be used together in this order! Specifies that, when possible, the contents will be rendered in parralel collumns, the stuff between the `<Left>` `</Left>` tags on the left, and the stuff between the `<Right></Right>` tags on the right.
- `<Example></Example>` : creates an instance of the example component initialized with whatever text is between the tags.
- `<StaticExample></StaticExample>` : creates an instance of the static example component initialized with whatever text is between the tags.
- `<Type></Type>` : creates an instance of the type component initialized with whatever text is between the tags.
- `<TypeList></TypeList>` : creates an instance of the type component initialized with whatever text is between the tags.
- `<OperationTable></OperationTable>` : creates an instance of the type component initialized with whatever text is between the tags.

#### Misc Tags

- `<Line>` : makes a horizontal line separating two parts of the documentation body or the sidebar (note: only works outside of other body tags if you want to add a line within a body tag, just use the markdown ---)

note: lines are automaticaly included between sections if the documentation is being autoformated (you aren't using Body tags). To disable this, simply include "autoline={false}" anywhere in your documentation.

---

## Example Components

---

Example components:

`<Example autoformat static>input</Example>`

are used to create windows that can be used to display code examples. These windows are live and fully interactive, you can type new stuff into them, run whatever you have, and get results back live from your API.

#### Creating an Example

Example components start out with whatever text was between their tags as their content, so `<Example></Example>` creates an empty window, while `<Example>query{aQuery{result}}</Example>` creates an example window with the text:

query { 
  aQuery 
  { 
    result 
  }
}

#### Auto-formatting

The code in example windows will auto-format itself by default, so it should always look nice. However, you may not want code to auto-format for some reason. To do this, include the parameter autoformat=false in your example components start tag. For example: `<Example autoformat=false>query {   aQuery } { result }}</Example>` will create an example window with a query that looks like this:

query {   aQuery } { result }}

#### Generating Input

You may wish to generate randomized inputs for some of your operations. There are three functions that can help with this:

- `generateString(int)` produces a string of random characters of length int
- `generateInt(int Boolean)` produces an randomized intiger of Int didgets in length. The boolean is optional, if set to true the int has a 50% chance of being negative. (note: the arguments should be seperated only by spaces, not commas!)
- `generateFloat(Int Int Boolean)` produces a randomized float who's whole part is equal in length to the first int, while the number of didgets in the fractional part is equal to the second in length. The boolean is optional, if set to true the float has a 50% chance of being negative. (note: the arguments should be seperated only by spaces, not commas!)

You can include these functions anywhere in an example's input and they will be replaced with their outputs. For example `<Example autoformat=false>query{aQuery{generateString(3) generateInt(6 true) generateFloat(2 5 true)}{result}}</Example>` will produce an example window with a query that looks something like:

query {
  aQuery {
    field1: "tR4"
    field2: 141918
    field3: -97.82019
  }
  {
  result
  }
}

#### Making a regular example static
You may wish to add a code example that can't be run. To do this, you would generaly use the `<StaticExample>` component, but it is also possible to do this by creating a regular example component and including the parameter static=true. For example: `<Example static=true>query{aQuery{result}}</Example>` will produce something like:

query { 
  aQuery 
  { 
    result 
  }
}

But will not display a run button or be editable.

---

## Static Example Components

---

Static Example Components:

`<StaticExample autoformat editable>input</StaticExample>`

are used to display example code that is static, rather than dynamic. Static examples do not include a run button and can not be used to make queries or do anything else.

Like Example Components, Static Example components start out with whatever text was between their tags as their content, so `<StaticExample></StaticExample>` creates an empty window, while `<StaticExample>query{aQuery{result}}</StaticExample>` creates an example window with the text:

query { 
  aQuery 
  { 
    result 
  }
}

Static Examples also include the autoformat parameter, which is used in the same way as in regular Examples (see 'Auto-formatting' above). It is also possible to generate inputs in Static Examples in the same way as in regulare Examples (see 'Generating Input' above).

Static Examples have a unique parameter: 'editable.' By default, static examples can't be edited. However, you may wish to make it possible to edit a static example. To do this, include the parameter editable=true in the component. For example <StaticExample editable=true> `<StaticExample editable=true>query{aQuery{result}}</StaticExample>` will produce an example window with the text:

query { 
  aQuery 
  { 
    result 
  }
}

but the result will be editable.

---

## Type Components

---

Type components:

`<Type printHeader printDiscriptions>typeName</Type>`

are used to print a type (one of Type, Enum, Input, Scalar, Interface, or Union) from your schema. Printed types are generated dynamically, and will include links to any other types in its fields. To do this, simply put the name of the type (w/ correct capitalization) between the tags. For instance `<Type>MyType</Type>` would produce something like:

MyType: Description of My Type

type MyType {
myName: String My Name
myNumber: Int My favorite Number
myFood: FoodType My favorite food
}

You may wish to display a type without either its header or its field descriptions. To do this, include the parameter(s) `printHeader=false` and/or `printDescriptions=false` in your type component. For example `<Type printHeader=false printDescriptions=false>MyType</Type>` would produce something like:

type MyType {
myName: String
myNumber: Int
myFood: FoodType
}

---

## TypeList Components

---

TypeList components

`<TypeList printHeaders printDescriptions include exclude showLines>typeKind</TypeList>`

are used to print a list of types (Types, Enums, Inputs, Scalars, Interfaces, or Unions). Types are sorted alphabetically and each type is generated dynamically, and will include links to any other types in its fields. To do this, simply put the name of the kind of type you want (one of: "Object" "Enum" "Input_Object" "Scalar" "Interface" "Union" or "all" if you want to print everything) to print between the tags. For instance `<TypeList>Object</TypeList>` would produce something like:

Object1: Description of Object1

type Object1 {
param1: Int : Description for param1
param2: String : Description for param2
}

Object2: Description of Object2

type Object2 {
param1: Int : Description for param1
param2: Float : Description for param2
}

Object3: Description of Object1

type Object3 {
param1: Float : Description for param1
param2: String : Description for param2
}

You may wish to print TypeLists without field descriptions or object headers. To do this, include the , include the parameter(s) `printHeaders=false` and/or `printDescriptions=false` in your type component. For example `<TypeList printHeaders=false printDiscriptions=false>Object</TypeList>` would produce something like:

type Object1 {
param1: Int
param2: String
}

--------------------------------------

type Object2 {
param1: Int
param2: Float
}

--------------------------------------

type Object3 {
param1: Float
param2: String
}

You may wish to print TypeLists that include only certain types, or that exclude certain types. To do this you can include the parameter(s) `include=[]` and/or `exclude=[]`. Both of these parameters take a list of strings seperated by spaces and enclosed within brackets. If include is not empty, the resulting list will include only types who's names can be found in include. Likewise, any types who's names can be found in exclude will not be included in the printed list. For example `<TypeList exclude=[Object2]>Object</TypeList>` would produce something like:

Object1: Description of Object1

type Object1 {
param1: Int : Description for param1
param2: String : Description for param2
}

--------------------------------------

Object3: Description of Object1

type Object3 {
param1: Float : Description for param1
param2: String : Description for param2
}

You may wish to print TypeList without lines seperating each type. To do this include the parameter showLines=false. For Example `<TypeList exclude=[Object2]>Object</TypeList>` would produce something like


Object1: Description of Object1

type Object1 {
param1: Int : Description for param1
param2: String : Description for param2
}

Object3: Description of Object1

type Object3 {
param1: Float : Description for param1
param2: String : Description for param2
}

---

## OperationTable Components

---

OperationTable components

`<OperationTable include exclude>operationType</OperationTable>`

is used to produce a table of operations and their descriptions. Operations in the table are generated dynamically, sorted alphabetically, and have links to any types in their arguments or outputs. To do this simply put the name of the type of operation you want to print (one of: "Query" "Mutation" "Subscription" or "Operation" if you want to print all operations) between the tags. For example, `<OperationTable>Query</OperationTable>` would produce something like:

| Query                                           | Description                                  |
| ----------------------------------------------- | -------------------------------------------- |
| query1 : String                                 | produces a random string                     |
| query2 (length: Int): String                    | produces a string of a given length          |
| query3 (length: Int, listLength: Int): [String] | produces a list of strings of a given length |

You may wish to include only certain operations and/or or exclude certain operations. To do this you can include the parameter(s) include=[] and/or exclude=[]. Both of these parameters take a list of strings seperated by spaces and enclosed within brackets. If include is not empty, the resulting table will include only operations who's names, args, or outputs can be found in include. Likewise, any types who's names, args, or outputs can be found in exclude will not be included in the printed list. For example `<OperationTable include=[length]>Query</OperationTable>` would produce:

| Query                                           | Description                                  |
| ----------------------------------------------- | -------------------------------------------- |
| query2 (length: Int): String                    | produces a string of a given length          |
| query3 (length: Int, listLength: Int): [String] | produces a list of strings of a given length |

while `<OperationTable include=[length] exclude=[listLength]>`Query`</OperationTable>` would produce:

| Query                        | Description                         |
| ---------------------------- | ----------------------------------- |
| query2 (length: Int): String | produces a string of a given length |

---

## Page Features

---

Page Features

Generated documentation will automaticaly display the documentation produced by the .md file specified as mainPage in /src/content/pages.js

by appending "/?page=_stuff here_" you can get it to display other pages in the following ways:
  
 - "/?page=_name-of-other-page_ will display documentation produced by one of the .md files in the otherPages list in /src/content/pages.js, specificaly _name-of-other-page_.md

    - "/?page=printType*typeName* will print a page containing a single Type component that displays *typeName*

---

## Changing the Style

---

To change the style of the main page edit /src/app_style.css

To chage the style of individual components edit the css files found in /src/components/NAME_OF_COMPONENT_YOU_WANT_TO_EDIT

---

## Other Changes

---

To change logo: replace replace /public/logo.png

To change favicon: replace /public/favicon.ico

To change title of the webpage: edit /public/index.html