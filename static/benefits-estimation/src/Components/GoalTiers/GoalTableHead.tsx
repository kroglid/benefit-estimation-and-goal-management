import { HeadType } from "@atlaskit/dynamic-table/dist/types/types";
import { GoalTier, GoalTierTypeEnum } from "../../Models/GoalTierModel";

export const GoalTableHead = (goalTier: GoalTier): HeadType | undefined => {
  return {
    cells: [
      {
        key: 'name',
        content: 'Name',
        isSortable: true,
      },
      {
        key: 'description',
        content: 'Description',
        isSortable: true,
        shouldTruncate: true,
      },
      ...goalTier.type === GoalTierTypeEnum.PRODUCT_ELEMENT_TYPE ? [
        {
          key: 'status',
          content: 'Status',
          isSortable: true,
        }
      ] : [],
      ...goalTier.type === GoalTierTypeEnum.PORTFOLIO_ITEM ? [
        {
          key: 'type',
          content: 'Type',
          isSortable: true,
        }
      ] : [],
      {
        key: 'balancedPoints',
        content: goalTier.type === GoalTierTypeEnum.PRODUCT_ELEMENT_TYPE ? 'Benefit Points' : goalTier.type === GoalTierTypeEnum.PORTFOLIO_ITEM ? 'Portfolio Item Points' : 'Weight',
        isSortable: true
      },
      ...goalTier.type !== GoalTierTypeEnum.PRODUCT_ELEMENT_TYPE ? [
        {
          key: 'action',
          content: 'Action',
          isSortable: false,
        }
      ] : [],
    ]
  }
};