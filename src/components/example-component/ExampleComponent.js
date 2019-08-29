import 'core-js';
import React, { Component } from 'react';
import { ApolloClient } from 'apollo-boost';
import { HttpLink } from 'apollo-link-http';
import { ApolloProvider, Query, Mutation, Subscription } from 'react-apollo';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { setContext } from 'apollo-link-context';
import {js_beautify} from 'js-beautify';
import CodeMirror from 'react-codemirror';
import 'codemirror-graphql/mode';
import gql from 'graphql-tag';
import './example_style.css';
import './input-theme.css';
import './output-theme.css';
import { Token, ClientID, Endpoint } from '../../custom/authorization';

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
let inputOptions = {
  lineNumbers: true,
  mode: 'graphql',
  theme: 'input-theme',
  lineWrapping: true,
};
let outputOptions = {
  lineNumbers: true,
  mode: 'json',
  theme: 'output-theme',
  lineWrapping: true,
};

//  ----------------------------------------------------------------------------------------
// # Functions
//  ----------------------------------------------------------------------------------------

/**
 * autoformats/replaces generated input in an example's input
 * 
 * @param s<String> the input for an example
 * @param autoformat<Boolean> true iff text should be autoformatted
 * 
 * @return<String> the formatted/replaced string
 */
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
      while (s[0] !== ')' && s.length > 0) {
        params = params + s[0];
        s = s.slice(1);
      }
      s = s.slice(1);
      params = params.split(" ");
      output = output + generateInt(parseInt(params[0]), params[1] === 'true');
    }
    if (s.substring(0, 14) === 'generateFloat(') {
      s = s.replace('generateFloat(');
      let params = '';
      while (s[0] !== ')' && s.length > 0) {
        params = params + s[0];
        s = s.slice(1);
      }
      s = s.slice(1);
      params = params.replace('undefined', '').split(" ");
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

/**
 * autoformats a given string
 * @param s<String> the input for an example
 * @return<String> the formatted string
 */
function formatText(s) {
  return js_beautify(s, { indent_size: 2 });
}

/**
 * randomly generates a string of a given length
 * @param length<Int> the number of characters in the string
 * @return<String> the generated string
 */
function generateString(length) {
  let output = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
  const min = 0;
  const max = characters.length - 1;
  let i = 0;
  while (i < length) {
    output = output + characters.charAt((Math.random() * (max - min) + min) | 0);
    i++;
  }
  return '"' + output + '"';
}

/**
 * randomly generates a string representing an int of a given length
 * 
 * @param length<Int> the number of didgets in the int
 * @param canBeNegative<Boolean> true iff the int can be negative
 * 
 * @return<String> the generated int
 */
function generateInt(length, canBeNegative) {
  let output = '';
  const characters = '0123456789';
  const min = 0;
  const max = characters.length - 1;
  let i = 0;
  if (canBeNegative && Math.random() > 0.5) {
    output = output + '-';
  }
  if (i < length) {
    output = output + characters.charAt((Math.random() * (max - 1) + 1) | 0);
    i++;
  }
  while (i < length) {
    output = output + characters.charAt((Math.random() * (max - min) + min) | 0);
    i++;
  }
  return output;
}

/**
 * randomly generates a string representing a float of a given length
 * 
 * @param wholeLength<Int> the number of didgets in the whole part
 * @param fractionalLength<Int> the number of didgets in the fractional part
 * @param canBeNegative<Boolean> true iff the float can be negative
 * 
 * @return<String> the generated float
 */
function generateFloat(wholeLength, fractionalLength, canBeNegative) {
  let output = '';
  const characters = '0123456789';
  const min = 0;
  const max = characters.length - 1;
  let i = 0;
  if (canBeNegative && Math.random() > 0.5) {
    output = output + '-';
  }
  if (i < wholeLength) {
    output = output + characters.charAt((Math.random() * (max - 1) + 1) | 0);
    i++;
  }
  while (i < wholeLength) {
    output = output + characters.charAt((Math.random() * (max - min) + min) | 0);
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

/**
 * returns a given input as a CodeMirror Window
 * @param str<String> the input for the codemirror window
 * @return<CodeMirror /> the produced component
 */
function printOutput(str) {
  return <CodeMirror id='mirrorWindow' value={str} options={outputOptions} />;
}

/**
 * gets the value of inputText
 * @param startingText<String> the starting text
 * @return<String> the proper value of ExampleComponent.state.inputText
 */
function getStartingInput(startingText) {
  let startingInput;
  if (inputIsOperation(startingText, 'mutation')) {
    startingInput = startingText;
  } else {
    startingInput = '';
  }
  return startingInput;
}

/**
 * determines if a given string is an operation of the given type
 * 
 * @param input<String> some input
 * @param operation<STring> the type of operation (one of: 'query' 'mutation' or 'subscription')
 * 
 * @return<Boolean> true iff the given input is an operation of the given type
 */
function inputIsOperation(input, operation) {
  var spaceSplit = input.split(' ');
  var OBSplit = input.split('{');
  return (
    (spaceSplit.length > 0 && spaceSplit[0] === operation) ||
    (OBSplit.length > 0 && OBSplit[0] === operation)
  );
}

/**
 * returns a window containing the output of a Query, Mutation, or Subscription
 * 
 * @param loading<loading> the loading data from an operation
 * @param data<data> the data from an operation
 * @param error<error> the error data from an operation
 * @param override<Boolean> true if function should produce an empty window regardless of other fields
 * 
 * @return<ReactComponent /> the result of the operation
 */
function printOutputWindow(loading, data, error, override) {
  if (override) {
    return '';
  }
  if (loading) {
    return 'Loading...';
  }
  if (error) {
    return printOutput(JSON.stringify(error, null, 2));
  }
  if (data) {
    return printOutput(JSON.stringify(data, null, 2));
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

 /**
 * updates the code field
 * @param newCode<String> the new code
 */
  updateCode(newCode) {
    this.setState({
      code: newCode,
      inputText: '',
    });
  }

 /**
 * renders a query
 * @return<Query> the query component to be rendered
 */
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

/**
 * renders a mutation
 * @return<Mutation> the mutation component to be rendered
 */
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

/**
 * renders a subscription
 * @return<Mutation> the subscription component to be rendered
 */
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

 /**
 * sets this.outputText
 * @param loading<loading> the loading data from an operation
 * @param data<data> the data from an operation
 * @param error<error> the error data from an operation
 */
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

  /**
 * determines what component to render and renders it
 * @return<ReactComponent> the component that should be rendered given this component's states
 */
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
              options={inputOptions}
            />
          </p>
          <p>{this.renderMutation()}</p>
          {this.renderOutput()}
        </div>
      </ApolloProvider>
    );
  }
}