import Resolver from "@forge/resolver";
import { getAllIssueStatuses, getAllIssueTypes } from "../services/IssueTypeService";
import { IssueStatus, ProductElementType } from "../models/IssueTypeModel";

export const issueTypeResolver = (resolver: Resolver) => {
  
  resolver.define('getIssueTypes', async ({ payload: { projectId } }): Promise<ProductElementType[]> => {
    console.log('Resolver',`Getting Issue Types`)
    return getAllIssueTypes(projectId)
  });
  resolver.define('getIssueStatuses', async ({ payload: { projectId } }): Promise<IssueStatus[]> => {
    console.log('Resolver',`Getting Issue Statuses`)
    return getAllIssueStatuses(projectId)
  })
}