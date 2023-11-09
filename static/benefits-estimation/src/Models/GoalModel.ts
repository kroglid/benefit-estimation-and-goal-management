import { balancedPoints, distributedPoints } from "./EstimationModel";

export enum GoalTypeEnum {
  GOAL,
  PRODUCT_ELEMENT
}

export interface Goal {
  id: string;
  key: string;
  goalCollectionId: string;
  type: GoalTypeEnum;
  scopeId: string;
  description: string;
  balancedPoints?: balancedPoints;
  distributedPoints?: distributedPoints;
}