import React, { useEffect, useMemo } from "react";
import { Inline } from "@atlaskit/primitives";
import Lozenge from "@atlaskit/lozenge";
import Tooltip from "@atlaskit/tooltip";
import { Flex, xcss } from '@atlaskit/primitives'
import { GoalPopup } from "../GoalPopup";
import { useEstimation } from "../../../../Pages/Estimation/EstimationContext";
import { PortfolioItemGoal } from "../../../../Models/EstimationModel";
import { Goal, GoalTypeEnum } from "../../../../Models/GoalModel";
import { useEstimationTarget } from "../../../../Pages/Estimation/EstimationTargetContext";

type EstimationPopupProps = {
  goal: Goal | PortfolioItemGoal;
}

export const GoalLabel = ({goal}: EstimationPopupProps) => {

  const { criteriaGoals } = useEstimation()
  const { goals } = useEstimationTarget()

  const totalPoints = useMemo(() => {
    let totalPoints = 0;
    for (const criteriaGoal of criteriaGoals) {
      totalPoints += goal.distributedPoints?.[criteriaGoal.id] || 0;
    }
    return totalPoints;
  }, [goals])

  const calcTopCellStyle = xcss({
    height: '57px',
    paddingBottom: 'space.075',
    paddingLeft: 'space.200',
    paddingRight: 'space.200',
    borderBottom: '1px solid',
    borderColor: 'color.border',
    ':last-child': {
      borderBottom: 'none'
    }
  });

  const displayPoints = (points: number) => {
    let displayPoints = points.toFixed(0)
    if (displayPoints.length > 3) {
      return displayPoints.slice(0, 3)+`...`
    }
    return displayPoints
  }

  return (
    <Flex direction='column' xcss={calcTopCellStyle}>
      <GoalPopup goal={goal} totalPoints={totalPoints}/>
      <Inline alignInline='end' alignBlock="center" space="space.100" xcss={xcss({overflow: 'hidden'})}>
        <Tooltip content="Points distributed">
          <Lozenge appearance='inprogress' isBold>{displayPoints(totalPoints)}</Lozenge>
        </Tooltip>
        {'portfolioItemPoints' in goal && (
          <Tooltip content="Portfolio Item Contribution">
            <Lozenge isBold>{displayPoints(goal.portfolioItemPoints)}</Lozenge>
          </Tooltip>
        )}
        <Tooltip content={goal.type === GoalTypeEnum.GOAL ? 'Balanced Points' : 'Benefit Points'}>
          <Lozenge appearance='new' isBold>{displayPoints(goal.balancedPoints!.value)}</Lozenge>
        </Tooltip>
      </Inline>
    </Flex>
  )
}
