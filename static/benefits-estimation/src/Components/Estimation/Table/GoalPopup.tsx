import { token } from "@atlaskit/tokens";
import { ReactNode, useEffect, useState } from "react"
import Button from "@atlaskit/button";
import EditorPanelIcon from '@atlaskit/icon/glyph/editor/panel'
import Popup from "@atlaskit/popup";
import React from "react";
import { Inline, Stack, xcss } from "@atlaskit/primitives";
import Heading from "@atlaskit/heading";
import { Goal, GoalTypeEnum } from "../../../Models/GoalModel";
import Lozenge from "@atlaskit/lozenge";
import { useEstimation } from "../../../Pages/Estimation/EstimationContext";
import { PortfolioItemGoal } from "../../../Models/EstimationModel";

type GoalPopupProps = {
  goal: Goal | PortfolioItemGoal;
  totalPoints?: number;
  isCriteriaGoal?: true;
}

export const GoalPopup = ({goal, totalPoints, isCriteriaGoal}: GoalPopupProps) => { 
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const { criteriaGoals, relation } = useEstimation()

  const contentStyles: React.CSSProperties = ({
    padding: token('space.200', '16px'),
    maxWidth: '200px'
  });

  const PropertyStack = ({children}: {children: ReactNode}) => (
    <Stack space='space.050' alignInline='start'>
      {children}
    </Stack>
  )

  const properties = () => {
    const properties = []
    if (!isCriteriaGoal) {
      properties.push(
        <PropertyStack key={goal.scopeId + goal.id + 'pd'}>
          <h5>Points Distributed</h5>
          <Lozenge appearance='inprogress' isBold>{totalPoints}</Lozenge>
        </PropertyStack>
      )
    }
    if ('portfolioItemPoints' in goal) {
      properties.push(
        <PropertyStack key={goal.scopeId + goal.id + 'pip'}>
          <h5>Portfolio Item Contribution</h5>
          <Lozenge isBold>{goal.portfolioItemPoints.toFixed(2)}%</Lozenge>
        </PropertyStack>
      )
    }
    if (goal.balancedPoints && ((isCriteriaGoal && relation.balance) || !isCriteriaGoal)) {
      properties.push(
        <PropertyStack key={goal.scopeId + goal.id + 'bp'}>
          <h5>{isCriteriaGoal ? 'Weight' : goal.type === GoalTypeEnum.PRODUCT_ELEMENT ? 'Benefit Points' : 'Balanced Points'}</h5>
          <Lozenge appearance='new' isBold>{goal.balancedPoints.value.toFixed(2)}%</Lozenge>
        </PropertyStack>
      )
    }
    return properties
  }

  return (
    <Inline alignInline="center" alignBlock="center" spread="space-between">
      <Heading level="h400">{goal.key}</Heading>
      <Popup
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        placement="bottom-start"
        zIndex={9999}
        content={() => 
          <div style={contentStyles}>
            <Stack>
              <h4>{goal.key}</h4>
              <Stack xcss={xcss({marginTop: '10px'})} alignInline="start" alignBlock="center" space="space.100">
                {properties()}
              </Stack>
              <p>{goal.description}</p>
            </Stack>
          </div>
        }
        trigger={(triggerProps) => (
          <Button
            {...triggerProps}
            iconBefore={<EditorPanelIcon label="Goal Info"/>}
            appearance="subtle"
            isSelected={isOpen}
            onClick={() => setIsOpen(!isOpen)}
          />
        )}
      />
    </Inline>
  )
}