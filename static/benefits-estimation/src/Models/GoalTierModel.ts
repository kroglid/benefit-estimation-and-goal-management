export enum GoalTierTypeEnum {
  GOAL_COLLECTION,
  PORTFOLIO_ITEM,
  PRODUCT_ELEMENT_TYPE,
}

export interface GoalTier {
  id: string;
  scopeId: string;
  type: GoalTierTypeEnum;
  name: string;
  description: string;
  /* monetaryValue: boolean; */
}