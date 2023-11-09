import { invoke } from "@forge/bridge";
import { IssueStatus, ProductElementType } from "../Models/IssueTypeModel";
import { Project } from "../Models/ProjectModel";

export const getProject = (projectId: string): Promise<Project | undefined> => {
  return invoke("getProject", { projectId });
};

export const projectApi = () => {
  return {
    get: (projectId: string): Promise<Project> => {
      return invoke("getProject", { projectId });
    },
    connect: (projectId: string, portfolioId: string) => {
      return invoke("connectProjectToPortfolio", { projectId, portfolioId });
    },
    disconnect: (projectId: string) => {
      return invoke("disconnectProjectToPortfolio", { projectId });
    },
    getSelectedIssueType: (projectId: string): Promise<ProductElementType> => {
      return invoke("getProductElementType", { projectId });
    },
    setSelectedIssueType: (projectId: string, issueTypeId: string) => {
      return invoke("setProductElementType", { projectId, issueTypeId });
    },
    getSelectedIssueStatuses: (projectId: string): Promise<IssueStatus[]> => {
      return invoke("getSelectedIssueStatuses", { projectId });
    },
    setSelectedIssueStatuses: (projectId: string, issueStatusesIds: string[]) => {
      return invoke("setSelectedIssueStatuses", { projectId, issueStatusesIds });
    },
    reset: (projectId: string) => {
      return invoke("resetProject", { projectId });
    }
  }
}