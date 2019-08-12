# Chargetrip API Documentation

The Documentation is now live!: http://chargetrip-api-documentation.s3-website.eu-central-1.amazonaws.com/

---

## Basics

---

To Make or Edit Documentation:

- set endpoint and authorization headers in /src/content/authorization.js
- write up to four .md files in /public (one main + 3 others)
- set mainPage and otherPages in /src/content/pages.js

To Test:

- npm start

To Build:

- npm build

---

## Writing Documentation

---

Documentation is generated from markdown files in /public. The contents of these files are first parsed for style and custom components, for which custom tags are used, then the stuff inside those tags is parsed as markdown as needed. ALL CONTENT THAT YOU WANT TO BE RENDERED MUST BE PUT INSIDE A CUSTOM TAG!

### Sidebar Tags

These tags can be used only to create/within the a sidebar

- `<Sidebar></Sidebar>` : specifies that the stuff between these tags should be used to render the sidebar.
- `<Header></Header>` : specifies that the stuff between these tags should be used as a header in the sidebar.
- `<Subheader></Subheader>` : specifies that the stuff between these tags should be used as a subheader in the sidebar.
- `<Logo></Logo>` : renders a logo with a link pointing to whatever url is given between the tags.

note: most of the time, headers and subheaders will contain links (eg. [something](#heading-name) ), that will point to the id a heading (given by `##` or `<h1>` etc.) in the rest of the documentation. All headers are automaticaly asigned ids that are the same as their names but with all lower case letters and special characters (space,!,. etc.) replaced with -. (Eg '##My Introduction' would have an id 'my-introduction' and could be linked to with a header `<Header>`[Intro](#my-introduction).)

### Body Tags

These tags can be used only to create/within the body of the documentation

- `<Body></Body>` : specifies that the stuff between these tags will constitute the body of the documentation.
- `<Full></Full>` : specifies that whatever is in-between these two tags will render such that it will take up the full width of the body
- `<Left></Left>` & `<Right></Right>` : These tags must be used together in this order! Specifies that, when possible, the contents will be rendered in parralel collumns, the stuff between the `<Left>` `</Left>` tags on the left, and the stuff between the `<Right></Right>` tags on the right.
- `<Example></Example>` : creates an instance of the example component initialized with whatever text is between the tags.
- `<Type></Type>` : creates an instance of the type component initialized with whatever text is between the tags.
- `<TypeList></TypeList>` : creates an instance of the type component initialized with whatever text is between the tags.
- `<OperationTable></OperationTable>` : creates an instance of the type component initialized with whatever text is between the tags.

### Misc Tags

- `<Line>` : makes a horizontal line separating two parts of the documentation body or the sidebar (note: only works outside of other body tags)

---

## Example Components

---

Example components:

`<Example autoformat>input</Example>`

are used to create windows that can be used to display code examples. These windows are live and fully interactive, you can type new stuff into them, run whatever you have, and get results back live from your API.

#### Creating an Example

Example components start out with whatever text was between their tags as their content, so `<Example></Example>` creates an empty window, while `<Example>query{aQuery{result}}</Example>` creates an example window with the text:

query { aQuery } { result }}

#### Auto-formatting

You may want text in one of your example windows auto-format itself. To do this, include the parameter autoformat=true in your example components start tag. For example: `<Example autoformat=true>query { aQuery } { result }}</Example>` will create an example window with a query that looks like this:

query {
aQuery {
result
}
}

#### Adding extra spaces and line breaks

You may wish to insert extra spaces or linebreaks without overridning the auto-formating entierly. To do this, simply insert `@@` for any linebreak and`--` for any space. If you're planning on inserting multiple special characters in a row, be sure to seperate them with a space! For example `<Example autoformat=true>query --{ @@aQuery {-- -- result@@ @@ @@ -- -- -- --}}</Example>` would produce an example window with the following text:

query {
  
 aQuery {
result

}

}

(I would judge you for doing that though)

#### Generating Input

You may wish to generate randomized inputs for some of your operations. There are three functions that can help with this:

- `generateString(int)` produces a string of random characters of length int
- `generateInt(int Boolean)` produces an randomized intiger of Int didgets in length. The boolean is optional, if set to true the int has a 50% chance of being negative. (note: the arguments should be seperated only by spaces, not commas!)
- `generateFloat(Int Int Boolean)` produces a randomized float who's whole part is equal in length to the first int, while the number of didgets in the fractional part is equal to the second in length. The boolean is optional, if set to true the float has a 50% chance of being negative. (note: the arguments should be seperated only by spaces, not commas!)

You can include these functions anywhere in an example's input and they will be replaced with their outputs. For example `<Example autoformat=true>query{aQuery{generateString(3) generateInt(6 true) generateFloat(2 5 true)}{result}}</Example>` will produce an example window with a query that looks something like:

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

---

## Type Components

---

Type components:

`<Type printHeader printDiscriptions>typeName</Type>`

are used to print a type (one of Object, Enum, Input_Object, Scalar, Interface, or Union) from your schema. Printed types are generated dynamically, and will include links to any other types in its fields. To do this, simply put the name of the type (w/ correct capitalization) between the tags. For instance `<Type>MyType</Type>` would produce something like:

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

`<TypeList printHeaders printDescriptions include exclude>typeKind</TypeList>`

are used to print a list of types (Objects, Enums, Input_Objects, Scalars, Interfaces, or Unions). Types are sorted alphabetically and each type is generated dynamically, and will include links to any other types in its fields. To do this, simply put the name of the kind of type you want (one of: "Object" "Enum" "Input_Object" "Scalar" "Interface" "Union" or "all" if you want to print everything) to print between the tags. For instance `<TypeList>Object</TypeList>` would produce something like:

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

type Object2 {
param1: Int
param2: Float
}

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

To change the style of examples edit /src/example-component/example_style.css

To change the style of references edit /src/reference-component/reference_style.css

---

## Other Changes

---

To change logo: replace replace /src/content/logo.png

To change favicon: replace /public/favicon.png

To change title of the webpage: edit /public/index.html
