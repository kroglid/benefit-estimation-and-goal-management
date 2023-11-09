import { GCHeadDA } from "../dataAccess/GoalCollectionDA";
import { GoalTier } from "../models/GoalTierModel";
import { PortfolioItems } from "../models/PortfolioItemModel";
import { ScopeTypeEnum } from "../models/ScopeModel";
import { getAllGoalCollectionsByRanking, getGoalCollection } from "./GoalCollectionService";
import { getProductElementType } from "./ProjectService";

export const getTopRankedGoalTier = async (scopeId: string): Promise<GoalTier | undefined> => {
  console.log(`Getting top ranked Goal Collection: gc-${scopeId}-`)
  return GCHeadDA.get(scopeId).then(async (head) => {
    if (head && head.goalCollectionIds && head.goalCollectionIds.length > 0) {
      return await getGoalCollection(scopeId, head.goalCollectionIds[0]);
    }else{
      if (scopeId.startsWith('pf')) {
        return undefined;
      }
      return getProductElementType(scopeId)
    }
  });
}

export const getAllGoalTiers = async (scopeId: string, scopeType: ScopeTypeEnum): Promise<GoalTier[]> => {
  const goaltiers: GoalTier[] = await getAllGoalCollectionsByRanking(scopeId);
  if (scopeType === ScopeTypeEnum.PROJECT) {
    goaltiers.unshift(await getProductElementType(scopeId));
  }else{
    goaltiers.unshift(PortfolioItems(scopeId));
  }
  return goaltiers;
}