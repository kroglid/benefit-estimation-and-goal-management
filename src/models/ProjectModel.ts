import { balancedPoints } from "./EstimationModel";
import { Scope } from "./ScopeModel";

export const projectPropertyKeys = {
  connectedPortfolioId: "abegm_connected_portfolio_id",
  issueTypeId: "abegm_issue_type_id",
  issueStatusesIds: "abegm_issue_statuses_ids",
  portfolioItemPoints: "abegm_portfolio_item_points"
}

export interface Project extends Scope {
  issueTypeId?: string;
  issueStatusesIds?: string[];
}

export interface FetchedProject {
  id: string;
  key: string;
  name: string;
  description: string;
  properties: {
    abegm_connected_portfolio_id?: string;
    abegm_issue_type_id?: string;
    abegm_issue_statuses_ids?: string[];
    abegm_portfolio_item_points?: balancedPoints;
  }
}

export interface FetchedProjects {
  values: FetchedProject[];
  startAt: number;
  maxResults: number;
  total: number;
}