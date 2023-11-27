import Button, { ButtonGroup } from "@atlaskit/button";
import { useState, useEffect, useCallback } from "react";
import { Outlet, useNavigate } from "react-router";
import EmptyState from "@atlaskit/empty-state";
import DynamicTable from "@atlaskit/dynamic-table";
import { useAppContext } from "../../Contexts/AppContext";
import { useAPI } from "../../Contexts/ApiContext";
import { GoalTableHead } from "./GoalTableHead";
import { GoalTableRows } from "./GoalTableRows";
import { useLocation } from "react-router-dom";
import BitbucketCompareIcon from '@atlaskit/icon/glyph/bitbucket/compare'
import { Box, xcss } from "@atlaskit/primitives";
import { Scope } from "../../Models/ScopeModel";
import { GoalTier, GoalTierTypeEnum } from "../../Models/GoalTierModel";
import { GoalTableItem, GoalTableItemTypeEnum } from "../../Models/GoalStructureModel";

type GoalTableProps = {
  goalTier: GoalTier
  onFetching: (fetching: boolean) => void
}

export const GoalTable = ({goalTier, onFetching}: GoalTableProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [items, setItems] = useState<GoalTableItem[]>([]);

  const [scope] = useAppContext();
  const api = useAPI();
  const navigation = useNavigate();
  const location = useLocation();
  const refresh = location.state?.refresh;

  const fetchItems = async(): Promise<GoalTableItem[]> => {
    switch (goalTier.type) {
      case GoalTierTypeEnum.PORTFOLIO_ITEM:
        return api.portfolioItem.getAll(scope.id).then((response) => {
          return response.map((portfolioItem: Scope): GoalTableItem => {
            console.debug(portfolioItem)
            return {...portfolioItem, key: portfolioItem.name, goalCollectionId: goalTier.id, scopeType: portfolioItem.type, type: GoalTableItemTypeEnum.SCOPE, balancedPoints: portfolioItem.portfolioItemPoints};
          })
        }).catch((error) => {
          console.debug('hi')
          console.error(error)
          return []
        });
      case GoalTierTypeEnum.PRODUCT_ELEMENT_TYPE:
        return api.productElements.getAll(scope.id).then((issues) => {
          return issues.map((issue) => (
            {...issue, type: GoalTableItemTypeEnum.ISSUE} as GoalTableItem
          ));
        }).catch((error) => {
          console.debug('hi')
          console.error(error)
          return []
        });
      default:
        return api.goal.getAll(scope.id, goalTier.id).then((goals) => {
          return goals.map((goal) => (
            {...goal, type: GoalTableItemTypeEnum.GOAL} as GoalTableItem
          ));
        }).catch((error) => {
          console.debug('hi')
          console.error(error)
          return []
        });
    }
  }

  useEffect(() => {
    onFetching(loading);
  }, [loading]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchItems().then((items) => {
      if (isMounted) {
        setItems(items);
        setLoading(false);
      }
    });
    return () => { isMounted = false };
  }, [goalTier, refresh]);
  
  const head = useCallback(() => {
    return GoalTableHead(goalTier);
  }, [items]);
  
  const rows = useCallback(() => {
    return GoalTableRows(goalTier, items);
  }, [items]);

  const NewGoalButton = () => {
    return(
      <Button onClick={() => navigation(`${goalTier.id}/create-goal`)}>New Goal</Button>
    )
  }

  const SetValues = () => {
    return(
      <Button iconBefore={<BitbucketCompareIcon label="compare"/>} onClick={() => navigation(`${goalTier.id}/set-values`)}>Set Values</Button>
    )
  }
  const ResetValues = () => {
    return(
      <Button appearance="primary" onClick={() => api.goal.resetAllPoints(scope.id, goalTier.id)}>Reset Values</Button>
    )
  }

  const AddPortfolioItem = () => {
    return(
      <Button appearance="primary" onClick={() => navigation('portfolio-item/add')}>Add Portfolio Items</Button>
    )
  }

  const SettingsButton = () => {
    return(
      <Button appearance="primary" onClick={() => navigation('../settings')}>Settings</Button>
    )
  }

  return(
    <Box xcss={xcss({
      backgroundColor: 'elevation.surface.sunken',
      paddingTop: 'space.200',
      paddingLeft: 'space.200',
      paddingRight: 'space.200',
      paddingBottom: 'space.025',
    })}>
      {goalTier.type !== GoalTierTypeEnum.PRODUCT_ELEMENT_TYPE && (
        <Box xcss={xcss({
          paddingBottom: 'space.200',
        })}>
          <ButtonGroup>
            {goalTier.type === GoalTierTypeEnum.GOAL_COLLECTION && (
              <>
                {NewGoalButton()}
                {items && items.length > 0 && (
                  <>
                    {SetValues()}
                    {ResetValues()}
                  </>
                )}
              </>
            )}
            {goalTier.type === GoalTierTypeEnum.PORTFOLIO_ITEM && (
              AddPortfolioItem()
            )}
          </ButtonGroup>
        </Box>
      )}
      <DynamicTable
        head={head()}
        rows={rows()}
        page={1}
        defaultSortKey="name"
        defaultSortOrder="ASC"
        isRankable={false}
        loadingSpinnerSize="large"
        isLoading={loading}
        emptyView={
          goalTier.type === GoalTierTypeEnum.PRODUCT_ELEMENT_TYPE ? (
            <EmptyState
              header={`No issues of type ${goalTier.name}`}
              description={"The product element type does not have any issues. " + 
              " Create some issues of this issue type, or change the prodeuct element type here"}
              headingLevel={2}
              primaryAction={SettingsButton()}
            />
          ):(goalTier.type === GoalTierTypeEnum.PORTFOLIO_ITEM ? (
            <EmptyState
              header="No connected projects or portfolios"
              description="You can connect projects and portfolios by clicking the button below"
              headingLevel={2}
              primaryAction={AddPortfolioItem()}
            />
          ):(
            <EmptyState
              header="No goals"
              description="You can add goals by clicking the button below"
              headingLevel={2}
              primaryAction={NewGoalButton()}
            />
          ))
        }
      />
      <Outlet/>
    </Box>
  );
};