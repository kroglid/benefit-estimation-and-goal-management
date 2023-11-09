import Resolver from "@forge/resolver"
import { fetchProductElements } from "../services/ProductElementService";
import { ProductElement } from "../models/ProductElementModel";

export const productElementResolver = (resolver: Resolver) => {
  //getAll
  resolver.define('fetchProductElements', async ({ payload: { projectId } }): Promise<ProductElement[]> => {
    console.log('eResolver', 'Fetch Issue from Project: ', projectId)
    return fetchProductElements(projectId);
  });
}