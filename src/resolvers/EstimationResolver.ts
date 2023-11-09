import Resolver from "@forge/resolver";
import { EstimationMode, EstimationProps } from "../models/EstimationModel";
import { getEstimationProps } from "../services/estimation/EstimationProps";
import { EstimationSubmit } from "../services/estimation/EstimationSubmit";

export const estimationResolver = (resolver: Resolver) => {
  resolver.define("submit", async ({ payload: { mode, estimationTargets, criteriaGoals } }) => {
    return await EstimationSubmit(mode, estimationTargets, criteriaGoals);
  });
  resolver.define("getEstimationProps", async ({ payload: { goalCollection, criteriaGoalTier } }): Promise<EstimationProps<EstimationMode>> => {
    return await getEstimationProps(goalCollection, criteriaGoalTier);
  });
};