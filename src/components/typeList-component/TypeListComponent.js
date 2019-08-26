import React, { Component } from 'react';
import './typeList_style.css';
import TypeComponent from '../type-component/TypeComponent';

//  ----------------------------------------------------------------------------------------
// # Functions
//  ----------------------------------------------------------------------------------------

/**
 * returns a div containing a printed list of types that conforms to given parameters
 * 
 * @param typeKind<String> the kind of type being printed 
 *                (one of 'object', 'enum', 'input_object', 'interface', 'union', 'scalar', or 'all')
 * @param include<[String]> an array of names of types to be included in the printed list (if empty then all are included)
 * @param exclude<[String]> an array of names of types to be excluded from the printed list (if empty none are excluded)
 * @param printHeaders<Boolean> true iff types' headers should be printed
 * @param printDescriptions<Boolean> true iff types' field descriptions should be printed
 * @param types<[Type]> the array of all types
 * @param showLines<Boolean> true iff lines should be inserted to seperate printed types
 * 
 * @return a div containing the array of types of the given kind who's names are in include and not in exclude
 */
function printTypes(
  typeKind,
  include,
  exclude,
  printHeaders,
  printDescriptions,
  types,
  showLines) {
  const allTypes = types;
  include = include.map(s => s.toLowerCase());
  exclude = exclude.map(s => s.toLowerCase());
  types = types.filter(
    type =>
      !shouldSkip(type.name) &&
      (type.kind === typeKind.toUpperCase() || typeKind === 'all'),
  );
  if (include.length > 0) {
    types = types.filter(type =>
      include.includes(type.name.toLowerCase()),
    );
  }
  if (exclude.length > 0) {
    types = types.filter(
      type => !exclude.includes(type.name.toLowerCase()),
    );
  }
  types = types.sort((t1, t2) => {
    if (t1.name > t2.name) {
      return 1;
    } else {
      return -1;
    }
  });
  types = types.map(type => {
    return(
    <TypeComponent
      typeName={type.name}
      printHeader={printHeaders}
      printDiscriptions={printDescriptions}
      types={allTypes}/>);
    });
  if (showLines) {
    let newTypes = [];
    while (types.length > 1) {
      newTypes = newTypes.concat([types.shift(), <hr width='90%'></hr>]);
    }
    types = newTypes.concat(types);
  }
  return <div id='typeList'>{types}</div>;
}

/**
 * Takes the name of a type and returns true iff it should be skipped
 * @param name<String> the name of a type
 * @return<Boolean> True iff the given type should be skipped when printing
 */
function shouldSkip(name) {
  return (
    name === 'Query' ||
    name === 'Subscription' ||
    name === 'Mutation' ||
    (name.length > 1 && name.slice(0, 2) === '__')
  );
}

//  ----------------------------------------------------------------------------------------
// # Component
//  ----------------------------------------------------------------------------------------

// Component Class
export default class TypeListComponent extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (printTypes(
          this.props.typeKind,
          this.props.include,
          this.props.exclude,
          this.props.printHeaders,
          this.props.printDescriptions,
          this.props.types,
          this.props.showLines
        )
    );
  }
}
