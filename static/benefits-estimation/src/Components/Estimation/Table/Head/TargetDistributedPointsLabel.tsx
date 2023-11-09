import { Inline, Stack } from "@atlaskit/primitives";
import Lozenge, { ThemeAppearance } from "@atlaskit/lozenge";
import Tooltip from "@atlaskit/tooltip";
import { Flex, xcss } from '@atlaskit/primitives'
import { useEstimation } from "../../../../Pages/Estimation/EstimationContext";
import { Goal } from "../../../../Models/GoalModel";
import { useEstimationTarget } from "../../../../Pages/Estimation/EstimationTargetContext";

type TargetDistributedPointsLabelProps = {
  criteriaGoal: Goal;
}
  

export const TargetDistributedPointsLabel = ({criteriaGoal}: TargetDistributedPointsLabelProps) => {
  
  const { pointsToDistribute} = useEstimation()
  const { getTotalDPPoints } = useEstimationTarget()

  let appearance: ThemeAppearance = "success";
  switch (true) {
    case getTotalDPPoints(criteriaGoal.id) > pointsToDistribute:
      appearance = "removed"
      break;
    case getTotalDPPoints(criteriaGoal.id) > 1:
      appearance = "success"
      break;
    case getTotalDPPoints(criteriaGoal.id) === 0:
      appearance = "inprogress"
      break;
  }

  return (
    <Inline alignInline='end' alignBlock="center" space="space.100" xcss={xcss({overflow: 'hidden'})}>
      <Tooltip content="Points distributed">
        <Lozenge appearance={appearance} isBold>{getTotalDPPoints(criteriaGoal.id)}</Lozenge>
      </Tooltip>
    </Inline>
  )
}