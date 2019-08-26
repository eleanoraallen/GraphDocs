import React, { useEffect, useState } from 'react';
import { render } from 'react-dom';
import './app_style.css';
import ParseComponent from './components/parse-component/ParseComponent';
import { mainPage, otherPages } from './custom/pages';

//  ----------------------------------------------------------------------------------------
// # Functions
//  ----------------------------------------------------------------------------------------

/**
 * Asyncronous function that gets the content for the main page from the mainPage markdown file
 * @return<String> The contents of the mainPage .md file
 */
async function getMainMd() {
  try {
    const res = await fetch('content/' + mainPage);
    const md = await res.text();
    return md;
  } catch (e) {}
}
getMainMd();

/**
 * Asyncronous function that gets the content for the main page from the otherPages[0] markdown file
 * @return<String> The contents of the .md file at otherPages[0]
 */
async function getOneMd() {
  try {
    const res = await fetch('content/' + otherPages[0]);
    const md = await res.text();
    return md;
  } catch (e) {}
}
getOneMd();

/**
 * Asyncronous function that gets the content for the main page from the otherPages[1] markdown file
 * @return<String> The contents of the .md file at otherPages[1]
 */
async function getTwoMd() {
  try {
    const res = await fetch('content/' + otherPages[1]);
    const md = await res.text();
    return md;
  } catch (e) {}
}
getTwoMd();

/**
 * Asyncronous function that gets the content for the main page from the otherPages[2] markdown file
 * @return<String> The contents of the .md file at otherPages[2]
 */
async function getThreeMd() {
  try {
    const res = await fetch('content/' + otherPages[2]);
    const md = await res.text();
    return md;
  } catch (e) {}
}
getThreeMd();

//  ----------------------------------------------------------------------------------------
// # App
//  ----------------------------------------------------------------------------------------

function App() {
  // Get main documenation markdown content
  const [Mainmd, setMainMd] = useState(null);
  useEffect(async () => {
    setMainMd(await getMainMd());
  }, []);

  // Get first other page markdown content
  const [Onemd, setOneMd] = useState(null);
  useEffect(async () => {
    setOneMd(await getOneMd());
  }, []);

  // Get second other page markdown content
  const [Twomd, setTwoMd] = useState(null);
  useEffect(async () => {
    setTwoMd(await getTwoMd());
  }, []);

  // Get third other page markdown content
  const [Threemd, setThreeMd] = useState(null);
  useEffect(async () => {
    setThreeMd(await getThreeMd());
  }, []);

  // Get Page Text (used to determine which page to rener)
  const splited = window.location.href.split('page=');
  let pageText;
  if (splited.length === 2) {
    pageText = splited[1];
  } else {
    pageText = '';
  }
  // Determine how to render page
  const [renderOptions, setRenderOptions] = React.useState({
    shouldShowSidebar: window.innerWidth > 730,
    shouldMergeColumns: window.innerWidth < 1200,
    toReturn: <div>;</div>,
  });

  // Detirmine if page needs to rerender
  React.useEffect(() => {
    const handleResize = function handleResize() {
      setRenderOptions({
        shouldShowSidebar: window.innerWidth > 730,
        shouldMergeColumns: window.innerWidth < 1200,
      });
    };

    window.addEventListener('resize', handleResize);

    return _ => {
      window.removeEventListener('resize', handleResize);
    };
  });
  
  // Render Reference Request
  if (pageText.includes('printType:')) {
    let input = '';
    if (pageText.split('printType:')[1].length > 1) {
      input = pageText.split('printType:')[1];
    }
    return (
      <ParseComponent
        input={`<Sidebar> <Logo>/</Logo> </Sidebar> <Body><Full> <Type>${input}</Type> </Full></Body>`}
        showSidebar={renderOptions.shouldShowSidebar}
        mergeColumns={renderOptions.shouldMergeColumns}
      />
    );
  }

  // render first other Page
  if (otherPages.length > 0 && pageText === otherPages[0].replace('.md', '')) {
    if (Onemd === null) {
      return <div />;
    } else {
      return (
        <ParseComponent
          input={Onemd}
          showSidebar={renderOptions.shouldShowSidebar}
          mergeColumns={renderOptions.shouldMergeColumns}
        />
      );
    }
  }
  // Render Second other Page
  if (otherPages.length > 1 && pageText === otherPages[1].replace('.md', '')) {
    if (Twomd === null) {
      return <div />;
    } else {
      return (
        <ParseComponent
          input={Twomd}
          showSidebar={renderOptions.shouldShowSidebar}
          mergeColumns={renderOptions.shouldMergeColumns}
        />
      );
    }
  }
  // Render Third other Page
  if (otherPages.length > 2 && pageText === otherPages[2].replace('.md', '')) {
    if (Threemd === null) {
      return <div />;
    } else {
      return (
        <ParseComponent
          input={Twomd}
          showSidebar={renderOptions.shouldShowSidebar}
          mergeColumns={renderOptions.shouldMergeColumns}
        />
      );
    }
  }
  // render Main documentation
  else {
    if (Mainmd === null) {
      return <div />;
    } else {
      return (
        <ParseComponent
          input={Mainmd}
          showSidebar={renderOptions.shouldShowSidebar}
          mergeColumns={renderOptions.shouldMergeColumns}
        />
      );
    }
  }
}

// Render App
render(<App />, document.getElementById('root'));
