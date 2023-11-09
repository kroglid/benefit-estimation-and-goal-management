import { Goal } from "./GoalModel";
import { IssueStatus } from "./IssueTypeModel";

export interface ProductElement extends Goal {
  status: IssueStatus;
}