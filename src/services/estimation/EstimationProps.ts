import { fetchProductElements } from "../ProductElementService";
import { getAllGoals } from "../GoalService";
import { EstimationMode, EstimationProps, EstimationTarget, PortfolioItemGoal, balancedPointsEnum } from "../../models/EstimationModel";
import { getRelation, setDistributedPoints } from "./Common/common";
import { GoalTier, GoalTierTypeEnum } from "../../models/GoalTierModel";
import { getPortfolioItems } from "../PortfolioItemService";
import { Scope } from "../../models/ScopeModel";
import { getPortfolio } from "../PortfolioService";
import { getProject } from "../ProjectService";
import { getTopRankedGoalTier } from "../GoalTierService";

export const getEstimationProps = async(goalTier: GoalTier, criteriaGoalTier: GoalTier): Promise<EstimationProps<EstimationMode>> => {
  console.log(`getEstimationProps: ${goalTier.name}`)
  const mode = goalTier.type === GoalTierTypeEnum.PORTFOLIO_ITEM ? EstimationMode.PORTFOLIO_ITEMS : EstimationMode.STANDARD
  
  const [estimationTargets, criteriaGoals] = await Promise.all([
    getEstimationTargets(goalTier),
    getAllGoals(criteriaGoalTier.scopeId, criteriaGoalTier.id),
  ]).catch((error) => {
    console.error(error);
    return Promise.reject(error);
  })

  if (criteriaGoals.length === 0) return Promise.reject(`${criteriaGoalTier.name} has no goals`);
  estimationTargets.filter(estimationTarget => estimationTarget.goals.length > 0)
  if (estimationTargets.length === 0) return Promise.reject(`${goalTier.name} has no goals`);
  

  const relation = getRelation(criteriaGoals);

  let pointsToDistribute = 100;
  for (const estimationTarget of estimationTargets) {
    estimationTarget.goals.sort((a, b) => parseInt(a.id) - parseInt(b.id))
    console.log(estimationTarget.goals)
    const newPointsToDistribute = setDistributedPoints(estimationTarget.goals, criteriaGoals);
    if (newPointsToDistribute > pointsToDistribute) pointsToDistribute = newPointsToDistribute;
  };

  console.log('RETURNING ESTIMATIONPROPS')
  if (mode === EstimationMode.PORTFOLIO_ITEMS) {
    return {
      mode: mode,
      criteriaGoalTier: criteriaGoalTier,
      criteriaGoals: criteriaGoals,
      relation: relation,
      pointsToDistribute: pointsToDistribute,
      estimationTargets: estimationTargets.map((estimationTarget): EstimationTarget<EstimationMode.PORTFOLIO_ITEMS> => ({
        ...estimationTarget,
        goals: estimationTarget.goals.map((goal): PortfolioItemGoal => ({
          ...goal,
          portfolioItemPoints: 0
        }))
      }))
    } as EstimationProps<EstimationMode.PORTFOLIO_ITEMS>
  }else{
    return {
      mode: mode,
      criteriaGoalTier: criteriaGoalTier,
      criteriaGoals: criteriaGoals,
      relation: relation,
      pointsToDistribute: pointsToDistribute,
      estimationTargets: estimationTargets as EstimationTarget<EstimationMode.STANDARD>[]
    } as EstimationProps<EstimationMode.STANDARD>
  }
}

const getEstimationTargets = async (goalTier: GoalTier) => {
  console.log(`getEstimationTargets: ${goalTier.name}`)

  switch (goalTier.type) {
    case GoalTierTypeEnum.PORTFOLIO_ITEM:
      return await getPortfolioItems(goalTier.scopeId)
        .then(async (portfolioItems) => {
          return await getPortfolioItemTargets(portfolioItems)
        })
    default:
      return [await getEstimationTarget(goalTier)] as EstimationTarget<EstimationMode>[]
  }
}

const getPortfolioItemTargets = async (portfolioItems: Scope[]) => {
  const targetPromises = portfolioItems.map(async (portfolioItem) => (
      getTopRankedGoalTier(portfolioItem.id).then(async (topRankedGoalTier) => {
        if (!topRankedGoalTier) return undefined;
        else return await getEstimationTarget(topRankedGoalTier, portfolioItem)
      }
    ))
  )
  const targets = await Promise.all(targetPromises)
  return targets.filter((target) => target !== undefined) as EstimationTarget<EstimationMode>[]
}

const getEstimationTarget = async (goalTier: GoalTier, PortfolioItem?: Scope) => {
  console.log(`getEstimationTarget: ${goalTier.name}`)
  if (PortfolioItem) {
    return {
      scope: PortfolioItem,
      goalTier: goalTier,
      goals: (await fetchTargetGoals(goalTier)).map((goal): PortfolioItemGoal => ({
        ...goal,
        portfolioItemPoints: 0
      }))
    } as EstimationTarget<EstimationMode.PORTFOLIO_ITEMS>
  }else{
    const scope = goalTier.scopeId.startsWith('pf') ? await getPortfolio(goalTier.scopeId) : await getProject(goalTier.scopeId);
    if (!scope) return Promise.reject(`Scope ${goalTier.scopeId} not found`);
    return {
      scope: scope,
      goalTier: goalTier,
      goals: await fetchTargetGoals(goalTier)
    } as EstimationTarget<EstimationMode.STANDARD>
  }
}

const fetchTargetGoals = async (GoalTier: GoalTier) => {
  console.debug(`fetchTargetGoals: ${GoalTier.name}`)
  return GoalTier.type === GoalTierTypeEnum.PRODUCT_ELEMENT_TYPE 
    ? await fetchProductElements(GoalTier.scopeId)
    : await getAllGoals(GoalTier.scopeId, GoalTier.id);
}