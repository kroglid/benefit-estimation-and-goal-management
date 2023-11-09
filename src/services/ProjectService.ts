import { requestAPI } from "../api/requestAPI";
import { FetchedProjects, Project, FetchedProject, projectPropertyKeys } from "../models/ProjectModel";
import { IssueStatus, ProductElementType } from "../models/IssueTypeModel";
import { route } from "@forge/api";
import { addPortfolioItem, removePortfolioItem } from "./PortfolioService";
import { ScopeTypeEnum } from "../models/ScopeModel";
import { balancedPoints } from "../models/EstimationModel";
import { flushGoalCollections } from "./GoalCollectionService";
import { resetProductElements } from "./ProductElementService";
import { getIssueStatusesById, getIssueType } from "./IssueTypeService";

const queryProject = async (page?: string) => {
  console.log('pService', 'Query Projects')
  const queryParams = new URLSearchParams({
    fields: "summary, subtasks",
    expand: "description",
    properties: `${projectPropertyKeys.issueStatusesIds}, ${projectPropertyKeys.issueTypeId}, ${projectPropertyKeys.connectedPortfolioId}, ${projectPropertyKeys.portfolioItemPoints}`
  });
  const Route = route`/rest/api/3/project/search?${queryParams}`
  return requestAPI.get(Route)
  .then((response: FetchedProjects) => response)
  .catch((error) => {
    console.error('here', error);
    return Promise.reject('Something went wrong ' + error);
  });
}

export const getAllProjects = async (page?: string): Promise<Project[]> => {
  console.log('pService', 'Get All Projects')
  return queryProject(page)
  .then(async ({values, startAt, maxResults, total}) => {
    const projects: Project[] = values.map((project): Project => ({
      id: project.id,
      name: project.name,
      description: project.description,
      type: ScopeTypeEnum.PROJECT,
      issueTypeId: project.properties.abegm_issue_type_id,
      issueStatusesIds: project.properties.abegm_issue_statuses_ids,
      connectedPortfolio: project.properties.abegm_connected_portfolio_id,
      portfolioItemPoints: project.properties.abegm_portfolio_item_points
    }));
    if (startAt + maxResults < total) {
      const page = (startAt + maxResults).toString()
      return projects.concat(await getAllProjects(page));
    }else{
      return projects;
    }
  }).catch((error) => {
    console.error(error);
    return Promise.reject(error);
  })
}

export const getProject = async (projectId: string): Promise<Project | undefined> => {
  console.log('pService', 'Get Project Details: ', projectId)
  const queryParams = new URLSearchParams({
    properties: `${projectPropertyKeys.issueStatusesIds}, ${projectPropertyKeys.issueTypeId}, ${projectPropertyKeys.connectedPortfolioId}, ${projectPropertyKeys.portfolioItemPoints}`
  });
  const Route = route`/rest/api/3/project/${projectId}?${queryParams}`
  return requestAPI.get(Route).then(async (project: FetchedProject | undefined) => {
    if(!project){
      return undefined;
    }
    return {
      id: project.id,
      name: project.name,
      description: project.description,
      type: ScopeTypeEnum.PROJECT,
      issueTypeId: project.properties.abegm_issue_type_id,
      issueStatusesIds: project.properties.abegm_issue_statuses_ids,
      connectedPortfolio: project.properties.abegm_connected_portfolio_id,
      portfolioItemPoints: project.properties.abegm_portfolio_item_points
    } as Project;
  }).catch((error) => {
    console.error(error);
    return undefined;
  });
}

export const getProjectsConnectedToAPortfolio = async (portfolioId: string): Promise<Project[]> => {
  console.log('pService', 'Get Projects Connected to a Portfolio: ', portfolioId)
  return getAllProjects().then((projects) => {
    return projects.filter((project) => {
      return project.connectedPortfolio === portfolioId;
    });
  });
}

export const getUnconnectedProjects = async (): Promise<Project[]> => {
  console.log('pService', 'Get Unconnected Projects')
  return getAllProjects().then((projects) => {
    return projects.filter((project) => {
      return !project.connectedPortfolio;
    });
  });
}

export const connectProjectToPortfolio = async (projectId: string, portfolioId: string) => {
  console.log('pService', 'Connect Project to Portfolio: ', projectId, portfolioId)
  if (!portfolioId.startsWith('pf')){
    return Promise.reject('Invalid portfolio id');
  }
  return addPortfolioItem(portfolioId, {id: projectId, type: ScopeTypeEnum.PROJECT}).then(() => {
    const propertyKey = projectPropertyKeys.connectedPortfolioId;
    const Route = route`/rest/api/3/project/${projectId}/properties/${propertyKey}`;
    return requestAPI.put(Route, portfolioId)
    .catch((error) => {
      return Promise.reject(`Something went wrong ${error}`);
    });
  });
}

export const disconnectProjectToPortfolio = async (projectId: string) => {
  console.log('pService', 'Disconnect Project to Portfolio: ', projectId)
  const propertyKey = projectPropertyKeys.connectedPortfolioId;
  const Route = route`/rest/api/3/project/${projectId}/properties/${propertyKey}`;
  return requestAPI.get(Route).then((response) => {
    const portfolioId = response.value as string;
    console.log(portfolioId)
    return removePortfolioItem(portfolioId, projectId).then(() => {
      return requestAPI.delete(Route).then(() => {
        return resetPortfolioItemPointsToProject(projectId)
      })
      .catch((error) => {
        console.error(error);
        return addPortfolioItem(portfolioId, {id: projectId, type: ScopeTypeEnum.PROJECT})
      });
    }).catch((error) => {
      requestAPI.delete(Route);
    });
  })
}

export const getProductElementType = async (projectId: string): Promise<ProductElementType> => {
  console.log('pService', 'Get Product Element Type: ', projectId)
  const propertyKey = projectPropertyKeys.issueTypeId;
  const Route = route`/rest/api/3/project/${projectId}/properties/${propertyKey}`;
  return await requestAPI.get(Route).then(async (response) => {
    return getIssueType(projectId, response.value.id)
  }).catch((error) => {
    return Promise.reject('No product element type');
  })
};

export const setProductElementType = async (projectId: string, issueTypeId: string) => {
  console.log('pService', 'Set Product Element Type: ', issueTypeId)
  const propertyKey = projectPropertyKeys.issueTypeId;
  const Route = route`/rest/api/3/project/${projectId}/properties/${propertyKey}`;
  return requestAPI.put(Route, {id: issueTypeId})
};

const resetProductElementType = async (projectId: string) => {
  console.log('pService', 'Reset Product Element Type: ', projectId)
  const propertyKey = projectPropertyKeys.issueTypeId;
  const Route = route`/rest/api/3/project/${projectId}/properties/${propertyKey}`;
  return requestAPI.delete(Route)
}

export const getIssueStatuses = async (projectId: string): Promise<IssueStatus[]> => {
  console.log('pService', 'Get Selected Issue Type: ', projectId)
  const propertyKey = projectPropertyKeys.issueStatusesIds;
  const Route = route`/rest/api/3/project/${projectId}/properties/${propertyKey}`;
  return requestAPI.get(Route).then(async (response) => {
    if (!response) return [];
    return getIssueStatusesById(projectId, response.value)
  }).catch((error) => {
    console.error(error);
    return Promise.reject(`Something went wrong ${error}`);
  })
};

export const setIssueStatuses = async (projectId: string, issueStatusesIds: string[]) => {
  console.log('pService', 'Set Selected Epic Issue Type: ', issueStatusesIds)
  const propertyKey = projectPropertyKeys.issueStatusesIds;
  const Route = route`/rest/api/3/project/${projectId}/properties/${propertyKey}`;
  return await requestAPI.put(Route, issueStatusesIds)
};

const resetIssueStatuses = async (projectId: string) => {
  console.log('pService', 'Reset Selected Epic Issue Type: ', projectId)
  const propertyKey = projectPropertyKeys.issueStatusesIds;
  const Route = route`/rest/api/3/project/${projectId}/properties/${propertyKey}`;
  return requestAPI.delete(Route)
}

export const setPortfolioItemPointsToProject = async (projectId: string, connectionPoints: balancedPoints) => {
  console.log('pService', 'Set Portfolio Item Points: ', projectId, connectionPoints)
  const propertyKey = projectPropertyKeys.portfolioItemPoints;
  const Route = route`/rest/api/3/project/${projectId}/properties/${propertyKey}`;
  return requestAPI.put(Route, connectionPoints)
}

export const resetPortfolioItemPointsToProject = async (projectId: string) => {
  console.log('pService', 'Reset Portfolio Item Points: ', projectId)
  const propertyKey = projectPropertyKeys.portfolioItemPoints;
  const Route = route`/rest/api/3/project/${projectId}/properties/${propertyKey}`;
  return requestAPI.delete(Route)
}

export const resetProject = async (projectId: string) => {
  console.log('pService', 'Reset Project: ', projectId)
  return await resetProductElements(projectId).then(() => {
    const promises = [
      resetProductElementType(projectId).catch((error) => {
        console.error('Could not reset Selected Issue Type');
      }),
      resetIssueStatuses(projectId).catch((error) => {
        console.error('Could not reset Issue Statuses');
      }),
      flushGoalCollections(projectId).catch((error) => {
        console.error('Could not flush Goal Collections');
      }),
      disconnectProjectToPortfolio(projectId).catch((error) => {
        console.error('Could not disconnect Project to Portfolio');
      })
    ]
    return Promise.resolve(promises)
  }).catch((error) => {
    console.error(error);
    return Promise.reject(error);
  });
}