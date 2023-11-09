import Button from "@atlaskit/button";
import DropdownMenu, { DropdownItemGroup, DropdownItem } from "@atlaskit/dropdown-menu";
import { RowType } from "@atlaskit/dynamic-table/dist/types/types";
import Lozenge from "@atlaskit/lozenge";
import { ScopeTypeEnum, useAppContext } from "../../Contexts/AppContext";
import MoreIcon from '@atlaskit/icon/glyph/more';
import { useAPI } from "../../Contexts/ApiContext";
import { useNavigate } from "react-router-dom";
import Tooltip from "@atlaskit/tooltip";
import { balancedPointsEnum } from "../../Models/EstimationModel";
import { GoalTier, GoalTierTypeEnum } from "../../Models/GoalTierModel";
import { GoalTableItem } from "../../Models/GoalStructureModel";

export const GoalTableRows = (goalTier: GoalTier, items: GoalTableItem[]): RowType[] => {

  const [scope] = useAppContext();
  const api = useAPI();
  const navigation = useNavigate();

  let rows: RowType[] = items.map((item, index): RowType => ({
    key: `${item.id}`,
    isHighlighted: false,
    cells: [
      {
        key: item.key,
        content: (
          item.key
        ),
      },
      {
        key: item.description,
        content: (
          item.description
        ),
      },
      ...goalTier.type === GoalTierTypeEnum.PRODUCT_ELEMENT_TYPE ? [
        {
          key: `${item.id}-status`,
          content: (
            <Lozenge appearance="inprogress">{item.status!.name}</Lozenge>
          ),
        }
      ] : [],
      ...goalTier.type === GoalTierTypeEnum.PORTFOLIO_ITEM ? [
        {
          key: `${item.id}-type`,
          content: (
            item.scopeType === ScopeTypeEnum.PROJECT ? (
              <Lozenge appearance="inprogress">Project</Lozenge>
            ) : (
              <Lozenge appearance="new">Portfolio</Lozenge>
            )
          ),
        }
      ] : [],
      {
        key: item.balancedPoints?.value || 0,
        content: (
          item.balancedPoints ? (
            goalTier.type === GoalTierTypeEnum.PRODUCT_ELEMENT_TYPE ? (
            <Tooltip content={'Benefit points'}>
                <Lozenge appearance="new">{`${item.balancedPoints.value} ${item.balancedPoints.postFix}`}</Lozenge>
              </Tooltip>
            ) : (
              goalTier.type === GoalTierTypeEnum.PORTFOLIO_ITEM ? (
                <Tooltip content={'Weight'}>
                  <Lozenge appearance="new">{`${item.balancedPoints.value} ${item.balancedPoints.postFix}`}</Lozenge>
                </Tooltip>
              ) : (
                <Tooltip content={item.balancedPoints.type === balancedPointsEnum.MONETARY ? 'Monetary value' : 'Weight'}>
                  <Lozenge appearance="new">{`${item.balancedPoints.value} ${item.balancedPoints.postFix}`}</Lozenge>
                </Tooltip>
              )
            )
          ) : (
            <Lozenge appearance="default">NO ESTIMATION</Lozenge>
          )
        ),
      },
      ...goalTier.type !== GoalTierTypeEnum.PRODUCT_ELEMENT_TYPE ? [
        {
          key: 'MoreDropdown',
          content: (
            <DropdownMenu 
              trigger={({ triggerRef, ...props }) => (
                <Button
                  {...props}
                  iconBefore={<MoreIcon label="more" />}
                  ref={triggerRef}
                />
              )}
            >
              <DropdownItemGroup>
                {goalTier.type === GoalTierTypeEnum.PORTFOLIO_ITEM ? (
                  <DropdownItem onClick={() => navigation(`${item.id}/remove`, { state: { connectionName: item.key, connectionType: item.scopeType } })}>Remove</DropdownItem>
                ):(
                  <>
                    <DropdownItem onClick={() => navigation(`${item.id}/edit-goal`)}>Edit</DropdownItem>
                    <DropdownItem onClick={() => navigation(`${item.id}/delete`, { state: { goal_key: item.key } })}>Delete</DropdownItem>
                  </>
                )}
              </DropdownItemGroup>
            </DropdownMenu>
          ),
        }
      ] : [
      ],
    ],
  }))
  return rows;
};