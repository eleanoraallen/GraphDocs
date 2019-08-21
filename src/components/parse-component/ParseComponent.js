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
import ExampleComponent from '../example-component/ExampleComponent';
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

// parseBody(String, Boolean) ==> <div>{[ReactComponent]}</div>
// Takes a string that is the contents of some .md file and a boolean which is true iff the content should be
// rendered all in one column and parses the string, producing a div which contains the contents of the .md file's body.
function parseBody(toParse, shouldMergeColumns) {
  toParse = removeComments(toParse);
  return(
      <div id='docBody' className='DocSearch-content'>
        <Query query={gql(QueryString)}>
        {({ loading, data, error }) => {
          if (loading) return <p>{`   Loading Documentation...`}</p>;
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
          }}}
        </Query>
      </div>
  );
}

// parseBodyInside(String, Boolean, data) ==> <div>{[ReactComponent]}</div>
// Takes a string that is the contents of some .md file up to an instance of <Body> exclusive, a boolean which is true iff the
// content should be rendered all in one column, and a the data resulting from an introspection query and parses the string to 
// the first instance of </Body> inclusicve, returning the result.
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

// parseBodyInside(String, Boolean, data) ==> [String, <div>{[ReactComponent]}</div>]
// Takes a string that is the contents of some .md file up to an instance of <Left> exclusive, a boolean which is true iff the 
// result should be rendered as one column, and the data resulting from an introspection query and parses the string to the 
// first instance of </Right> inclusive, returning an array where the first element is the rest of the string after </Right> 
// and the second element the an array of react components that is the result of the parse.
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

// parseFull(String, data) ==> [String, <div>{[ReactComponent]}</div>]
// Takes a string that is the contents of some .md file up to an instance of <Full> exclusive, the data resulting from
// an introspection query, and the array of types and parses the string up to the first instance of </Full> inclusive, 
// returning an array where the first element is the rest of the string after </Full> and the second element is the array
// of react components that is the result of the parse.
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

// parseInside(String, data) ==> [String, <div>{[ReactComponent]}</div>]
// Takes a string that is the contents of some .md file between instances of <Left></Left>, <Right></Right> or <Full></Full> 
// tags, and the data resulting from an introspection query and parses the string, returning the array of react components 
// that is the result of the parse.
function parseInside(s, data) {
  let output = [];
  let section = '';
  while (s.length > 0) {
    if (s.substring(0, 8) === '<Example') {
      output.push(
        <ReactMarkdown
          source={section}
          renderers={{ heading: props => headingRenderer(props) }}
        />,
      );
      section = '';
      const parsed = parseExample(s.replace('<Example', ''));
      output.push(parsed[1]);
      s = parsed[0];
    }
    if (s.substring(0, 9) === '<TypeList') {
      output.push(
        <ReactMarkdown
          source={section}
          renderers={{ heading: props => headingRenderer(props) }}
        />,
      );
      section = ''
      const parsed = parseTypeList(s.replace('<TypeList', ''), data.__schema.types);
      output.push(parsed[1]);
      s = parsed[0];
    } else if (s.substring(0, 5) === '<Type') {
      output.push(
        <ReactMarkdown
          source={section}
          renderers={{ heading: props => headingRenderer(props) }}
        />,
      );
      section = ''
      const parsed = parseType(s.replace('<Type', ''), data.__schema.types);
      output.push(parsed[1]);
      s = parsed[0];
    }
    if (s.substring(0, 15) === '<OperationTable') {
      output.push(
        <ReactMarkdown
          source={section}
          renderers={{ heading: props => headingRenderer(props) }}
        />,
      );
      section = ''
      const parsed = parseOperationTable(s.replace('<OperationTable', ''), data);
      output.push(parsed[1]);
      s = parsed[0];
    }
    if (s.substring(0, 6) === '<Line>') {
      output.push(
        <ReactMarkdown
          source={section}
          renderers={{ heading: props => headingRenderer(props) }}
        />,
      );
      section = '';
      output.push(<hr />);
      s = s.replace('<Line>', '');
    } else {
      section = section + s[0];
      s = s.slice(1);
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

// parseExample(String) ==> <ExampleComponent />
// Takes a string that is the contents of some .md file up to an instance of <Example exclusive and parses the string
// up to the first instance of </Example> inclusive, returning an array where the first element is the rest of the string
// after </Example> and the second element is the ExampleComponent that is the result of the parse.
function parseExample(toParse) {
  let props = '';
  while (toParse.substring(0, 1) !== '>') {
    props = props + toParse[0];
    toParse = toParse.slice(1);
  }
  toParse = toParse.replace('>', '');
  const autoformat = !props.includes('autoformat=false');
  let input = '';
  while (toParse.substring(0, 10) !== '</Example>') {
    input = input + toParse[0];
    toParse = toParse.slice(1);
  }
  toParse = toParse.replace('</Example>', '');
  return [toParse, <ExampleComponent input={input} autoformat={autoformat} />];
}

// parseType(String, data) ==> <TypeComponent />
// Takes a string that is the contents of some .md file up to an instance of <Type exclusive and the array of types and
// parses the string up to the first instance of </Type> inclusive, returning an array where the first element is the 
// rest of the string after </Type> and the second element is the TypeComponent that is the result of the parse.
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

// parseTypeList(String) ==> <TypeListComponent />
// Takes a string that is the contents of some .md file up to an instance of <TypeList exclusive and the array of types and
// parses the string up to the first instance of </TypeList> inclusive, returning an array where the first element is the rest 
// of the string after </TypeList> and the second element is the TypeListComponent that is the result of the parse.
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

// parseOperationTable(String) ==> <OperationTableComponent />
// Takes a string that is the contents of some .md file up to an instance of <OperationTable exclusive and the data resulting from
// an introspection query and parses the string up to the first instance of </OperationTable> inclusive, returning an array where 
// the first element is the rest of the string after </OperationTable> and the second element is the OperationTableComponent that
//  is the result of the parse.
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

// parseSidebar(String) ==> <div>{[ReactComponent]}</div>
// Takes a string that is the contents of some .md file and parses the string, producing a div which contains
// the contents of the .md file's sidebar.
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

// parseBodyInside(String, Boolean) ==> <div>{[ReactComponent]}</div>
// Takes a string that is the contents of some .md file up to an instance of <Sidebar> exclusive and parses
// the string to the first instance of </Sidebar> inclusicve, returning the result.
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

// parseLogo(String) ==> <OperationTableComponent />
// Takes a string that is the contents of some .md file up to an instance of <Logo> exclusive and parses the string
// up to the first instance of </Logo> inclusive, returning an array where the first element is the rest of the string
// after </Logo> and the second element is the img that is the result of the parse.
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

// parseHeader(String) ==> <ReactMarkdown />
// Takes a string that is the contents of some .md file up to an instance of <Header> exclusive and parses the string
// up to the first instance of </Header> inclusive, returning an array where the first element is the rest of the string
// after </Header> and the second element is the ReactMarkdown Component that is the result of the parse.
function parseHeader(s) {
  let src = '';
  while (s.substring(0, 9) !== '</Header>') {
    src = src + s[0];
    s = s.slice(1);
  }
  s = s.replace('</Header>', '');
  return [s, <ReactMarkdown id='header' source={src} />];
}

// parseSubheader(String) ==> <ReactMarkdown />
// Takes a string that is the contents of some .md file up to an instance of <Subheader> exclusive and parses the string
// up to the first instance of </Subheader> inclusive, returning an array where the first element is the rest of the string
// after </Subheader> and the second element is the ReactMarkdown Component that is the result of the parse.
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

// removeComments(String) ==> String
// Takes a string and returns that string with all comments (chars between /* */) removed
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

// headingRenderer(props) ==> Header
// takes a props object representing some header <h1>-<h6> and returns a header with an id that is
// the same as the given header's name w/ special characters replaced w/ '-'
function headingRenderer(props) {
  var children = React.Children.toArray(props.children);
  var text = children.reduce(flatten, '');
  var slug = text.toLowerCase().replace(/\W/g, '-');
  return React.createElement('h' + props.level, { id: slug }, props.children);
}

function flatten(text, child) {
  return typeof child === 'string'
    ? text + child
    : React.Children.toArray(child.props.children).reduce(flatten, text);
}

//  ----------------------------------------------------------------------------------------
// # Component
//  ----------------------------------------------------------------------------------------

// Component Class
export default function ParseComponent({ showSidebar, mergeColumns, input }) {
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
      <b>{parseBody(input, mergeColumns)}</b>
    </Sidebar>
    </ApolloProvider>,
    [mergeColumns, showSidebar]
  );
  return(memoizedOutput);
}
