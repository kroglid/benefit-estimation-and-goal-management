import { GoalCollection } from "../Models/GoalCollectionModel";
import { EstimationTarget, EstimationProps, EstimationMode } from "../Models/EstimationModel";
import { Goal } from "../Models/GoalModel";
import { invoke } from "@forge/bridge";

export const estimationApi = () => {
  return {
    submit: (mode: EstimationMode, estimationTargets: EstimationTarget<EstimationMode>[], criteriaGoals: Goal[]) => {
      return invoke('submit', { mode, estimationTargets, criteriaGoals});
    },
    getEstimationProps: (goalCollection: GoalCollection, criteriaGoalTier: GoalCollection): Promise<EstimationProps<EstimationMode>> => {
      return invoke('getEstimationProps', { goalCollection, criteriaGoalTier });
    }
  }
}