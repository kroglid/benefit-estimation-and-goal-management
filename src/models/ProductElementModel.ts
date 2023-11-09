import { balancedPoints, distributedPoints } from "./EstimationModel";
import { Goal } from "./GoalModel";
import { IssueStatus } from "./IssueTypeModel";

export const issueProperties = {
  balancedPoints: 'abegm_benefit_points',
  distributedPoints: 'abegm_distributed_points'
}
export interface ProductElement extends Goal {
  status: IssueStatus;
}

export interface FetchedIssue {
  id: string;
  key: string;
  fields: {
    summary: string;
    status: IssueStatus;
  }
  properties: {
    abegm_benefit_points?: balancedPoints;
    abegm_distributed_points?: distributedPoints;
  }
}
export interface FetchedIssue {
  issues: FetchedIssue[];
  startAt: number;
  maxResults: number;
  total: number;
}