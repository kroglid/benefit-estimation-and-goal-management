import { Inline, Stack } from "@atlaskit/primitives";
import Lozenge, { ThemeAppearance } from "@atlaskit/lozenge";
import Tooltip from "@atlaskit/tooltip";
import { Flex, Grid, xcss } from '@atlaskit/primitives'
import { GoalPopup } from "../GoalPopup";
import { useEstimation } from "../../../../Pages/Estimation/EstimationContext";
import { useEffect, useMemo, useState } from "react";
import { Goal } from "../../../../Models/GoalModel";
import { balancedPointsEnum } from "../../../../Models/EstimationModel";

type EstimationPopupProps = {
  criteriaGoal: Goal;
}
  

export const CriteriaGoalLabel = ({criteriaGoal}: EstimationPopupProps) => {
  
  const { relation, pointsToDistribute, getCriteriaGoalDP } = useEstimation()

  let appearance: ThemeAppearance = "success";
  switch (true) {
    case getCriteriaGoalDP(criteriaGoal.id) === pointsToDistribute:
      appearance = "success"
      break;
    case getCriteriaGoalDP(criteriaGoal.id) < pointsToDistribute:
      appearance = "inprogress"
      break;
    case getCriteriaGoalDP(criteriaGoal.id) > pointsToDistribute:
      appearance = "removed"
      break;
  }

  const calcTopCellStyle = xcss({
    gridTemplateRows: '32px 20px',
    backgroundColor: 'elevation.surface.sunken',
    paddingBottom: 'space.050',
    paddingLeft: 'space.200',
    paddingRight: 'space.200',
    borderBottom: '1px solid',
    borderColor: 'color.border',
    alignContent: 'space-between'
  });

  return (
  <Grid xcss={calcTopCellStyle}>
    <GoalPopup goal={criteriaGoal} isCriteriaGoal/>
    <Inline alignInline='center' alignBlock="center" space="space.100">
      {relation.balance && (
        <Tooltip content={ relation.method === balancedPointsEnum.WEIGHT ? 'Weight' : 'Monetary Value'}>
          <Lozenge appearance='new' isBold>{`${criteriaGoal.balancedPoints!.value.toFixed(0)} ${criteriaGoal.balancedPoints!.postFix}`}</Lozenge>
        </Tooltip>
      )}
      <Tooltip content="Points distributed">
        <Lozenge appearance={appearance} isBold>
          {getCriteriaGoalDP(criteriaGoal.id)} / {pointsToDistribute}
        </Lozenge>
      </Tooltip>
    </Inline>
  </Grid>
  )
}