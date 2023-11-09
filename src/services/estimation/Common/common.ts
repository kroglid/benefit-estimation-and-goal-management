import { EstimationMode, Relation, Weight, balancedPointsEnum } from "../../../models/EstimationModel";
import { Goal } from "../../../models/GoalModel";
import { GoalTier, GoalTierTypeEnum } from "../../../models/GoalTierModel";
import { getSubGoalCollection } from "../../GoalCollectionService";
import { getEstimationProps } from "../EstimationProps";
import { EstimationSubmit } from "../EstimationSubmit";

export const getWeight = (goal: Goal, criteriaGoals: Goal[], relation: Relation): Weight => {
  console.log(`getWeight: ${goal.key}`)
  let weight: Weight = {type: balancedPointsEnum.WEIGHT, value: 0, postFix: '%'};
  criteriaGoals.forEach(criteriaGoal => {
    if (relation.balance) {
      weight.value += +(goal.distributedPoints![criteriaGoal.id] * (criteriaGoal.balancedPoints!.value! / relation.total)).toFixed(2);
    }else{
      weight.value += +(goal.distributedPoints![criteriaGoal.id] * (1 / criteriaGoals.length)).toFixed(2);
    }
  });
  weight.value = +weight.value.toFixed(2);
  return weight;
};

export const setDistributedPoints = (goals: Goal[], criteriaGoals: Goal[]) => {
  console.log(`setTotalPoints: ${goals.length}, ${criteriaGoals.length}`)
  let pointsToDistribute = 100;
  criteriaGoals.forEach(criteriaGoal => {
    let totalPoints = 0;
    goals.forEach(goal => {
      if (!goal.distributedPoints) goal.distributedPoints = {};
      if (!goal.distributedPoints[criteriaGoal.id]) {
        goal.distributedPoints[criteriaGoal.id] = 0;
      }
      if (!goal.balancedPoints) goal.balancedPoints = {type: balancedPointsEnum.WEIGHT, value: 0, postFix: '%'};
      totalPoints += goal.distributedPoints[criteriaGoal.id];
    });
    if (totalPoints > pointsToDistribute) pointsToDistribute = totalPoints
  });
  return pointsToDistribute;
}

export const getRelation = (criteriaGoals: Goal[]): Relation => {
  console.log(`getRelation: go-${criteriaGoals[0].scopeId}-${criteriaGoals[0].goalCollectionId}-${criteriaGoals[0].id}`)
  let weight = true;
  let monetary = true;
  let totalValue = 0;
  
  for (const criteriaGoal of criteriaGoals) {
    if (!criteriaGoal.balancedPoints) {
      return { balance: false };
    }else{
      if (weight === true && criteriaGoal.balancedPoints.type === balancedPointsEnum.WEIGHT) {
        monetary = false;
      } else if (monetary === true && criteriaGoal.balancedPoints.type === balancedPointsEnum.MONETARY) {
        weight = false;
        totalValue += +criteriaGoal.balancedPoints.value.toFixed(2);
      } else {
        return { balance: false };
      }
    }
  };
  if (monetary) {
    return {
      balance: true,
      method: balancedPointsEnum.MONETARY,
      total: totalValue
    }
  }
  return {
    balance: true,
    method: balancedPointsEnum.WEIGHT,
    total: 100
  };
};

export const recursiveSubmit = async (criteriaGoalTier: GoalTier) => {
  console.debug(`recursiveSubmit ${criteriaGoalTier.name} as criteriaGoalTier`)
  if (criteriaGoalTier.type === GoalTierTypeEnum.PRODUCT_ELEMENT_TYPE) return
  await getSubGoalCollection(criteriaGoalTier.scopeId, criteriaGoalTier.id).then(async (goalTier) => {
    if (goalTier) {
        return await getEstimationProps(goalTier, criteriaGoalTier).then(async (estimationProps) => {
          if (estimationProps.mode === EstimationMode.PORTFOLIO_ITEMS) {
            return await EstimationSubmit(EstimationMode.PORTFOLIO_ITEMS, estimationProps.estimationTargets, estimationProps.criteriaGoals);
          }else{
            return await EstimationSubmit(EstimationMode.STANDARD, estimationProps.estimationTargets, estimationProps.criteriaGoals);
          }
        })
    }
  })
}