import { EstimationMode, EstimationTarget, PortfolioItemGoal, Relation, Weight, balancedPointsEnum } from "../../models/EstimationModel";
import { Goal, GoalTypeEnum } from "../../models/GoalModel";
import { Scope, ScopeTypeEnum } from "../../models/ScopeModel";
import { setDPandBP } from "../GoalService";
import { setBenefitPoints, setDistributedPointsToIssue } from "../ProductElementService";
import { setPortfolioItemPointsToPortfolio } from "../PortfolioService";
import { setPortfolioItemPointsToProject } from "../ProjectService";
import { getWeight, getRelation, recursiveSubmit, setDistributedPoints } from "./Common/common";

export const EstimationSubmit = async(mode: EstimationMode, estimationTargets: EstimationTarget<EstimationMode>[], criteriaGoals: Goal[]) => {
  console.debug(`EstimationSubmit: ${criteriaGoals[0].scopeId}`)
  
  let pointsToDistribute = 100;
  for (const estimationTarget of estimationTargets) {
    const newPointsToDistribute = setDistributedPoints(estimationTarget.goals, criteriaGoals);
    if (newPointsToDistribute > pointsToDistribute) pointsToDistribute = newPointsToDistribute;
  };

  if (validateEstimation(estimationTargets, criteriaGoals, pointsToDistribute)){
    const relation = getRelation(criteriaGoals);
    const promises: Promise<any>[] = [];
    for (const estimationTarget of estimationTargets) {
      if (validateTarget(estimationTarget, criteriaGoals)){
        console.debug('Approved', estimationTarget.scope.name)
        if (mode === EstimationMode.PORTFOLIO_ITEMS) {
          const goals = estimationTarget.goals as PortfolioItemGoal[];
          const portfolioItemWeight = getPortfolioItemWeight(goals, criteriaGoals, relation);
          promises.push(
            setPortfolioItemPoints(estimationTarget.scope, portfolioItemWeight)
            .then(async () => await setPortfolioItemGoalBP(goals, portfolioItemWeight)
              .then(async () => await recursiveSubmit(estimationTarget.goalTier))
            )
          )
        }else{
          promises.push(
            setGoalBP(estimationTarget.goals, criteriaGoals, relation)
            .then(async () => await recursiveSubmit(estimationTarget.goalTier))
          )
        }
      }else{
        console.log('Not approved', estimationTarget.goalTier.name)
        if (mode === EstimationMode.PORTFOLIO_ITEMS) {
          const connectionWeight: Weight = {
            type: balancedPointsEnum.WEIGHT,
            value: 0,
            postFix: '%'
          }
          promises.push(
            setPortfolioItemPoints(estimationTarget.scope, connectionWeight)
          )
        }
      }
    }
    return await Promise.all(promises).then(async (errorMessages) => {
      for (const estimationTarget of estimationTargets) {
        console.log(`submitted ${estimationTarget.goalTier.name}`)
      }
      return { ok: true };
    }).catch((error) => {
      console.error(error);
      return { ok: false };
    });
  }
  for (const estimationTarget of estimationTargets) {
    console.error(`could not submit ${estimationTarget.goalTier.name}`)
  }
  return { ok: false };
}

const validateEstimation = (estimationTargets: EstimationTarget<EstimationMode>[], criteriaGoals: Goal[], pointsToDistribute: number): boolean => {
  let validated = true
  for (const criteriaGoal of criteriaGoals) {
    if (getCriteriaGoalDP(estimationTargets, criteriaGoal.id) !== pointsToDistribute) {
      validated = false
    }
  };
  return validated
}

const getCriteriaGoalDP = (estimationTargets: EstimationTarget<EstimationMode>[], criteriaGoalId: string) => {
  let sum = 0;
  for (const estimationTarget of estimationTargets)
    for (const goal of estimationTarget.goals)
      sum += goal.distributedPoints?.[criteriaGoalId] || 0;
  return sum;
}

const validateTarget = (estimationTarget: EstimationTarget<EstimationMode>, criteriaGoals: Goal[]): boolean => {
  if (estimationTarget.goals.length === 0) return false
  for (const goal of estimationTarget.goals) 
    for (const criteriaGoal of criteriaGoals) {
      if ((goal.distributedPoints?.[criteriaGoal.id] || 0) > 0) return true
    }
  
  return false
}

const getPortfolioItemWeight = (goals: PortfolioItemGoal[], criteriaGoals: Goal[], relation: Relation): Weight => {
  let portfolioItemWeight = 0;
  for (const goal of goals) {
    const weight = getWeight(goal, criteriaGoals, relation)
    goal.portfolioItemPoints = weight.value;
    portfolioItemWeight += +weight.value.toFixed(2);
  }
  return {
    type: balancedPointsEnum.WEIGHT,
    value: +portfolioItemWeight.toFixed(2),
    postFix: '%'
  }
}

const setPortfolioItemPoints = async (scope: Scope, weight: Weight) => {
  if (scope.type === ScopeTypeEnum.PORTFOLIO) {
    setPortfolioItemPointsToPortfolio(scope.id, weight)
  } else {
    setPortfolioItemPointsToProject(scope.id, weight)
  }
}

const setPortfolioItemGoalBP = async (goals: PortfolioItemGoal[], connectionWeight: Weight) => {
  const promises: Promise<any>[] = [];
  for (const goal of goals) {
    const balancedPoints: Weight = {
      type: balancedPointsEnum.WEIGHT,
      value: +(goal.portfolioItemPoints / connectionWeight.value * 100).toFixed(2) || 0,
      postFix: '%'
    };
    if (goal.type === GoalTypeEnum.PRODUCT_ELEMENT) {
        promises.push(
          setBenefitPoints(`${goal.id}`, balancedPoints),
        )
        promises.push(
          setDistributedPointsToIssue(goal.key, goal.distributedPoints!)
        )
      } else {
        promises.push(
          setDPandBP(
            goal.scopeId,
            goal.goalCollectionId,
            goal.id,
            goal.distributedPoints!,
            balancedPoints
          )
        );
      }
  }
}

const setGoalBP = async (goals: Goal[], criteriaGoals: Goal[], relation: Relation) => {
  const promises: Promise<any>[] = [];
  for (const goal of goals) {
    const weight = getWeight(goal, criteriaGoals, relation)
    if (goal.type === GoalTypeEnum.PRODUCT_ELEMENT) {
        promises.push(
          setBenefitPoints(`${goal.id}`, weight),
        )
        promises.push(
          setDistributedPointsToIssue(goal.key, goal.distributedPoints!)
        )
      } else {
        promises.push(
          setDPandBP(
            goal.scopeId,
            goal.goalCollectionId,
            goal.id,
            goal.distributedPoints!,
            weight
          )
        );
      }
  }
  return await Promise.all(promises).then(async () => {
    console.log(`submitted connections ${criteriaGoals[0].scopeId}`)
    return { ok: true };
  }).catch((error) => {
    console.error(error);
    return { ok: false };
  })
}