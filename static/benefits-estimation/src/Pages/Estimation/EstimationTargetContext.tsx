import { EstimationField } from "../../Components/Estimation/Table/Body/PointsField"
import { StandardTargetLabel } from "../../Components/Estimation/Table/Head/StandardTargetLabel"
import { GoalLabelContainer } from "../../Components/Estimation/Table/LeftColumn/GoalLabelContainer"
import { PointsFieldContainer } from "../../Components/Estimation/Table/Body/PointsFieldContainer"
import { Box, Grid, xcss } from '@atlaskit/primitives'
import { TargetLabel } from "../../Components/Estimation/Table/Head/TargetLabel"
import EmptyState from "@atlaskit/empty-state"
import Button from "@atlaskit/button"
import { EstimationMode, PortfolioItemGoal, EstimationTarget as EstimationTarget, balancedPointsEnum, distributedPoints } from "../../Models/EstimationModel"
import { createContext, useContext, useState, useEffect } from "react"
import { calculateBPandTP } from "../../Functions/EstimationHelper"
import { useEstimation } from "./EstimationContext"
import { Goal } from "../../Models/GoalModel"

type EstimationSomethingProps = {
  index: number,
}

type EstimationTargetContextType = EstimationTarget<EstimationMode> & {
  isCollapsed: boolean,
  clearGoals: () => void,
  updateValues: (value: number, goal: Goal | PortfolioItemGoal, criteriaGoalId: string) => void,
  toogleCollapse: () => void,
  getTotalDPPoints: (criteriaGoalId: string) => number,
}

const EvalGCContext = createContext<EstimationTargetContextType>(undefined!);

export const useEstimationTarget = () => {
  return useContext(EvalGCContext)
}

export const EstimationTargetContextProvider = ({index}: EstimationSomethingProps) => {

  const { estimationTargets, criteriaGoals, mode, relation, pointsToDistribute, updateCriteriaGoalDP, updateGoals } = useEstimation();

  const target = estimationTargets[index]
  const { goalTier } = target

  const [isCollapsed, setIsCollapsed] = useState<boolean>(false)
  const [goals, setGoals] = useState<(Goal | PortfolioItemGoal)[]>(target.goals)

  const getTotalDPPoints = (criteriaGoalId: string): number => {
    return goals.reduce((acc, goal) => acc + goal.distributedPoints![criteriaGoalId], 0)
  }

  useEffect(() => {
    updateGoals(target.scope.id)
  }, [goals])

  const updateValues = (value: number, goal: Goal | PortfolioItemGoal, criteriaGoalId: string) => {
    if (mode === EstimationMode.PORTFOLIO_ITEMS) {
      setGoals(prevGoals => {
        const newGoals = [...prevGoals] as PortfolioItemGoal[]
        const updatedGoal = newGoals.find((g) => g.id === goal.id)
        if (updatedGoal) {
          updatedGoal.distributedPoints![criteriaGoalId] = value
          const { bp, tp } = calculateBPandTP(updatedGoal, criteriaGoals, relation, pointsToDistribute)
          updatedGoal.portfolioItemPoints = bp.value
          let totalConnectionPoints = newGoals.reduce((acc, goal) => acc + goal.portfolioItemPoints, 0);
          newGoals.forEach(goal => {
            goal.balancedPoints = {
              type: balancedPointsEnum.WEIGHT, 
              value: +(goal.portfolioItemPoints / totalConnectionPoints * 100).toFixed(2) || 0, 
              postFix: '%'
            }
          })
        }
        return newGoals
      })
    }else{
      setGoals(prevGoals => {
        const newGoals = [...prevGoals!]
        const updatedGoal = newGoals.find((g) => g.id === goal.id)
        if (updatedGoal) {
          updatedGoal.distributedPoints![criteriaGoalId] = value
          const { bp, tp } = calculateBPandTP(updatedGoal, criteriaGoals, relation, pointsToDistribute)
          updatedGoal.balancedPoints = bp
        }
        return newGoals
      })
    }
    updateCriteriaGoalDP(criteriaGoalId, getTotalDPPoints(criteriaGoalId), goal.scopeId)
  }

  const clearGoals = () => {
    const clearedDP: distributedPoints = {}
    criteriaGoals.forEach(criteriaGoal => {
      clearedDP[criteriaGoal.id] = 0
    });
    if (mode === EstimationMode.PORTFOLIO_ITEMS) {
      setGoals(prevGoals => {
        const newGoals = [...prevGoals] as PortfolioItemGoal[]
        newGoals.forEach(goal => {
          goal.distributedPoints = {...clearedDP}
          goal.portfolioItemPoints = 0
          goal.balancedPoints = {type: balancedPointsEnum.WEIGHT, value: 0, postFix: '%'}
        })
        return newGoals
      })
    } else {
      setGoals(prevGoals => {
        const newGoals = [...prevGoals!]
        newGoals.forEach(goal => {
          goal.distributedPoints = {...clearedDP}
          goal.balancedPoints = {type: balancedPointsEnum.WEIGHT, value: 0, postFix: '%'}
        })
        return newGoals
      })
    }
    for (const criteriaGoal of criteriaGoals) {
      updateCriteriaGoalDP(criteriaGoal.id, 0, goalTier.scopeId)
    }
  }


  const calcRowStyle = xcss({
    width: 'max-content',
    display: 'grid',
    gridAutoColumns: '150px',
    gridAutoFlow: 'column',
    borderColor: 'color.border',
    ':hover': {
      backgroundColor: 'elevation.surface.hovered',
    },
    ':last-child': {
      borderBottom: 'none',
    },
  })

  const value: EstimationTargetContextType = {
    scope: target.scope,
    goals: goals,
    goalTier: goalTier,
    isCollapsed: isCollapsed,
    clearGoals: clearGoals,
    updateValues: updateValues,
    getTotalDPPoints: getTotalDPPoints,
    toogleCollapse: () => setIsCollapsed((prev) => !prev)
  }

  return (
    <EvalGCContext.Provider value={value}>
      {mode === EstimationMode.PORTFOLIO_ITEMS ? (
        <TargetLabel/>
      ):(
        <StandardTargetLabel/>
      )}
      {!isCollapsed && (
        goals.length === 0 ? (
          <Box key={`${goalTier.id}-row`} xcss={xcss({
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          })}>
            <EmptyState
              header='No Goals'
              description={`${goalTier.name} has no goals and will therefore not be evaluated`}
              primaryAction={<Button onClick={() => setIsCollapsed((prev) => !prev)}>Collapse</Button>}
            />
          </Box>
        ):(
          <Grid
            xcss={xcss({
              width: 'max-content',
              maxWidth: '100%',
              gridTemplateColumns: '150px 1fr',
              overflow: 'hidden',
            })}
          >
            <GoalLabelContainer/>
            <PointsFieldContainer index={index}>
              {goals.map((goal) => {
                return(
                  <Box key={`${goal.id}-row`} xcss={calcRowStyle}>
                    {criteriaGoals.map((criteriaGoal) => {
                      return(
                        <EstimationField
                          key={`${criteriaGoal.id}-${goal.id}-cell`}
                          goal={goal}
                          criteriaGoal={criteriaGoal}
                        />
                      )
                    })}
                  </Box>
                )
              })}
            </PointsFieldContainer>
          </Grid>
        )
      )}
    </EvalGCContext.Provider>
  )
}