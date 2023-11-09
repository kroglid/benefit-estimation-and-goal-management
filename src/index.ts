import Resolver from "@forge/resolver";
import { goalCollectionResolver } from "./resolvers/GoalCollectionResolver";
import { goalApi } from "./resolvers/GoalResolver";
import { portfolioResolver } from "./resolvers/PortfolioResolver";
import { projectResolver } from "./resolvers/ProjectResolver";
import { scopeResolver } from "./resolvers/ScopeResolver";
import { portfolioItemResolver } from "./resolvers/PortfolioItemResolver";
import { goalTierResolver } from "./resolvers/GoalTierResolver";
import { issueTypeResolver } from "./resolvers/IssueTypeResolver";
import { resetApp } from "./services/AppService";
import { estimationResolver } from "./resolvers/EstimationResolver";
import { productElementResolver } from "./resolvers/ProductElementResolver";

const resolver = new Resolver();

const models = async (resolver: Resolver) => {
  estimationResolver(resolver);
  productElementResolver(resolver);
  issueTypeResolver(resolver);
  portfolioItemResolver(resolver);
  portfolioResolver(resolver);
  projectResolver(resolver);
  goalApi(resolver);
  goalCollectionResolver(resolver)
  goalTierResolver(resolver);
  scopeResolver(resolver);
  
  resolver.define('resetApp', async () => {
    await resetApp();
  });
}

models(resolver);

export const handler = resolver.getDefinitions();