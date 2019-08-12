import React, { Component } from 'react';
import {ApolloClient} from "apollo-boost";
import { HttpLink } from 'apollo-link-http';
import {ApolloProvider, Query} from "react-apollo";
import { InMemoryCache } from 'apollo-cache-inmemory';
import { setContext } from 'apollo-link-context';
import gql from 'graphql-tag';
import './typeList_style.css';
import {Token, ClientID, Endpoint} from '../content/authorization';
import TypeComponent from '../type-component/TypeComponent';


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

// String used to get types
const ObjectString = 'query{__schema{types{kind name possibleTypes{name}inputFields{name description type{name ofType{' +
  'name}}} description enumValues{name description} fields{name description type{name ofType{name}}}}}}';

//  ----------------------------------------------------------------------------------------
// # Functions
//  ----------------------------------------------------------------------------------------


// printTypes(String, [String], [String], Boolean, Boolean) ==> <Query />
// takes the a kind of type (one of 'object', 'enum', 'input_object', 'interface', 'union', 'scalar', or 'all'), and two 
// arrays of strings and returns a Query that will produce a list of types of the given kind who's name's are in the first 
// array and not the second. If both arrays are empty, prints the list of all types of the given kind. If the first boolean 
// is true the printed types will have headers. If the second is true, the printed types will have descriptions.
function printTypes(typeKind, include, exclude, printHeaders, printDescriptions) {
  return(
    <Query query={gql(ObjectString)}>
    {({ loading, data, error}) => {
      if (loading) return(<p>Loading {typeKind} type List...</p>);
      if (error) { return(<p>Error Loading ${typeKind} type List!</p>)}
      if (data) {
        include = include.map(s => s.toLowerCase());
        exclude = exclude.map(s => s.toLowerCase());
        let types = data.__schema.types;
        types = types.filter(type => !shouldSkip(type.name) && (type.kind === typeKind.toUpperCase() || typeKind === 'all'));
        if (include.length > 0 ) {
          types = types.filter(type => include.includes(type.name.toLowerCase()));
         }
         if (exclude.length > 0) {
          types = types.filter(type => !exclude.includes(type.name.toLowerCase()));
         }
        types = types.sort((t1, t2) => {if (t1.name > t2.name) {return 1} else {return -1}});
        types = types.map(type => {
          return <TypeComponent typeName={type.name} printHeader={printHeaders} printDiscriptions={printDescriptions} />})
        return <div id='typeList'>{types}</div>
      }
    }}
    </Query>);
}

// shouldSkip(String) ==> Boolean
// Takes the name of a type and returns true iff it should be skipped
function shouldSkip(name) {
  return name === "Query" || name === "Subscription" || name === "Mutation" ||
    ((name.length > 1) && name.slice(0,2) === "__");
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
  return (
      <ApolloProvider client={client}>
        {printTypes(this.props.typeKind, this.props.include, 
          this.props.exclude, this.props.printHeaders, this.props.printDescriptions)}
      </ApolloProvider>
    );
  }
}