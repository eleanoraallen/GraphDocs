import React, { Component } from 'react';
import './typeList_style.css';
import TypeComponent from '../type-component/TypeComponent';

//  ----------------------------------------------------------------------------------------
// # Functions
//  ----------------------------------------------------------------------------------------

// printTypes(String, [String], [String], Boolean, Boolean, [Type]) ==> <Query />
// takes the a kind of type (one of 'object', 'enum', 'input_object', 'interface', 'union', 'scalar', or 'all'), two
// arrays of strings, two booleans, and the array of types and returns a div containing the array of types of the given
// kind who's name's are in the first array and not the second. If both arrays are empty, prints the list of all types 
// of the given kind. If the first boolean is true the printed types will have headers. If the second is true, the 
// printed types will have descriptions.
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

// shouldSkip(String) ==> Boolean
// Takes the name of a type and returns true iff it should be skipped
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
  // Constructor
  constructor(props) {
    super(props);
  }

  // Render
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
