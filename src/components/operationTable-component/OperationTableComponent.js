import React, { Component } from 'react';
import ReactMarkdown from 'react-markdown';
import './operationTable_style.css';

//  ----------------------------------------------------------------------------------------
// # Constants
//  ----------------------------------------------------------------------------------------

// String used to construct links to the reference
const ReferenceLink = (
  window.location.href.split('/?page=')[0].replace('http://', '') +
  '/?page=referenceRequest=printType:NAME'
).replace('//?page', '/?page');

//  ----------------------------------------------------------------------------------------
// # Functions
//  ----------------------------------------------------------------------------------------

// printFilteredOperations(String, [String], [String]) ==> <Query />
// takes the name of a type of operation: (one of: 'operation', 'query', 'mutation', 'subscription'), and two
// arrays of strings and produces a Query that will produce a table of operations of the specified type that all
// include at least one instance of at least one string from the first array in their name, arguments, or output,
// and do not include any instances of any of the strings in the second array in its name, arguments, or output.
// If both arrays are empty, produces a table of all operations of the specified type.
function printFilteredOperations(operationType, include, exclude, data) {
  if (operationType === 'query') {
    return(
      printTable(
        filterOperations(
          data.__schema.queryType.fields,
          include,
          exclude,
          ),
          data.__schema.types,
          'Query',
      ));
  }
  if (operationType === 'mutation') {
    return(
      printTable(
        filterOperations(
          data.__schema.mutationType.fields,
          include,
          exclude,
          ),
          data.__schema.types,
          'Mutation',
      ));
  }
  if (operationType === 'subscription') {
    return(
      printTable(
        filterOperations(
          data.__schema.subscriptionType.fields,
          include,
          exclude,
          ),
          data.__schema.types,
          'Subscription',
      ));
  }
  else {
    return(
      printTable(
        filterOperations(
          data.__schema.queryType.fields.concat(
            data.__schema.mutationType.fields).concat(
              data.__schema.subscriptionType.fields),
          include,
          exclude,
          ),
          data.__schema.types,
          'Operation'
      ));
  }
}
        

// filterOperations([operation], [String], [String]) ==> [operation]
// Takes an array of the operation type (eg. queryType) and two arrays of strings and filters the array of operations s.t
// each operation in the resulting array will inclue at least one instance of at least one string from the first array in their
//  name, arguments, or output, and do not include any instances of any of the strings in the second array in its name, arguments,
//  or output. If both arrays are empty, returns the array of operations unchanged.
function filterOperations(operations, include, exclude) {
  if (include.length === 0 && exclude.length === 0) {
    return operations;
  }
  let includeList = include.map(s => s.toLowerCase());
  let excludeList = exclude.map(s => s.toLowerCase());
  let includeString = includeList.join('');
  let excludeString = excludeList.join('');
  return operations.filter(operation => {
    let checkedInclude = false;
    if (includeList.length === 0)  {
      checkedInclude = true;
    }
    let checkedExclude = false;
    // Check Operation Name
    checkedInclude =
      checkedInclude ||
      includeList
        .map(include => operation.name.toLowerCase().includes(include))
        .reduce((x, y) => x || y, false);
    checkedExclude =
      checkedExclude ||
      excludeList
        .map(exclude => operation.name.toLowerCase().includes(exclude))
        .reduce((x, y) => x || y, false);
    // Check Operation Args
    checkedInclude =
      checkedInclude ||
      operation.args
        .map(
          arg =>
            includeString.includes(arg.name.toLowerCase()) ||
            includeString.includes(getType(arg).toLowerCase()),
        )
        .reduce((x, y) => x || y, false);
    checkedExclude =
      checkedExclude ||
      operation.args
        .map(
          arg =>
            excludeString.includes(arg.name.toLowerCase()) ||
            excludeString.includes(getType(arg).toLowerCase()),
        )
        .reduce((x, y) => x || y, false);
    // Check Operation Type
    checkedInclude =
      checkedInclude ||
      includeList
        .map(include =>
          getType(operation)
            .toLowerCase()
            .includes(include),
        )
        .reduce((x, y) => x || y, false);
    checkedExclude =
      checkedExclude ||
      excludeList
        .map(exclude =>
          getType(operation)
            .toLowerCase()
            .includes(exclude),
        )
        .reduce((x, y) => x || y, false);
    return checkedInclude && !checkedExclude;
  });
}

// printTable([operation], [type], String) ==> <ReactMarkdown />
// takes an array of operations (operation types eg. queryType), an array of types representing all the types
// in the schema (which is used to make links), and the name of the left column of the table to be printed,
// and prints the array of operations as a table
function printTable(operations, types, tableName) {
  const tableString =
    `| ${tableName} | Description |\n| - | - |\n` +
    operations
      .filter(operation => operation.name !== 'temp__')
      .map(operation => {
        try {
          return (
            `| **\`${operation.name}\`**${stringifyArgs(
              operation.args,
              types,
            )}\`:\` ` +
            `${stringifyOutput(operation.type, types)} &nbsp;  | *${
              operation.description
            }*  |\n`
          );
        } catch {}
      })
      .sort()
      .join('');
  return (
    <ReactMarkdown
      source={tableString}
      renderers={{
        link: props => (
          <a href={props.href} target='_blank'>
            {props.children}
          </a>
        ),
        table: props => <table id='operationTable'>{props.children}</table>,
      }}
    />
  );
}

// stringifyArgs([arg], [type]) ==> String
// takes an array of args and an array of types  representing all the types in the schema (which is used to make links)
// and returns the array of args a string that can be parsed into markdown
function stringifyArgs(args, types) {
  if (args.length > 1) {
    const last = `*\`${args[args.length - 1].name}: \`* ${stringifyType(
      getType(args[args.length - 1]),
      types,
    )}*\`)\`*`;
    args.pop();
    return (
      '`(`' +
      args
        .map(arg => {
          return `*\` ${arg.name}:\`* ${stringifyType(
            getType(arg),
            types,
          )}&nbsp;&nbsp;`;
        })
        .join('') +
      last
    );
  }
  if (args.length === 1) {
    return `\`(\`*\`${args[0].name}: \`* ${stringifyType(
      getType(args[0]),
      types,
    )}*\`)\`*`;
  } else {
    return '';
  }
}

// stringifyType(String, [type]) ==> String
// Takes the name of a type and an array of all types and returns the type as a string (builds links)
function stringifyType(typeName, types) {
  const matchedType = types.filter(aType => aType.name === typeName);
  const tString = ` \`${typeName}\``;
  if (matchedType.length === 1) {
    return `[${tString}](http://${ReferenceLink})`.replace(
      'NAME',
      matchedType[0].name,
    );
  } else {
    return tString;
  }
}

// printType(type) ==> String
/// takes some kind of type and prints that type's name
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

// stringifyOutput(operation, [type]) ==> String
// takes an operation type (eg. queryType) and an array of all types in the schema (which is used to make links)
// and returns the expected output of the operation as a string to be rendered in markdown
function stringifyOutput(operation, types) {
  if (operation.name === null) {
    let outputString;
    if (operation.ofType.name != null) {
      outputString = stringifyType(operation.ofType.name, types);
    } else {
      outputString = stringifyType(operation.ofType.ofType.name, types);
    }
    return `\`[\`${outputString.replace(' ', '')}\`]\``;
  } else {
    return stringifyType(operation.name, types).replace(' ', '');
  }
}

//  ----------------------------------------------------------------------------------------
// # Component
//  ----------------------------------------------------------------------------------------

// Component Class
export default class OperationTableComponent extends Component {
  // Constructor
  constructor(props) {
    super(props);
  }

  // Render
  render() {
    return(
      printFilteredOperations(
        this.props.operationType.toLowerCase(),
        this.props.include,
        this.props.exclude,
        this.props.data));
  }
}
