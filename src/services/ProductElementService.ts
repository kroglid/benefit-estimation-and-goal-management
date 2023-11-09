import { requestAPI } from "../api/requestAPI";
import { getIssueStatuses, getProductElementType } from "./ProjectService";
import { route } from "@forge/api";
import { balancedPoints, distributedPoints } from "../models/EstimationModel";
import { IssueStatus, ProductElementType } from "../models/IssueTypeModel";
import { issueProperties, FetchedIssue, ProductElement } from "../models/ProductElementModel";
import { GoalTypeEnum } from "../models/GoalModel";

const queryProductElements = async (projectId: string, issueTypeId: string, issueStatuses: IssueStatus[], page?: string) => {
  console.log('iService', 'Query Issues')
  console.debug(issueStatuses)
  const statuses = issueStatuses.map((issueStatus) => issueStatus.id).join(' OR status = ');
  console.debug(statuses)
  const queryParams = new URLSearchParams({
    fields: "summary, subtasks, status",
    /* jql: `project = ${projectId} AND issuetype = ${issueTypeId}`, */
    jql: `project = ${projectId} AND issuetype = ${issueTypeId} AND (status = ${statuses})`,
    startAt: page ? page : "0",
    properties: `${issueProperties.balancedPoints}, ${issueProperties.distributedPoints}`,
  });
  const Route = route`/rest/api/3/search?${queryParams}`
  return requestAPI.get(Route)
  .then((response: FetchedIssue) => response)
  .catch((error) => {
    console.error('here', error);
    return Promise.reject('Something went wrong ' + error);
  });
}

export const getAllProductElements = async (projectId: string, issueTypeId: string, issueStatuses: IssueStatus[], page?: string): Promise<ProductElement[]> => {
  console.log('iService', 'Get All Issues')
  return queryProductElements(projectId, issueTypeId, issueStatuses, page)
  .then(async ({issues, startAt, maxResults, total}) => {
    console.log(issues)
    const productElements: ProductElement[] = issues.map((issue) => ({
      ...issue,
      goalCollectionId: issueTypeId,
      scopeId: projectId,
      type: GoalTypeEnum.PRODUCT_ELEMENT,
      description: issue.fields.summary,
      status: issue.fields.status as IssueStatus,
      balancedPoints: issue.properties.abegm_benefit_points,
      distributedPoints: issue.properties.abegm_distributed_points,
    }));
    if (startAt + maxResults < total) {
      const page = (startAt + maxResults).toString()
      return productElements.concat(await getAllProductElements(projectId, issueTypeId, issueStatuses, page));
    }else{
      return productElements;
    }
  }).catch((error) => {
    console.error(error);
    return Promise.reject(error);
  })
}

export const fetchProductElements = async (projectId: string): Promise<ProductElement[]> => {
  const promises: {issueType: Promise<ProductElementType>, issueStatuses: Promise<IssueStatus[]>} = {
    issueType: getProductElementType(projectId),
    issueStatuses: getIssueStatuses(projectId)
  };
  return Promise.all([promises.issueType, promises.issueStatuses])
  .then(([issueType, issueStatuses]) =>
    getAllProductElements(projectId, issueType.id, issueStatuses)
    .then((productElements) => productElements).catch((error) => {
      console.error(error);
      return Promise.reject(error);
    })
  ).catch((error) => {
    console.error(error);
    return Promise.reject(error);
  })
}

export const fetchProductElement = async (scopeId: string, issueTypeId: string): Promise<ProductElement> => {
  const queryParams = new URLSearchParams({
    properties: `${issueProperties.balancedPoints}, ${issueProperties.distributedPoints}`,
  });
  const Route = route`/rest/api/3/issue/${issueTypeId}?${queryParams}`
  return requestAPI.get(Route).then((issue: FetchedIssue) => {
    if(!issue) return Promise.reject('Issue not found');
    return {
      ...issue,
      goalCollectionId: issueTypeId,
      scopeId: scopeId,
      type: GoalTypeEnum.PRODUCT_ELEMENT,
      description: issue.fields.summary,
      status: issue.fields.status as IssueStatus,
      balancedPoints: issue.properties.abegm_benefit_points,
      distributedPoints: issue.properties.abegm_distributed_points,
    };
  }).catch((error) => {
    console.error(error);
    return Promise.reject(error);
  });
};

export const setBenefitPoints = async (issueTypeId: string, balancedPoints?: balancedPoints) => {
  console.log("Issue Service", "Set Point to Issue: ", issueTypeId)
  const propertyKey = issueProperties.balancedPoints;
  const Route = route`/rest/api/3/issue/${issueTypeId}/properties/${propertyKey}`;
  return requestAPI.put(Route, balancedPoints)
  .catch((error) => {
    console.error(error);
    return {ok: false};
  });
}

const resetBenefitPoints = async (issueTypeId: string) => {
  console.log("Issue Service", "Reset BenefitPoints to Issue: ", issueTypeId)
  const propertyKey = issueProperties.balancedPoints;
  const Route = route`/rest/api/3/issue/${issueTypeId}/properties/${propertyKey}`;
  return requestAPI.delete(Route)
  .catch((error) => {
    console.error(error);
    return {ok: false};
  });
}

export const setDistributedPointsToIssue = async (issueTypeId: string, distributedPoints?: distributedPoints) => {
  console.log("Issue Service", "Set Distributed Points to Issue: ", issueTypeId)
  const propertyKey = issueProperties.distributedPoints;
  const Route = route`/rest/api/3/issue/${issueTypeId}/properties/${propertyKey}`;
  return requestAPI.put(Route, distributedPoints)
  .catch((error) => {
    console.error(error);
    return Promise.reject(error);
  });
}

const resetDistributedPointsToIssue = async (issueTypeId: string) => {
  console.log("ProductElement Service", "Reset Distributed Points to ProductElement: ", issueTypeId)
  const propertyKey = issueProperties.distributedPoints;
  const Route = route`/rest/api/3/issue/${issueTypeId}/properties/${propertyKey}`;
  return requestAPI.delete(Route)
  .catch((error) => {
    console.error(error);
    return Promise.reject(error);
  });
}

export const resetProductElements = async (projectId: string) => {
  return fetchProductElements(projectId).then(async (productElements) => {
    const promises: Promise<any>[] = [];
    for (const productElement of productElements) {
      promises.push(
        resetDistributedPointsToIssue(productElement.id)
      )
      promises.push(
        resetBenefitPoints(productElement.id)
      )
    };
    return Promise.all(promises)
    .catch((error) => {
      console.error('could not reset issues');
      console.error(error);
      return Promise.reject(error);
    });
  }).catch((error) => {
    console.error('could not fetch issues');
    console.error(error);
    return {ok: false}
  });
}