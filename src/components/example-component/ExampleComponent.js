import 'core-js';
import React, { Component } from 'react';
import { ApolloClient } from 'apollo-boost';
import { HttpLink } from 'apollo-link-http';
import { ApolloProvider, Query, Mutation, Subscription } from 'react-apollo';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { setContext } from 'apollo-link-context';
import CodeMirror from 'react-codemirror';
import 'codemirror-graphql/mode';
import gql from 'graphql-tag';
import './example_style.css';
import { Token, ClientID, Endpoint } from '../../custom/authorization';
import {js_beautify} from 'js-beautify';

//  ----------------------------------------------------------------------------------------
// # Constants
//  ----------------------------------------------------------------------------------------

// Setup Client
const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      authorization: Token ? `Bearer ${Token}` : '',
      'x-client-id': ClientID,
    },
  };
});
const clientCache = new InMemoryCache();
const clientLink = new HttpLink({
  uri: Endpoint,
});
const client = new ApolloClient({
  cache: clientCache,
  link: authLink.concat(clientLink),
});

// CodeMirror options
let options = {
  lineNumbers: true,
  mode: 'graphql',
  theme: 'duotone-dark',
  lineWrapping: true,
};
let outputOptions = {
  lineNumbers: true,
  mode: 'json',
  theme: 'duotone-dark',
  lineWrapping: true,
};

//  ----------------------------------------------------------------------------------------
// # Functions
//  ----------------------------------------------------------------------------------------

// replaceText(String, Boolean) ==> String
// takes a string that is the input for an example and a boolean which is true iff the text is to be formatted
// and the string but with calls to generate inputs fufilled and (if the boolean is true) the text autoformatted
function replaceText(s, autoformat) {
  let output = '';
  while (s.length > 0) {
    if (s.substring(0, 15) === 'generateString(') {
      s = s.replace('generateString(', '');
      let params = '';
      while (s[0] !== ')') {
        params = params + s[0];
        s = s.slice(1);
      }
      s = s.slice(1);
      output = output + generateString(params.split(')')[0]);
    }
    if (s.substring(0, 12) === 'generateInt(') {
      s = s.replace('generateInt(', '');
      let params = '';
      while (s[0] !== ')') {
        params = params + s[0];
        s = s.slice(1);
      }
      s = s.slice(1);
      output = output + generateInt(parseInt(params[0]), params[1] === 'true');
    }
    if (s.substring(0, 14) === 'generateFloat(') {
      s = s.split('generateFloat(')[1];
      let params = '';
      while (s[0] !== ')') {
        params = params + s[0];
        s = s.slice(1);
      }
      s = s.slice(1);
      output =
        output +
        generateFloat(
          parseInt(params[0]),
          parseInt(params[1]),
          params[2] === 'true',
        );
    } else {
      output = output + s[0];
      s = s.slice(1);
    }
  }
  if (autoformat) {
    return formatText(output);
  } else {
    return output;
  }
}

// formatText(String) ==> String
// Takes a string that is the input for an example and returns a string that is the same as the given
// string but formatted to look good in a codemirror window.
function formatText(s) {
  return js_beautify(s, { indent_size: 2 });
}

// generateString(Int) ==> String
// Takes an int and produces a string of random characters who's length is equal to the given int
function generateString(length) {
  let output = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
  const min = 0;
  const max = characters.length - 1;
  let i = 0;
  while (i < length) {
    output =
      output + characters.charAt((Math.random() * (max - min) + min) | 0);
    i++;
  }
  return '"' + output + '"';
}

// generateInt(Int, Boolean) ==> String
// takes an int and a boolean and produces a string representing a randomly generated int. The number of didgets in
// the int is equal to the given int. If the boolean is true, the int has a 50% chance of being negative.
function generateInt(length, canBeNegative) {
  let output = '';
  const characters = '0123456789';
  const min = 0;
  const max = characters.length - 1;
  let i = 0;
  if (canBeNegative && Math.random() > 0.5) {
    output = output + '-';
  }
  while (i < length) {
    output =
      output + characters.charAt((Math.random() * (max - min) + min) | 0);
    i++;
  }
  return output;
}

// generateFloat(Int, Int, Boolean) ==> String
// takes two ints and a boolean and produces a string representing a randomly generated float. The number of
// digits in the float's whole part is equal to the first int, while the number of didgets in the fractional
// part is equal to the second int. If the given boolean is true the float has a 50% chance of being negative.
function generateFloat(wholeLength, fractionalLength, canBeNegative) {
  let output = '';
  const characters = '0123456789';
  const min = 0;
  const max = characters.length - 1;
  let i = 0;
  if (canBeNegative && Math.random() > 0.5) {
    output = output + '-';
  }
  while (i < wholeLength) {
    output =
      output + characters.charAt((Math.random() * (max - min) + min) | 0);
    i++;
  }
  output = output + '.';
  i = 0;
  while (i < fractionalLength) {
    output =
      output + characters.charAt((Math.random() * (max - min) + min) | 0);
    i++;
  }
  return output;
}

// printOutput(String) ==> <CodeMirror />
// takes a string and produces a CodeMirror component with the given string as its value
function printOutput(str) {
  return <CodeMirror id='mirrorWindow' value={str} options={outputOptions} />;
}

// getStartingInput(String) ==> String
// Takes a string that represents some starting texd and returns the proper value of ExampleComponent.state.inputText
function getStartingInput(startingText) {
  let startingInput;
  if (inputIsOperation(startingText, 'mutation')) {
    startingInput = startingText;
  } else {
    startingInput = '';
  }
  return startingInput;
}

// inputIsOperation(String, String) ==> Boolean
// Takes a string that represents some input and another string that is one of: 'query' 'mutation' or 'subscription'
// and returns true iff input should be an instance of the given operation type
function inputIsOperation(input, operation) {
  var spaceSplit = input.split(' ');
  var OBSplit = input.split('{');
  return (
    (spaceSplit.length > 0 && spaceSplit[0] === operation) ||
    (OBSplit.length > 0 && OBSplit[0] === operation)
  );
}

// printOutputWindow(loadding, data, error, boolean) ==> <CodeMirror /> | <p />
// takes the loading, data, and error params that result from a Query, Mutation, or Subscription and
// prints the result, unless the given boolean is true in which case it will produce an empty string.
function printOutputWindow(loading, data, error, override) {
  if (loading) {
    return 'Loading...';
  }
  if (error) {
    return printOutput(JSON.stringify(error, null, 2));
  }
  if (data) {
    return printOutput(JSON.stringify(data, null, 2));
  }
  if (override) {
    return '';
  } else {
    return printOutput('');
  }
}

//  ----------------------------------------------------------------------------------------
// # Component
//  ----------------------------------------------------------------------------------------

// Component Class
export default class ExampleComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      code: replaceText(this.props.input, this.props.autoformat),
      inputText: getStartingInput(
        replaceText(this.props.input, this.props.autoformat),
      ),
      hasWritten: false,
      outputText: '',
    };
  }

  // Updates the 'code' field
  updateCode(newCode) {
    this.setState({
      code: newCode,
      inputText: '',
    });
  }

  // Builds a Query Component
  renderQuery() {
    try {
      return (
        <Query query={gql(this.state.inputText)}>
          {({ loading, data, error }) => {
            this.setOutputText(loading, data, error);
            return printOutputWindow(loading, data, error);
          }}
        </Query>
      );
    } catch {
      return printOutput('');
    }
  }

  // Builds a Mutation Component
  renderMutation() {
    if (inputIsOperation(this.state.code, 'mutation')) {
      try {
        return (
          <Mutation mutation={gql(this.state.code)}>
            {(mutate, { loading, data, error }) => (
              <div>
                <button
                  onClick={e => {
                    this.setOutputText(loading, data, error);
                    e.preventDefault();
                    this.setState({
                      inputText: this.state.code,
                      hasWritten: true,
                    });
                    mutate();
                  }}>
                  {' '}
                  Run{' '}
                </button>
                <p>
                  {printOutputWindow(
                    loading,
                    data,
                    error,
                    !this.state.hasWritten,
                  )}
                </p>
              </div>
            )}
          </Mutation>
        );
      } catch {
        return (
          <div>
            <button
              onClick={e =>
                this.setState({ inputText: this.state.code, hasWritten: true })
              }>
              Run{' '}
            </button>
          </div>
        );
      }
    } else {
      return (
        <button
          onClick={e =>
            this.setState({ inputText: this.state.code, hasWritten: true })
          }>
          Run{' '}
        </button>
      );
    }
  }

  // Builds a Subscription Component
  renderSubscription() {
    try {
      return (
        <Subscription subscription={gql(this.state.inputText)}>
          {({ loading, data, error }) => {
            this.setOutputText(loading, data, error);
            return printOutputWindow(loading, data, error);
          }}
        </Subscription>
      );
    } catch {
      return printOutput('');
    }
  }

  // sets the component's outputText
  setOutputText(loading, data, error) {
    if (loading) {
      this.state.outputText = 'loading...';
    }
    if (error) {
      this.state.outputText = JSON.stringify(error, null, 2);
    }
    if (data) {
      this.state.outputText = JSON.stringify(data, null, 2);
    }
  }

  // Determines what Component to build and builds it
  renderOutput() {
    if (
      inputIsOperation(this.state.inputText, 'query') &&
      !inputIsOperation(this.state.code, 'mutation')
    ) {
      return this.renderQuery();
    }
    if (
      inputIsOperation(this.state.inputText, 'mutation') &&
      inputIsOperation(this.state.code, 'mutation')
    ) {
      return <p />;
    }
    if (
      inputIsOperation(this.state.inputText, 'subscription') &&
      !inputIsOperation(this.state.code, 'mutation')
    ) {
      return this.renderSubscription();
    } else {
      if (
        this.state.hasWritten &&
        !inputIsOperation(this.state.code, 'mutation')
      ) {
        return printOutput(this.state.outputText);
      } else {
        return <p />;
      }
    }
  }

  // Render
  render() {
    return (
      <ApolloProvider client={client}>
        <div>
          <p>
            <CodeMirror
              id='mirrorWindow'
              name='inputMirror'
              value={this.state.code}
              mode='graphql'
              onChange={this.updateCode.bind(this)}
              options={options}
            />
          </p>
          <p>{this.renderMutation()}</p>
          {this.renderOutput()}
        </div>
      </ApolloProvider>
    );
  }
}
