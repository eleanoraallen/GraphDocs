import React, { Component } from 'react';
import ReactMarkdown from 'react-markdown';
import './type_style.css';

//  ----------------------------------------------------------------------------------------
// # Constants
//  ----------------------------------------------------------------------------------------

// String used to construct links to the reference
const ReferenceLink = (
  window.location.href.split('/?page=')[0].replace('http://', '') +
  '/?page=printType:NAME'
).replace('//?page', '/?page');

//  ----------------------------------------------------------------------------------------
// # Functions
//  ----------------------------------------------------------------------------------------

/**
 * prints a given type using react-markdown
 * 
 * @param typeName<String> the name of the type to be printed (one of: Scalar, 0bject, Input-Object, Interface, Union or Enum)
 * @param printHeader<Boolean> true iff the header of the given type should be printed
 * @param printDiscriptions<Boolean> true iff the type's field descriptions should be printed
 * @param types<[Type]> the array of all types in the schema (to be used to make links)
 * 
 * @return<ReactMarkdown /> The type printed according to the given parameters
 */
function makeType(typeName, printHeader, printDiscriptions, types) {
  const filtered = types
    .map(type => {
      let printedType = '';
      if (type.kind === 'ENUM' && type.name === typeName) {
        printedType =
          `  \n  **${type.name}**: *${type.description}*  \n  `.replace(
            ': *null*',
            '',
          ) +
          `  \n  | | | \n |-|-| \n | \`enum ${type.name} {\` | ${stringifyValues(type.enumValues, printDiscriptions)}`;
      }
      if (type.kind === 'OBJECT' && type.name === typeName) {
        printedType =
          `  \n  **${type.name}**: *${
            type.description
          }*  \n  \`\`  \n  `.replace(': *null*', '') +
          stringifyFields(type.fields, types, type.name, 'type', printDiscriptions);
      }
      if (type.kind === 'INPUT_OBJECT' && type.name === typeName) {
        printedType =
          `  \n  **${type.name}**: *${
            type.description
          }*  \n  \`\`  \n  `.replace(': *null*', '') +
          stringifyFields(
            type.inputFields,
            types,
            type.name,
            'input',
            printDiscriptions,
          );
      }
      if (type.kind === 'INTERFACE' && type.name === typeName) {
        printedType =
          `  \n  **${type.name}**: *${
            type.description
          }*  \n  \`\`  \n  `.replace(': *null*', '') +
          stringifyFields(type.fields, types, type.name, 'interface', printDiscriptions);
      }
      if (type.kind === 'UNION' && type.name === typeName) {
        printedType =
          `  \n  **${type.name}**: *${type.description}*  \n  `.replace(
            ': *null*',
            '',
          ) +
          `  \n  \'union ${type.name}:\` ` +
          type.possibleTypes
            .map(pType => {
              return `\`${pType.name}\``;
            })
            .join(' | ') +
          '  \n  ';
      }
      if (type.kind === 'SCALAR' && type.name === typeName) {
        printedType = `  \n  **${type.name}**  \n  \`${type.name}\`: ${
          type.description
        }  \n  `;
      }
      if (!printHeader) {
        printedType = printedType
          .replace(`**${type.name}**: *${type.description}*`, '')
          .replace(`**${type.name}**`, '');
      }
      return printedType;
    })
    .sort()
    .join('');
  return (
    <ReactMarkdown
      source={filtered}
      renderers={{
        link: props => (
          <a href={props.href} target='_blank'>
            {props.children}
          </a>
        ),
        table: props => <table id='typeTable'>{props.children}</table>,
      }}
    />
  );
}

/**
 * returns an Enum's values as a markdown parsable string
 * 
 * @param enumValues<[value]> the array of an Enum's values
 * @param printDiscriptions<Boolean> true iff the value's descriptions should be printed
 * 
 * @return<String> A markdown parsable string representing enumValues
 */
function stringifyValues(enumValues, printDiscriptions) {
  if (printDiscriptions) {
    return '| | \n  ' + enumValues.map(value => {
      return `| &nbsp &nbsp  \`${value.name}\` | ${value.description} |  \n  `;
    })
    .join('') + '| } | |';
  } else {
    return '| \n  ' + enumValues.map(value => {
      return `| &nbsp &nbsp  \`${value.name}\` | |  \n  `;
    })
    .join('') + '| } | |  \n  | | | \n';
  }
}

/**
 * returns a given array of fields or inputFields as a markdown parsable string
 * 
 * @param fields<[Field]> an array of Fields or inputFields
 * @param types<[Type]> the array of all types in the schema (to be used to make links)
 * @param parentName<String> the name of the type from which fields was taken
 * @param parentOfType<String> the kind of type parentName was
 * @param printDiscriptions<Boolean> True iff the Field's discriptions should be printed
 * 
 * @return<String> a markdown parsable string representing fields
 */
function stringifyFields(fields, types, parentName, parentOfType, printDiscriptions) {
  if (printDiscriptions) {
    return (
      `  \n  | **\`${parentOfType}\`** ${makeLink(parentName, types,)} \`{\` | |  \n  |-|-|  \n  ` +
      fields.map(type => {
          return (
            `  | &nbsp; &nbsp; \`${type.name}:\` ${makeLink(getType(type), types)} | ` + 
            `${String(type.description).replace('null', '')} |  \n`
            );
        })
        .sort()
        .join('') +
      ' | ```}``` | |  \n  ');
  } else {
    return (
      `  \n  | **\`${parentOfType}\`** ${makeLink(parentName, types,)} \`{\` |  \n  |-|  \n  ` +
      fields.map(type => {
          return (
            `  | &nbsp; &nbsp; \`${type.name}:\` ${makeLink(getType(type), types)} |  \n`
            );
        })
        .sort()
        .join('') +
      ' | ```}``` |  \n  ');
  }
}

/**
 * takes a string and, if it is the name of a type, makes it a link to that type
 * 
 * @param s<String> a string that may or may not be the name of a type
 * @param types<[Type]> the array of all types in the schema (to be used to make links)
 * 
 * @return<String> eithier the given string or, if the given string is the name of a type
 *        a markdown parsable link to the named type
 */
function makeLink(s, types) {
  const matchedType = types.filter(aType => aType.name === s);
  const tString = ` \`${s}\``;
  if (matchedType.length === 1) {
    return `[${tString}](http://${ReferenceLink})`.replace(
      'NAME',
      matchedType[0].name,
    );
  } else {
    return tString;
  }
}

/**
 * returns the name of a given type
 * @param t<Type> Some kind of type
 * @return<String> The name of the given type
 */
function getType(t) {
  let s = '';
  try {
    s = s + t.type.name;
  } catch {}
  try {
    s = s + t.type.ofType.name;
  } catch {}
  try {
    s = s + t.typeOf.name;
  } catch {}
  try {
    s = s + t.typeOf.ofType.name;
  } catch {}
  try {
    s = s + t.typeOf.typeOf.name;
  } catch {}
  try {
    s = s + t.typeOf.typeOf.ofType.name;
  } catch {}
  return s.replace('null', '');
}

//  ----------------------------------------------------------------------------------------
// # Component
//  ----------------------------------------------------------------------------------------

// Component Class
export default class TypeComponent extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return makeType(
      this.props.typeName,
      this.props.printHeader,
      this.props.printDiscriptions,
      this.props.types
    );
  }
}