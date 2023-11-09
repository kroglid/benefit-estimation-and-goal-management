import Button from "@atlaskit/button";
import DropdownMenu, { DropdownItemGroup, DropdownItem } from "@atlaskit/dropdown-menu";
import { RowType } from "@atlaskit/dynamic-table/dist/types/types";
import { useNavigate } from "react-router-dom";
import { useAPI } from "../../Contexts/ApiContext";
import { useAppContext } from "../../Contexts/AppContext";
import MoreIcon from '@atlaskit/icon/glyph/more';
import { GoalTier, GoalTierTypeEnum } from "../../Models/GoalTierModel";

export const GoalTierRows = (goalTiers: GoalTier[], isRankable: boolean): RowType[] | undefined => {

  const navigate = useNavigate();
  const api = useAPI();
  const [ scope ] = useAppContext();

  let rows: RowType[] = goalTiers.map((goalTier: GoalTier, index: number): RowType => ({
    key: `${goalTier.id}`,
    cells: [
      {
        key: index,
        content: (
          goalTiers.length - index
        ),
      },
      {
        key: goalTier.name,
        content: (
          goalTier.name
        ),
      },
      {
        key: goalTier.description,
        content: (
          goalTier.description
        ),
      },
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
              <DropdownItem onClick={() => navigate(`../goal-tier/${goalTier.type}/${goalTier.id}`)}>View</DropdownItem>
              {goalTier.type === GoalTierTypeEnum.GOAL_COLLECTION && (
                <>
                  <DropdownItem onClick={() => navigate(`${goalTier.id}/edit-goal-collection`)}>Edit</DropdownItem>
                  <DropdownItem onClick={() => navigate(`${goalTier.id}/delete`, { state: { scopeId: goalTier.scopeId, goalCollectionName: goalTier.name } })}>Delete</DropdownItem>
                </>
              )}
            </DropdownItemGroup>
          </DropdownMenu>
        )
      },
    ],
  }))
  if (isRankable) rows = rows.filter((row: RowType) => row.key !== `-1`)
  return rows;
}