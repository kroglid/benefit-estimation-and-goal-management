import { GoalTier } from "./GoalTierModel";

export interface ProductElementType extends GoalTier {}

export type IssueStatus = {
  id: string;
  name: string;
}