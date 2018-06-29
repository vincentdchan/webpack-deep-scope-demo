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
const GithubLogo = require('./GitHub-Mark-Light-120px-plus.png')

const NavBar = styled.div`
  position: fixed;
  top: 0px;
  left: 0px;
  height: 2.7rem;
  box-sizing: border-box;
  width: 100%;
  font-family: "Avenir Next",-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol";
  font-weight: 500;
  background: rgb(219,112,147);
  color: white;
  display: flex;
  justify-content: space-between;
`

const NavBarTitle = styled.div`
  display: flex;
  align-items: center;
  min-height: 2.7rem;
  margin: 0px 32px;
`

const IconsContainer = styled.div`
  display: flex;
  height: 2.7rem;
  align-items: center;
  min-height: 2.7rem;
  margin: 0px 32px;
`

const Body = styled.div`
  position: fixed;
  width: 100%;
  top: 3.2rem;
`

const SmallText = styled.span`
  font-size: 12px;
`

const VarList = styled.div`
  padding: 0px 8px;
`

const TableContainer = styled.div`
  padding-right: 12px;
  padding-left: 22px;
  margin-top: 8px;
`

const Link = styled.a`
  cursor: pointer;
`

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
  windowHeight: number,
  windowWidth: number,
}

class App extends React.Component<{}, IAppState> {

  private changeCounter: number = 0;
  private moduleAnalyser: ModuleAnalyser | undefined;
  private codeMirror: HTMLElement;

  constructor(props: {}) {
    super(props);
    this.state = {
      codeContent: '',
      exportVariables: [],
      windowWidth: 0,
      windowHeight: 0,
    };
  }

  private resize() {
    this.setState({
      windowHeight: window.innerHeight,
      windowWidth: window.innerWidth,
    });
  }

  private handleResize = () => {
    this.resize();
  };

  public componentDidMount() {
    this.resize();
    this.codeMirror = document.querySelector('.CodeMirror');
    window.addEventListener('resize', this.handleResize);
  }

  public componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  private onFixtureSelected = (value: any) => {
    const item = fixtureMap.get(value.item.value)

    this.analyseCode(value.item.value, item.inputCodeContent);
    this.setState({
      codeContent: item.inputCodeContent,
    });
  };

  private analyseCode(name: string, code: string) {
    const comments = [];
    const ast = acorn.parse(code, {
      ranges: true,
      locations: true,
      ecmaVersion: 2017,
      sourceType: "module",
      onComments: comments,
    });
    this.moduleAnalyser = new ModuleAnalyser(name, null);
    this.moduleAnalyser.analyze(ast, {
      comments,
    });
    const moduleScope = this.moduleAnalyser.moduleScope;
    const exportManager = moduleScope.exportManager;
    this.setState({
      exportVariables: exportManager.localIds.map(item => ({
        name: item.exportName,
        isUsed: false,
      })),
    });
  }

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
      <TableContainer>
        <DynamicTableStateless
          head={{
            cells: [{
              content: 'Module Name',
            }, {
              content: 'Variables',
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
      </TableContainer>
    );
  }

  private onEditorChanged = (editor, data, value) => {
    this.setState({
      codeContent: value,
    });
    this.changeCounter++;
    setTimeout(() => {
      this.changeCounter--;
      if (this.changeCounter === 0) {
        this.analyseCode("", this.state.codeContent);
      }
    }, 200);
  }

  private onSelectAll = () => {
    this.setState({
      exportVariables: this.state.exportVariables.map(variable => ({
        ...variable,
        isUsed: true,
      })),
    });
  }

  private onDeselectAll = () => {
    this.setState({
      exportVariables: this.state.exportVariables.map(variable => ({
        ...variable,
        isUsed: false,
      })),
    });
  }

  render() {
    const {
      codeContent,
      exportVariables,
      windowHeight,
    } = this.state;

    if (this.codeMirror) {
      this.codeMirror.style.height = windowHeight - (44 + 36 + 12) + 'px';
    }

    return (
      <Page>
        <NavBar>
          <NavBarTitle>
            Webpack Deep Scope Analysis Demo
          </NavBarTitle>
          <IconsContainer>
            <Link
              href="https://github.com/vincentdchan/webpack-deep-scope-analysis-plugin"
            >
              <img width={22} height={22} src={GithubLogo} />
            </Link>
          </IconsContainer>
        </NavBar>
        <Body>
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
                onBeforeChange={this.onEditorChanged}
              />
            </GridColumn>
            <GridColumn medium={2}>
            <ButtonGroup>
              <Button
                appearance="subtle"
                onClick={this.onSelectAll}
                style={{
                  fontSize: '12px',
                }}
              >
                <SmallText>
                  Select All
                </SmallText>
              </Button>
              <Button
                appearance="subtle"
                onClick={this.onDeselectAll}
              >
                <SmallText>
                  Deselect All
                </SmallText>
              </Button>
            </ButtonGroup>
            <VarList>
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
            </VarList>
            </GridColumn>
            <GridColumn medium={4}>
            {this.generateTable()}
            </GridColumn>
          </Grid>
        </Body>
      </Page>
    )
  }

}

ReactDOM.render(
  <App />,
  document.getElementById('app')
);
