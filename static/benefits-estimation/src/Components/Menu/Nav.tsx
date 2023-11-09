import { useEffect, useState } from 'react';
import QueuesIcon from '@atlaskit/icon/glyph/queues';
import PageIcon from '@atlaskit/icon/glyph/page'
import { useNavigate, useParams } from 'react-router-dom';
import { useAPI } from '../../Contexts/ApiContext';
import { view } from '@forge/bridge';
import { ScopeType, ScopeTypeEnum } from '../../Contexts/AppContext';
import { Portfolio } from '../../Models/PortfolioModel';
import {
  ButtonItem,
  Header,
  NavigationFooter,
  NavigationHeader,
  NestableNavigationContent,
  Section,
  SideNavigation,
  SkeletonItem
} from '@atlaskit/side-navigation';
import { AdminPortfolio } from '../../Pages/Portfolio/AdminPortfolio';
import { Box, xcss } from '@atlaskit/primitives';
import { LeftSidebar } from '@atlaskit/page-layout';

export const Nav = () => {
  const [project, setProject] = useState<ScopeType>();
  const [portfolios, setPortfolios] = useState<Portfolio[]>();
  const [createPortfolioOpen, setCreatePortfolioOpen] = useState<boolean>(false);

  const navigation = useNavigate();
  const api = useAPI();

  const { scopeId, scopeType } = useParams();

  const refetch = () =>{
    setPortfolios(undefined);
    api.portfolio.getAll().then((response) => {
      console.log(response)
      setPortfolios(response);
    }).catch((error) => {
      console.error(error)
      setPortfolios([])
    })
    view.getContext().then((context) => {
      api.project.get(context.extension.project.id).then((project) => {
        if (project) {
          setProject({type: ScopeTypeEnum.PROJECT, id: project.id, name: project.name})
        }
      }).catch((error) => {
        console.error(error)
      })
    })
  }

  useEffect(() => {
    console.debug('Menu', scopeId, scopeType)
  }, [scopeId, scopeType])
  
  useEffect(() => {
    refetch()
  }, []);

  const portfolioButtons = () => {
    if (portfolios) {
      const returnItems: JSX.Element[] = [];
      portfolios.map((portfolio) => {
        const location: ScopeType = {id: portfolio.id, name: portfolio.name, type: ScopeTypeEnum.PORTFOLIO};
        returnItems.push(
          <ButtonItem 
          iconBefore={<QueuesIcon label=""/>}
          isSelected={scopeId === portfolio.id} 
          key={portfolio.id} description={portfolio.description} 
          onClick={() => {navigation(`../portfolio/${portfolio.id}/`)}}
          >
            {portfolio.name}
          </ButtonItem>
        )
      })
      return (returnItems)
    }else{
      return (
        <SkeletonItem hasIcon isShimmering/>
      )
    }
  }
  return (
    <Box xcss={xcss({zIndex:'layer', height: '100%'})}>
      <LeftSidebar isFixed={true} >
        <SideNavigation label="project">
          <NavigationHeader>
            <Header>
              Benefits Estimation and<br/>Goal Management
            </Header>
          </NavigationHeader>
          <NestableNavigationContent>
            <Section hasSeparator title='Project'>
              {
                project ? (
                  <ButtonItem
                  iconBefore={<PageIcon label=""/>}
                  isSelected={scopeId === project.id}
                  onClick={() => {navigation(`../project/${project.id}/`,)}}
                  >
                    {project.name}
                  </ButtonItem>
                ) : (
                  <SkeletonItem hasIcon  isShimmering/>
                  )
                }
            </Section>
            <Section isList title="Portfolios">
              {portfolioButtons()}
              <ButtonItem onClick={() => setCreatePortfolioOpen(true)}>Create portfolio</ButtonItem>
            </Section>
          </NestableNavigationContent>
          <NavigationFooter>
            <></>
          </NavigationFooter>
        </SideNavigation>
      {createPortfolioOpen && (
        <AdminPortfolio mode={"create"} onClose={() => {setCreatePortfolioOpen(false); refetch()}}/>
        )}
      </LeftSidebar>
    </Box>
  );
};