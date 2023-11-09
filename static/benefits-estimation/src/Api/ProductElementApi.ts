import { invoke } from "@forge/bridge";
import { ProductElement } from "../Models/ProductElementModel";

export const productElementApi = () => {
  return {
    getAll: (projectId: string): Promise<ProductElement[]> => {
      return invoke('fetchProductElements', { projectId: projectId });
    }
  }
}