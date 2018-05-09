import * as React from 'react';
import * as ReactDOM from 'react-dom';
import styled from 'styled-components';
import Page, { Grid, GridColumn } from '@atlaskit/page';
import PageHeader from '@atlaskit/page-header';
import Button, { ButtonGroup } from '@atlaskit/button';
import * as CodeMirror from 'react-codemirror';
import SingleSelect from '@atlaskit/single-select';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/lib/codemirror.css';

const Dummy = styled.div`
  background: #fea;
`;

const actionsContent = (
  <ButtonGroup>
    <Button appearance="primary">Primary Action</Button>
    <Button>Default</Button>
    <Button>...</Button>
  </ButtonGroup>
);

const codeMirrorOptions = {
  lineNumbers: true,
  mode: 'javascript',
};

const selectItems = [
  {
    heading: 'Cities',
    items: [
      { content: 'Sydney', value: 'sydney' },
      { content: 'Canberra', value: 'canberra' },
    ],
  },
  {
    heading: 'Animals',
    items: [
      { content: 'Sheep', value: 'sheep' },
      { content: 'Cow', value: 'cow', isDisabled: true },
    ],
  },
];

const App = () => (
  <Page>
    <PageHeader
      actions={actionsContent}
    >
      Webpack Deep Scope Analysis Demo
    </PageHeader>
    <Grid layout="fluid">
      <GridColumn medium={6}>
        <SingleSelect
          items={selectItems}
          placeholder="Choose a City"
          noMatchesFound="Empty items"
          hasAutocomplete
          appearance="subtle"
          defaultSelected={selectItems[0].items[0]}
        />
        <CodeMirror options={codeMirrorOptions} />
      </GridColumn>
      <GridColumn medium={6}>
        <SingleSelect
          items={selectItems}
          placeholder="Choose a City"
          noMatchesFound="Empty items"
          hasAutocomplete
          appearance="subtle"
          defaultSelected={selectItems[0].items[0]}
        />
        <CodeMirror options={codeMirrorOptions} />
      </GridColumn>
    </Grid>
  </Page>
);

ReactDOM.render(
  <App />,
  document.getElementById('app')
);
