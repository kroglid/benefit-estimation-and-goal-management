import Resolver from "@forge/resolver";
import { Project } from "../models/ProjectModel";
import { connectProjectToPortfolio, disconnectProjectToPortfolio, getProject, setProductElementType, getIssueStatuses, setIssueStatuses, resetProject, getProductElementType } from "../services/ProjectService";
import { IssueStatus, ProductElementType } from "../models/IssueTypeModel";

export const projectResolver = (resolver: Resolver) => {
  // get
  resolver.define('getProject', async ({ payload: { projectId } }): Promise<Project | undefined> => {
    return getProject(projectId)
  });
  // conncet
  resolver.define('connectProjectToPortfolio', async ({ payload: { projectId, portfolioId } }) => {
    return connectProjectToPortfolio(projectId, portfolioId)
  });
  // disconnect
  resolver.define('disconnectProjectToPortfolio', async ({ payload: { projectId } }) => {
    return disconnectProjectToPortfolio(projectId)
  });
  // get Selected Issue Type
  resolver.define('getProductElementType', async ({ payload: { projectId } }): Promise<ProductElementType> => {
    return getProductElementType(projectId)
  });
  // set Selected Issue Type
  resolver.define('setProductElementType', async ({ payload: { projectId, issueTypeId } }) => {
    return setProductElementType(projectId, issueTypeId)
  });
  // get Selected Issue Statuses
  resolver.define('getSelectedIssueStatuses', async ({ payload: { projectId } }): Promise<IssueStatus[]> => {
    return getIssueStatuses(projectId)
  });
  // set Selected Issue Statuses
  resolver.define('setSelectedIssueStatuses', async ({ payload: { projectId, issueStatusesIds } }) => {
    return setIssueStatuses(projectId, issueStatusesIds)
  });
  // reset
  resolver.define('resetProject', async ({ payload: { projectId } }) => {
    return resetProject(projectId)
  })
}