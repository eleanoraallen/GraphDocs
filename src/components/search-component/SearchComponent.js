import React, { Component } from 'react';
import '.search_style.css';

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

// makeLink(getType(type), types)

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
export default class TypeListComponent extends Component {
  constructor(props) {
    super(props);
  }

  // this.props.types

  render() {
    return <div>:)</div>
  }
}
