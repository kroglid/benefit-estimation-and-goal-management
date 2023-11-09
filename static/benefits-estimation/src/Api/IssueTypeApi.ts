import { invoke } from "@forge/bridge";
import { IssueStatus, ProductElementType } from "../Models/IssueTypeModel";

export const issueTypeApi = () => {
  return {
    getAllIssueTypes: (projectId: string): Promise<ProductElementType[]> => {
      return invoke('getIssueTypes', { projectId: projectId });
    },
    getAllIssueStatuses: (projectId: string): Promise<IssueStatus[]> => {
      return invoke('getIssueStatuses', { projectId: projectId });
    }
  }
}