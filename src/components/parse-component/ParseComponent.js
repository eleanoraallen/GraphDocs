import React, { useMemo } from 'react';
import { ApolloClient } from 'apollo-boost';
import { HttpLink } from 'apollo-link-http';
import { ApolloProvider, Query } from 'react-apollo';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { setContext } from 'apollo-link-context';
import gql from 'graphql-tag';
import { Token, ClientID, Endpoint } from '../../custom/authorization';
import ReactMarkdown from 'react-markdown';
import Sidebar from 'react-sidebar';
import PropagateLoader from 'react-spinners/PropagateLoader';
import ExampleComponent from '../example-component/ExampleComponent';
import StaticExampleComponent from '../staticExample-component/StaticExampleComponent'
import TypeComponent from '../type-component/TypeComponent';
import OperationTableComponent from '../operationTable-component/OperationTableComponent';
import TypeListComponent from '../typeList-component/TypeListComponent';

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
const clientLink = new HttpLink({ uri: Endpoint });
const client = new ApolloClient({
  cache: clientCache,
  link: authLink.concat(clientLink),
});

// String used to build introspection query
const QueryString = 'query{__schema{ ' +
  'types{kind name possibleTypes{name}inputFields{name description type{name ofType{name}}}description enumValues{name}fields{name description type{name ofType{name}}}} ' + 
  'queryType{fields{name description type {name ofType{name ofType{name}}}args{name description type {name ofType {name}}}}} ' + 
  'subscriptionType{fields{name description type {name ofType{name ofType{name}}}args{name description type {name ofType {name}}}}} ' +
  'mutationType{fields{name description type{name ofType{name ofType{name}}}args{name description type {name ofType {name}}}}}}}';

//  ----------------------------------------------------------------------------------------
// # Functions
//  ----------------------------------------------------------------------------------------

/**
 * parses the body of a page
 * 
 * @param toParse<String> the string to be parsed (generaly the contents of some .md file)
 * @param shouldMergeColumns<Boolean> true iff columns should be merged
 * 
 * @return<div>{[ReactComponent]}</div> the parsed body of the page
 */
function parseBody(toParse, shouldMergeColumns, data) {
  toParse = removeComments(toParse);
  return(
      <div id='docBody' className='DocSearch-content'>
        <Query query={gql(QueryString)}>
        {({ loading, data, error }) => {
          if (loading) return(
            <div>
              <div style={{
              position: 'absolute', left: '50%', top: '45%',
              transform: 'translate(-50%, -50%)'}}>
                <PropagateLoader
                  sizeUnit={"px"}
                  size={40}
                  color={'rgba(17, 116, 230, 0.6)'}
                  loading={true}/>
              </div>
              <div style={{
                position: 'absolute', left: '51.5%', top: '52.5%',
                transform: 'translate(-50%, -50%)',  fontWeight: 'normal',}}>
                <p>Preforming Schema Introspection Query...</p></div>
            </div>);
          if (error) return <p>{JSON.stringify(error)}</p>;
          if (data) {
            let output = [];
            while (toParse.length > 0) {
              if (toParse.substring(0, 6) === '<Body>') {
                let inside = '';
                while (toParse.substring(0, 7) !== '</Body>') {
                  inside = inside + toParse[0];
                  toParse = toParse.slice(1);
                }
                output.push(parseBodyInside(inside.replace('<Body>', ''), shouldMergeColumns, data));
              } else {
                toParse = toParse.slice(1);
              }
            }
            return output;
            // return <p>{JSON.stringify(data)}</p>;
          }}}
        </Query>
      </div>
  );
}

// function parseBody(toParse, shouldMergeColumns, data) {
//   data = JSON.parse(data);
//   toParse = removeComments(toParse);
//             let output = [];
//             while (toParse.length > 0) {
//               if (toParse.substring(0, 6) === '<Body>') {
//                 let inside = '';
//                 while (toParse.substring(0, 7) !== '</Body>') {
//                   inside = inside + toParse[0];
//                   toParse = toParse.slice(1);
//                 }
//                 output.push(parseBodyInside(inside.replace('<Body>', ''), shouldMergeColumns, data));
//               } else {
//                 toParse = toParse.slice(1);
//               }
//             }
//             return output;
// }

/**
 * parses the inside of a page's body
 * 
 * @param toParse<String> the string to be parsed up to an instance of <Body> exclusive
 * @param shouldMergeColumns<Boolean> true iff columns should be merged
 * 
 * @return<div>{[ReactComponent]}</div> the parsed body of the page
 */
function parseBodyInside(toParse, shouldMergeColumns, data) {
  let output = [];
  while (toParse.length > 0) {
    if (toParse.substring(0, 6) === '<Left>') {
      const parsed = parseLeft(toParse.replace('<Left>', ''), shouldMergeColumns, data);
      output.push(parsed[1]);
      toParse = parsed[0];
    }
    if (toParse.substring(0, 6) === '<Full>') {
      const parsed = parseFull(toParse.replace('<Full>', ''), data);
      output.push(parsed[1]);
      toParse = parsed[0];
    }
    if (toParse.substring(0, 6) === '<Line>') {
      output.push(<hr />);
      toParse = toParse.replace('<Line>', '');
    } else {
      toParse = toParse.slice(1);
    }
  }
  return <div>{output}</div>;
}

/**
 * parses a string from an instance of <Left> to its coresponding </Right>
 * 
 * @param toParse<String> the string to be parsed up to an instance of <Left> exclusive
 * @param shouldMergeColumns<Boolean> true iff columns should be merged
 * @param data<data> the data resulting from a schema introspection query
 * 
 * @return<[String, <div>{[ReactComponent]}</div>]> An array who's first element is the rest of the string after </Right> exclusive
 *        and the second element the an array of react components that is the result of the parse.
 */
function parseLeft(toParse, shouldMergeColumns, data) {
  let inside = '';
  while (toParse.substring(0, 8) !== '</Right>') {
    inside = inside + toParse[0];
    toParse = toParse.slice(1);
  }
  toParse = toParse.replace('</Right>', '');

  let leftCol = '';
  while (inside.substring(0, 7) !== '</Left>') {
    leftCol = leftCol + inside[0];
    inside = inside.slice(1);
  }
  while (inside.substring(0, 7) !== '<Right>') {
    inside = inside.slice(1);
  }
  let rightCol = inside.replace('<Right>', '');
  let rightContent;
  if (!rightCol.includes('<Example')) {
  rightContent = [parseInside(rightCol, data), <div id='darkMirror'><ExampleComponent input='Trans Rights!' autoformat={true} /></div>];
  } else {
    rightContent = parseInside(rightCol, data);
  }

  if (shouldMergeColumns) {
    const leftTable = (
      <table id='appTable'>
        <tr>
          <td>{parseInside(leftCol, data)}</td>
        </tr>
      </table>
    );
    const rightTable = (
      <table id='appTable'>
        <tr>
          <td>{parseInside(rightCol, data)}</td>
        </tr>
      </table>
    );
    return [toParse, [leftTable, rightTable]];
  } else {
    const outputTable = (
      <table id='appTable'>
        <tr>
          <td>{parseInside(leftCol, data)}</td>
          <td>{rightContent}</td>
        </tr>
      </table>
    );
    return [toParse, outputTable];
  }
}

/**
 * parses a string from an instance of <Full> to its coresponding </Full>
 * 
 * @param toParse<String> the string to be parsed up to an instance of <Left> exclusive
 * @param data<data> the data resulting from a schema introspection query
 * 
 * @return<[String, <div>{[ReactComponent]}</div>]> An array who's first element is the rest of the string after </Full> exclusive
 *        and the second element the an array of react components that is the result of the parse.
 */
function parseFull(toParse, data) {
  let inside = '';
  while (toParse.substring(0, 7) !== '</Full>') {
    inside = inside + toParse[0];
    toParse = toParse.slice(1);
  }
  toParse = toParse.replace('</Full>', '');
  const outputTable = (
    <table id='appTable'>
      <tr>
        <td>{parseInside(inside, data)}</td>
      </tr>
    </table>
  );
  return [toParse, outputTable];
}

/**
 * parses the inside of a body element (<Left>, <Right>, or <Full>)
 * 
 * @param toParse<String> the string to be parsed
 * @param data<data> the data resulting from a schema introspection query
 * 
 * @return<div>{[ReactComponent]}</div> the parsed string
 */
function parseInside(toParse, data) {
  let output = [];
  let section = '';
  while (toParse.length > 0) {
    if (toParse.substring(0, 8) === '<Example') {
      output.push(
        <ReactMarkdown
          source={section}
          renderers={{ heading: props => headingRenderer(props) }}
        />,
      );
      section = '';
      const parsed = parseExample(toParse.replace('<Example', ''));
      output.push(parsed[1]);
      toParse = parsed[0];
    }
    if (toParse.substring(0, 14) === '<StaticExample') {
      output.push(
        <ReactMarkdown
          source={section}
          renderers={{ heading: props => headingRenderer(props) }}
        />,
      );
      section = '';
      const parsed = parseStaticExample(toParse.replace('<StaticExample', ''));
      output.push(parsed[1]);
      toParse = parsed[0];
    }
    if (toParse.substring(0, 9) === '<TypeList') {
      output.push(
        <ReactMarkdown
          source={section}
          renderers={{ heading: props => headingRenderer(props) }}
        />,
      );
      section = ''
      const parsed = parseTypeList(toParse.replace('<TypeList', ''), data.__schema.types);
      output.push(parsed[1]);
      toParse = parsed[0];
    } else if (toParse.substring(0, 5) === '<Type') {
      output.push(
        <ReactMarkdown
          source={section}
          renderers={{ heading: props => headingRenderer(props) }}
        />,
      );
      section = ''
      const parsed = parseType(toParse.replace('<Type', ''), data.__schema.types);
      output.push(parsed[1]);
      toParse = parsed[0];
    }
    if (toParse.substring(0, 15) === '<OperationTable') {
      output.push(
        <ReactMarkdown
          source={section}
          renderers={{ heading: props => headingRenderer(props) }}
        />,
      );
      section = ''
      const parsed = parseOperationTable(toParse.replace('<OperationTable', ''), data);
      output.push(parsed[1]);
      toParse = parsed[0];
    }
    if (toParse.substring(0, 6) === '<Line>') {
      output.push(
        <ReactMarkdown
          source={section}
          renderers={{ heading: props => headingRenderer(props) }}
        />,
      );
      section = '';
      output.push(<hr />);
      toParse = toParse.replace('<Line>', '');
    } else {
      section = section + toParse[0];
      toParse = toParse.slice(1);
    }
  }
  output.push(
    <ReactMarkdown
      source={section}
      renderers={{ heading: props => headingRenderer(props) }}
    />,
  );
  return output;
}

/**
 * parses an Example
 * @param toParse<String> the string to be parsed up to an instance of '<Example' exclusive
 * @return<[String, <ExampleComponent />]> an array who's first element is the rest of the given string after '</Example>' exclusive
 *        and who's second is the parsed ExampleComponent
 */
function parseExample(toParse) {
  let props = '';
  while (toParse.substring(0, 1) !== '>') {
    props = props + toParse[0];
    toParse = toParse.slice(1);
  }
  toParse = toParse.replace('>', '');
  const autoformat = !props.includes('autoformat=false');
  const isStatic = props.includes('static=true');
  let input = '';
  while (toParse.substring(0, 10) !== '</Example>') {
    input = input + toParse[0];
    toParse = toParse.slice(1);
  }
  toParse = toParse.replace('</Example>', '');
  if (isStatic) {
    return [toParse, <StaticExampleComponent input={input} autoformat={autoformat} editable={false} />]
  } else {
    return [toParse, <ExampleComponent input={input} autoformat={autoformat} />];
  }
}

/**
 * parses a Static Example
 * @param toParse<String> the string to be parsed up to an instance of '<StaticExample' exclusive
 * @return<[String, <StaticExampleComponent />]> an array who's first element is the rest of the given string after '</StaticExample>' exclusive
 *        and who's second is the parsed ExampleComponent
 */
function parseStaticExample(toParse) {
  let props = '';
  while (toParse.substring(0, 1) !== '>') {
    props = props + toParse[0];
    toParse = toParse.slice(1);
  }
  toParse = toParse.replace('>', '');
  const autoformat = !props.includes('autoformat=false');
  const editable = !props.includes('editable=true');
  let input = '';
  while (toParse.substring(0, 16) !== '</StaticExample>') {
    input = input + toParse[0];
    toParse = toParse.slice(1);
  }
  toParse = toParse.replace('</StaticExample>', '');
  return [toParse, <StaticExampleComponent input={input} autoformat={autoformat} editable={editable} />]
}

/**
 * parses a Type
 * 
 * @param toParse<String> the string to be parsed up to an instance of '<Type' exclusive
 * @param data<data> the data resulting from a schema introspection query
 * 
 * @return<[String, <TypeComponent />]> an array who's first element is the rest of the given string after '</Type>' exclusive
 *        and who's second is the parsed Type
 */
function parseType(toParse, types) {
  let props = '';
  while (toParse.substring(0, 1) !== '>') {
    props = props + toParse[0];
    toParse = toParse.slice(1);
  }
  toParse = toParse.replace('>', '');
  const printHeader = !props.includes('printHeader=false');
  const printDescriptions = !props.includes('printDescriptions=false');
  let typeName = '';
  while (toParse.substring(0, 7) !== '</Type>') {
    typeName = typeName + toParse[0];
    toParse = toParse.slice(1);
  }
  toParse = toParse.replace('</Type>', '');
  return [
    toParse,
    <TypeComponent
      types={types}
      typeName={typeName}
      printHeader={printHeader}
      printDiscriptions={printDescriptions}
    />,
  ];
}

/**
 * parses a TypeList
 * @param toParse<String> the string to be parsed up to an instance of '<TypeList' exclusive
 * @param data<data> the data resulting from a schema introspection query
 * @return<[String, <TypeListComponent />]> an array who's first element is the rest of the given string after '</TypeList>' exclusive
 *        and who's second is the parsed Type
 */
function parseTypeList(toParse, types) {
  let props = '';
  while (toParse.substring(0, 1) !== '>') {
    props = props + toParse[0];
    toParse = toParse.slice(1);
  }
  toParse = toParse.replace('>', '');
  const printHeaders = !props.includes('printHeaders=false');
  const printDescriptions = !props.includes('printDescriptions=false');
  const showLines = !props.includes('showLines=false');
  let include = [];
  if (props.includes('include=[')) {
    include = props
      .split('include=[')[1]
      .split(']')[0]
      .split(' ');
  }
  let exclude = [];
  if (props.includes('exclude=[')) {
    exclude = props
      .split('exclude=[')[1]
      .split(']')[0]
      .split(' ');
  }
  let typeKind = '';
  while (toParse.substring(0, 11) !== '</TypeList>') {
    typeKind = typeKind + toParse[0];
    toParse = toParse.slice(1);
  }
  toParse = toParse.replace('</TypeList>', '');
  return [
    toParse,
    <TypeListComponent
      types={types}
      typeKind={typeKind}
      include={include}
      exclude={exclude}
      printHeaders={printHeaders}
      printDescriptions={printDescriptions}
      showLines={showLines}
    />,
  ];
}

/**
 * parses an OperationTable
 * 
 * @param toParse<String> the string to be parsed up to an instance of '<OperationTable' exclusive
 * @param data<data> the data resulting from a schema introspection query
 * 
 * @return<[String, <OperationTableComponent />]> an array who's first element is the rest of the given string after 
 *        '</OperationTable>' exclusive and who's second is the parsed Type
 */
function parseOperationTable(toParse, data) {
  let props = '';
  while (toParse.substring(0, 1) !== '>') {
    props = props + toParse[0];
    toParse = toParse.slice(1);
  }
  toParse = toParse.replace('>', '');
  let include = [];
  if (props.includes('include=[')) {
    include = props
      .split('include=[')[1]
      .split(']')[0]
      .split(' ');
  }
  let exclude = [];
  if (props.includes('exclude=[')) {
    exclude = props
      .split('exclude=[')[1]
      .split(']')[0]
      .split(' ');
  }
  let operationType = '';
  while (toParse.substring(0, 17) !== '</OperationTable>') {
    operationType = operationType + toParse[0];
    toParse = toParse.slice(1);
  }
  toParse = toParse.replace('</OperationTable>', '');

  return [
    toParse,
    <OperationTableComponent
      data={data}
      operationType={operationType}
      include={include}
      exclude={exclude}
    />,
  ];
}

/**
 * parses the sidebar of a page 
 * @param toParse<String> the string to be parsed (generaly the contents of some .md file)
 * @return<div>{[ReactComponent]}</div> the parsed sidebar
 */
function parseSidebar(toParse) {
  toParse = removeComments(toParse);
  let output = [];
  while (toParse.length > 0) {
    if (toParse.substring(0, 9) === '<Sidebar>') {
      let inside = '';
      while (toParse.substring(0, 10) !== '</Sidebar>') {
        inside = inside + toParse[0];
        toParse = toParse.slice(1);
      }
      output.push(parseSidebarInside(inside.replace('<Sidebar>', '')));
    } else {
      toParse = toParse.slice(1);
    }
  }
  return <div id='docSidebar'>{output}</div>;
}

/**
 * parses the inside of a page's sidebar
 * @param toParse<String> the string to be parsed up to an instance of <Sidebar> exclusive
 * @return<div>{[ReactComponent]}</div> the parsed sidebar
 */
function parseSidebarInside(toParse) {
  let output = [];
  while (toParse.length > 0) {
    if (toParse.substring(0, 6) === '<Logo>') {
      let parsed = parseLogo(toParse.replace('<Logo>', ''));
      output.push(parsed[1]);
      toParse = parsed[0];
    }
    if (toParse.substring(0, 8) === '<Header>') {
      let parsed = parseHeader(toParse.replace('<Header>', ''));
      output.push(parsed[1]);
      toParse = parsed[0];
    }
    if (toParse.substring(0, 11) === '<Subheader>') {
      let parsed = parseSubheader(toParse.replace('<Subheader>', ''));
      output.push(parsed[1]);
      toParse = parsed[0];
    }
    if (toParse.substring(0, 6) === '<Line>') {
      output.push(<hr />);
      toParse = toParse.replace('<Line>', '');
    } else {
      toParse = toParse.slice(1);
    }
  }
  return output;
}

/**
 * parses a logo
 * @param toParse<String> the string to be parsed up to an instance of <Logo> exclusive
 * @return<[String, <img />]> an array who's first element is rest of the string after </Logo> exclusive and the second
 *        is the parsed logo
 */
function parseLogo(toParse) {
  let link = '';
  while (toParse.substring(0, 7) !== '</Logo>') {
    link = link + toParse[0];
    toParse = toParse.slice(1);
  }
  toParse = toParse.replace('</Logo>', '');
  return [
    toParse,
    <a href={link} target='_blank'>
      {' '}
      <img src={process.env.PUBLIC_URL + '/logo.png'} width='172' />{' '}
    </a>,
  ];
}

/**
 * parses a header
 * @param s<String> the string to be parsed up to an instance of <Subheader> exclusive
 * @return<[String, <ReactMarkdown />]> an array who's first element is rest of the string after </Header> exclusive and the second
 *        is the parsed Header
 */
function parseHeader(s) {
  let src = '';
  while (s.substring(0, 9) !== '</Header>') {
    src = src + s[0];
    s = s.slice(1);
  }
  s = s.replace('</Header>', '');
  return [s, <ReactMarkdown id='header' source={src} />];
}

/**
 * parses a header
 * @param s<String> the string to be parsed up to an instance of <Subheader> exclusive
 * @return<[String, <ReactMarkdown />]> an array who's first element is rest of the string after </Subheader> exclusive and the second
 *        is the parsed Header
 */
function parseSubheader(s) {
  let src = '';
  while (s.substring(0, 12) !== '</Subheader>') {
    src = src + s[0];
    s = s.slice(1);
  }
  s = s.replace('</Subheader>', '');
  return [
    s,
    <ReactMarkdown id='subheader' source={'   &nbsp; &nbsp;   ' + src} />,
  ];
}

/**
 * removes all comments 
 * @param s<String> the string from which comments will be removed
 * @return<String> the string with comments removed
 */
function removeComments(s) {
  let output = '';
  while (s.length > 0) {
    if (s.substring(0, 2) === '/*') {
      while (s.substring(0, 2) !== '*/') {
        s = s.slice(1);
      }
      s.replace('*/', '');
    } else {
      output = output + s[0];
      s = s.slice(1);
    }
  }
  return output;
}

/**
 * gives a header the proper id
 * @param props<Object> some header
 * @return<ReactElement> that header with an id thats same as the given header's name w/ special characters replaced w/ '-'
 */
function headingRenderer(props) {
  var children = React.Children.toArray(props.children);
  var text = children.reduce(flatten, '');
  var slug = text.toLowerCase().replace(/\W/g, '-');
  return React.createElement('h' + props.level, { id: slug }, props.children);
}

/**
 * flattens react element into array
 * 
 * @param text<String>
 * @param child<String>
 * 
 * @return<ReactElement> that header with an id thats same as the given header's name w/ special characters replaced w/ '-'
 */ 
function flatten(text, child) {
  return typeof child === 'string'
    ? text + child
    : React.Children.toArray(child.props.children).reduce(flatten, text);
}

//  ----------------------------------------------------------------------------------------
// # Component
//  ----------------------------------------------------------------------------------------

// Component Class
export default function ParseComponent({ showSidebar, mergeColumns, input, backup }) {
  const memoizedOutput = useMemo(() =>
  <ApolloProvider client={client}>
    <Sidebar
      sidebar={parseSidebar(input)}
      open={showSidebar}
      docked={showSidebar}
      transitions={false}
      shadow={false}
      touch={false}
      styles={{ sidebar: { width: '200px' } }}>
      <b>{parseBody(input, mergeColumns, backup)}</b>
    </Sidebar>
    </ApolloProvider>,
    [mergeColumns, showSidebar]
  );
  return(memoizedOutput);
}
