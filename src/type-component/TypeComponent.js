import React, { Component } from 'react';
import {ApolloClient} from "apollo-boost";
import { HttpLink } from 'apollo-link-http';
import {ApolloProvider, Query} from "react-apollo";
import { InMemoryCache } from 'apollo-cache-inmemory';
import { setContext } from 'apollo-link-context';
import gql from 'graphql-tag';
import {Token, ClientID, Endpoint} from '../content/authorization';
import ReactMarkdown from 'react-markdown';
import './type_style.css';


//  ----------------------------------------------------------------------------------------
// # Constants
//  ----------------------------------------------------------------------------------------


// Setup Client
const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      authorization: Token ? `Bearer ${Token}` : "",
      'x-client-id': ClientID,
    }
  }
});
const clientCache = new InMemoryCache();
const clientLink = new HttpLink({uri: Endpoint });
const client = new ApolloClient({ cache: clientCache, link: authLink.concat(clientLink) });

// String used to construct links to the reference
const ReferenceLink = (window.location.href.split('/?page=')[0].replace('http://','') + 
  '/?page=printType:NAME').replace('//?page', '/?page');

// String used to construct query
const schemaQuery = 'query{__schema{types{kind name possibleTypes{name}inputFields{name description type{name ofType{' +
  'name}}} description enumValues{name description} fields{name description type{name ofType{name}}}}}}';


//  ----------------------------------------------------------------------------------------
// # Functions
//  ----------------------------------------------------------------------------------------

// printType(String) ==> Query
// takes the name of a type (0bject, Input-Object or Enum) and creates a Query that prints that type
function printType(typeName, printHeader, printDiscriptions) {
  return(
  <Query query={gql(schemaQuery)}>
    {({ loading, data, error}) => {
      if (loading) return(<p>{`Loading  ${typeName}...`}</p>);
      if (error) return(<p>{JSON.stringify(error)}</p>);
    if (data) { return makeType(typeName, printHeader, printDiscriptions, data.__schema.types); }}}
  </Query>);
}

// makeType(String, [type]) ==> <ReactMarkdown />
// takes the name of a type (Scalar, 0bject, Input-Object, Interface, Union or Enum) and an array of types 
// represenging all types in the schema (to be used to make links) and prints the named type using react-markdown
function makeType(typeName, printHeader, printDiscriptions, types) {
  const filtered = types.map(type => {
    let printedType = '';
    if ((type.kind === "ENUM") && (type.name === typeName)) {
      printedType = `  \n  **${type.name}**: *${type.description}*  \n  `.replace(': *null*', '') +
        `  \n  enum ${type.name} {${stringifyValues(type.enumValues) }  \n  }  \n\ \n \n`;
    }
    if ((type.kind === "OBJECT") && (type.name === typeName)) {
      printedType = `  \n  **${type.name}**: *${type.description}*  \n  \`\`  \n  `.replace(': *null*', '') +
        stringifyFields(type.fields, types, type.name, printDiscriptions);
    } 
    if ((type.kind === "INPUT_OBJECT") && (type.name === typeName)) {
      printedType = `  \n  **${type.name}**: *${type.description}*  \n  \`\`  \n  `.replace(': *null*', '') +
        stringifyFields(type.inputFields, types, type.name, printDiscriptions);
    }
    if ((type.kind === "INTERFACE") && (type.name === typeName)) {
      printedType = `  \n  **${type.name}**: *${type.description}*  \n  \`\`  \n  `.replace(': *null*', '') +
        stringifyFields(type.fields, types, type.name, printDiscriptions);
    }
    if ((type.kind === "UNION") && (type.name === typeName)) {
      printedType = `  \n  **${type.name}**: *${type.description}*  \n  `.replace(': *null*', '') +
      `  \n  \'union ${type.name}:\` ` +
      type.possibleTypes.map(pType => {return(`\`${pType.name}\``)}).join(' | ') + '  \n  ';
    }
    if ((type.kind === "SCALAR") && (type.name === typeName)) {
      printedType = `  \n  **${type.name}**  \n  \`${type.name}\`: ${type.description}  \n  `;
    }
    if (!printHeader) {
      printedType = printedType.replace(`**${type.name}**: *${type.description}*`,'').replace(`**${type.name}**`,'');
    }
    return printedType;
  }).sort().join('')
  return(<ReactMarkdown source={filtered} 
    renderers={{link : props => <a href={props.href} target="_blank">{props.children}</a>,
    table : props => <table id="typeTable">{props.children}</table>}} />);
}

// stringifyValues(value) ==> String
// takes an array of enumValues and returns it as a string to be parsed into markdown
function stringifyValues(enumValues) {
  return(enumValues.map(value => {return(`  \n &nbsp &nbsp &nbsp  **\`${value.name}\`**`)}).join(''));
}

// stringifyFields([field], [type], String, Boolean) ==> String
// takes an array of Fields or inputFields, an array of types represenging all types in the schema (to be used to 
// make links), the name of the Object/Input-Object to which the Fields belong, and a boolean which is true iff 
// the field descriptions are to be printed, and returns the fields as a string to be rendered in markdown.
function stringifyFields(fields, types, parentName, printDiscriptions) {
  if (!printDiscriptions) {
    return `  **\`type\`** ${stringifyType(parentName, types)} \`{\`   \n` + 
    fields.map(type => {
      return `  &nbsp; &nbsp; &nbsp;  **\`${type.name}:\`** ${stringifyType(getType(type), types)}  \n`; 
    }).sort().join('') + '   ```}```  \n  ';
  } else {
    return `  \n  **\`type\`** ${stringifyType(parentName, types)} \`{\`  \n  \n  | | |  \n  | - | - |  \n` + 
    fields.map(type => {
      return `  | **\`${type.name}:\`** ${stringifyType(getType(type), types)} | ` +
      `${String(type.description).replace('null', '')} |  \n`; 
    }).sort().join('') + ' ```}```  \n  ';
  }
}

// stringifyType(String, [type]) ==> String
// Takes the name of a type and an array of all types and returns the type as a string (builds links)
function stringifyType(typeName, types) {
  const matchedType = types.filter(aType=> aType.name === typeName);
  const tString = ` \`${typeName}\``;
  if (matchedType.length === 1) {
     return `[${tString}](http://${ReferenceLink})`.replace('NAME', matchedType[0].name);
  } else {
    return tString; 
  }
}

// printType(type) ==> String
/// takes some kind of type and prints that type's name
function getType(t) {
  let s = "";
  try { s = s + t.type.name; } catch {}
  try { s = s + t.type.ofType.name; } catch {}
  try { s = s + t.typeOf.name; } catch {}
  try { s = s + t.typeOf.ofType.name; } catch {}
  try { s = s + t.typeOf.typeOf.name; } catch {}
  try { s = s + t.typeOf.typeOf.ofType.name; } catch {}
  return s.replace('null','');
}

//  ----------------------------------------------------------------------------------------
// # Component
//  ----------------------------------------------------------------------------------------


// Component Class
export default class TypeComponent extends Component {

  // Constructor
  constructor(props) {
    super(props);
  }

  // Render
  render() {
  return (
      <ApolloProvider client={client}>
        {printType(this.props.typeName, this.props.printHeader, this.props.printDiscriptions)}
      </ApolloProvider>
    );
  }
}