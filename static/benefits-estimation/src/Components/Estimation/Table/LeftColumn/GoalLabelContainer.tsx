import { Box, xcss } from "@atlaskit/primitives"
import { GoalLabel } from "./GoalLabel"
import { useEstimationTarget } from "../../../../Pages/Estimation/EstimationTargetContext"

export const GoalLabelContainer = () => {

  const { goals } = useEstimationTarget()

  return (
    <Box
      xcss={xcss({
        borderRight: '1px solid',
        borderColor: 'color.border',
        borderCollapse: 'collapse',
      })}
    >
      {goals.map((goal, index) => {
        return <GoalLabel key={`${goal.id}-label`} goal={goal}/>
      })}
      {goals.length === 0 && (
        <Box/>
      )}
    </Box>
  )
}