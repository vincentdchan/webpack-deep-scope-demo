import * as React from 'react';
import * as ReactDOM from 'react-dom';
import styled from 'styled-components';
import Page, { Grid, GridColumn } from '@atlaskit/page';
import PageHeader from '@atlaskit/page-header';
import Button, { ButtonGroup } from '@atlaskit/button';
import { ToggleStateless } from '@atlaskit/toggle';
import Tag from '@atlaskit/tag';
import { DynamicTableStateless } from '@atlaskit/dynamic-table';
import {Controlled as CodeMirror} from 'react-codemirror2';
import SingleSelect from '@atlaskit/single-select';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/lib/codemirror.css';
import { ModuleAnalyser } from 'webpack-deep-scope-analysis';
import * as acorn from 'acorn';

const data = require('./testData.json');

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
    items: data.map(item => ({
      content: item.fixtureName,
      value: item.fixtureName,
    })),
  },
];

const fixtureMap: Map<string, any> = data.reduce((acc, value) => {
  acc.set(value.fixtureName, value);
  return acc;
}, new Map())


export interface IExportVariable {
  name: string,
  isUsed: boolean,
}

export interface IAppState {
  codeContent: string,
  exportVariables: IExportVariable[],
}

class App extends React.Component<{}, IAppState> {

  private moduleAnalyser: ModuleAnalyser | undefined;

  constructor(props: {}) {
    super(props);
    this.state = {
      codeContent: '',
      exportVariables: [],
    };
  }

  private onFixtureSelected = (value: any) => {
    const item = fixtureMap.get(value.item.value)

    const ast = acorn.parse(item.inputCodeContent, {
      ranges: true,
      locations: true,
      ecmaVersion: 2017,
      sourceType: "module",
    });
    this.moduleAnalyser = new ModuleAnalyser(value.item.value, null);
    this.moduleAnalyser.analyze(ast);
    const moduleScope = this.moduleAnalyser.moduleScope;
    const exportManager = moduleScope.exportManager;

    this.setState({
      codeContent: item.inputCodeContent,
      exportVariables: exportManager.localIds.map(item => ({
        name: item.exportName,
        isUsed: false,
      })),
    });
  };

  private onUpdateCode = (value: string) => {
    this.setState({
      codeContent: value,
    });
  }

  private generateTable() {
    if (!this.moduleAnalyser) return null;
    const {
      exportVariables
    } = this.state;
    const usedExports = exportVariables.filter(item => item.isUsed).map(item => item.name);
    const tableData = Object.entries(this.moduleAnalyser.generateExportInfo(usedExports));
    return (
      <DynamicTableStateless
        head={{
          cells: [{
            content: 'Module Name',
          }, {
            content: 'Tags',
          }]
        }}
        rows={tableData.map(([name, arr]) => ({
          key: name,
          cells: [
            {
              content: <span>{name}</span>
            },
            {
              content: <div>
              {
                (arr as any[]).map(item => (
                  <Tag text={item} key={item} />
                ))
              }
              </div>
            }
          ],
        }))}
      />
    );
  }

  render() {
    const {
      codeContent,
      exportVariables,
    } = this.state;

    return (
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
              onSelected={this.onFixtureSelected}
            />
            <CodeMirror
              value={codeContent}
              options={codeMirrorOptions}
              onBeforeChange={(editor, data, value) => {
                this.setState({
                  codeContent: value,
                });
              }}
            />
          </GridColumn>
          <GridColumn medium={2}>
          {
            exportVariables.map(variable => (
              <div>
                <span>
                  <ToggleStateless
                    isChecked={variable.isUsed}
                    onChange={() => {
                      this.setState({
                        exportVariables: this.state.exportVariables.map(inVar => {
                          if (inVar.name === variable.name) {
                            return {
                              ...variable,
                              isUsed: !inVar.isUsed,
                            };
                          } else {
                            return inVar;
                          }
                        }),
                      })
                    }}
                  />
                </span>
                <span>
                  {variable.name}
                </span>
              </div>
            ))
          }
          </GridColumn>
          <GridColumn medium={4}>
          {this.generateTable()}
          </GridColumn>
        </Grid>
      </Page>
    )
  }

}

ReactDOM.render(
  <App />,
  document.getElementById('app')
);
