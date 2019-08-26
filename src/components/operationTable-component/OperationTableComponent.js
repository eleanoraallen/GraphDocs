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

/**
 * returns the specified peration table as a react component
 * 
 * @param operationType<String> the name of a type of operation (one of: 'operation', 'query', 'mutation', 'subscription')
 * @param include<[String]> an array of names of operations to be included in the printed list (if empty then all are included)
 * @param exclude<[String]> an array of names of operations to be excluded from the printed list (if empty none are excluded)
 * @param data<data> the results of a schema introspection query
 * 
 * @return<ReactElement> The operation table
 */
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

/**
 * filters an array of operations
 * 
 * @param operations<[operation]> an array of operations
 * @param include<[String]> an array of names of operations to be included in the filtered list (if empty then all are included)
 * @param exclude<[String]> an array of names of operations to be excluded from the filtered list (if empty then none are excluded)
 * 
 * @return<[operation]> the filtered array of operations
 */
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

/**
 * returns a given array of operations as a table rendered w/ ReactMarkdown
 * 
 * @param operations<[operation]> an array of operations
 * @param types<[type]> the array of all types in the schema
 * @param tableName<String> the name of the leftmost column in the table to be printed
 * 
 * @return<ReactMarkdown /> the filtered array of operations
 */
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

/**
 * returns an array of args as a markdown string
 * 
 * @param args<[arg]> an array of operations
 * @param types<[type]> the array of all types in the schema
 * 
 * @return<String> the args as a string
 */
function stringifyArgs(args, types) {
  if (args.length > 1) {
    const last = `*\`${args[args.length - 1].name}: \`* ${makeLink(
      getType(args[args.length - 1]),
      types,
    )}*\`)\`*`;
    args.pop();
    return (
      '`(`' +
      args
        .map(arg => {
          return `*\` ${arg.name}:\`* ${makeLink(
            getType(arg),
            types,
          )}&nbsp;&nbsp;`;
        })
        .join('') +
      last
    );
  }
  if (args.length === 1) {
    return `\`(\`*\`${args[0].name}: \`* ${makeLink(
      getType(args[0]),
      types,
    )}*\`)\`*`;
  } else {
    return '';
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

/**
 * returns the output of on operation
 * 
 * @param operation<operation> an operation (eg. queryType)
 * @param types<[Type]> the array of all types in the schema (to be used to make links)
 * 
 * @return<String> the output of the given operation
 */
function stringifyOutput(operation, types) {
  if (operation.name === null) {
    let outputString;
    if (operation.ofType.name != null) {
      outputString = makeLink(operation.ofType.name, types);
    } else {
      outputString = makeLink(operation.ofType.ofType.name, types);
    }
    return `\`[\`${outputString.replace(' ', '')}\`]\``;
  } else {
    return makeLink(operation.name, types).replace(' ', '');
  }
}

//  ----------------------------------------------------------------------------------------
// # Component
//  ----------------------------------------------------------------------------------------

// Component Class
export default class OperationTableComponent extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      printFilteredOperations(
        this.props.operationType.toLowerCase(),
        this.props.include,
        this.props.exclude,
        this.props.data));
  }
}
