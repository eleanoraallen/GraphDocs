import 'core-js';
import React, { Component } from 'react';
import {js_beautify} from 'js-beautify';
import CodeMirror from 'react-codemirror';
import 'codemirror-graphql/mode';
import '../example-component/example_style.css';
import './staticExample-theme.css'

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

//  ----------------------------------------------------------------------------------------
// # Component
//  ----------------------------------------------------------------------------------------

// Component Class
export default class ExampleComponent extends Component {
  constructor(props) {
    super(props);
  }

  options = {
    readOnly: !this.props.editable,
    lineNumbers: true,
    mode: 'graphql',
    theme: 'staticExample-theme',
    lineWrapping: true,
  };

  render() {
    return (
        <p><CodeMirror
            id='mirrorWindow'
            name='staticMirror'
            value={replaceText(this.props.input, this.props.autoformat)}
            mode='graphql'
            options={{
                readOnly: !this.props.editable,
                lineNumbers: true,
                mode: 'graphql',
                theme: 'staticExample-theme',
                lineWrapping: true,
              }} /></p>
    );
  }
}