import Button, { ButtonGroup } from "@atlaskit/button";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import DynamicTable from "@atlaskit/dynamic-table";
import { useAppContext } from "../../Contexts/AppContext";
import { useAPI } from "../../Contexts/ApiContext";
import { GoalTierHead } from "../../Components/GoalStructure/GoalTierHead";
import { GoalTierRows } from "../../Components/GoalStructure/GoalTierRows";
import PageHeader from "@atlaskit/page-header";
import { GoalTier } from "../../Models/GoalTierModel";

export const GoalStructure = () => {
  const [items, setItems] = useState<GoalTier[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isTtierLevelModeOn, setTierLevelMode] = useState<boolean>(false);

  const [scope] = useAppContext();
  const api = useAPI();
  const location = useLocation();
  const refresh = location.state?.refresh;
  const navigation = useNavigate();

  const fetchData = async () => {
    return api.goalTier.getAll(scope.id, scope.type).then((response) => {
      return response.reverse()
    }).catch((error) => {
      console.error(error)
      return []
    });
  }
  
  useEffect(() => {
    let isMounted = true; 
    setLoading(true);
    setTierLevelMode(false);
    fetchData().then((items) => {
      if (isMounted) {
        setItems(items);
        setLoading(false);
      }
    });
    return () => { isMounted = false };
  }, [refresh]);

  const onTierChange = (params: any) => {
    console.log(params)
    if (!params.destination || params.sourceKey === params.destination.afterKey) return;
    navigation(`change-tier-level/${params.sourceKey}/${params.destination?.afterKey}`)
  }

  const rows = useCallback(() => {
    return GoalTierRows(items, isTtierLevelModeOn)
  }, [items, isTtierLevelModeOn])

  const actions = (
    <ButtonGroup>
      <Button appearance="primary" onClick={() => navigation('create-goal-collection')}>New Goal Collection</Button>
      <Button
        isSelected={isTtierLevelModeOn}
        isDisabled={!items || items.length < 3}
        onClick={() => setTierLevelMode(!isTtierLevelModeOn)}
      >
        Change Tier Level
      </Button>
    </ButtonGroup>
  )

  return(
    <>
      <PageHeader
        actions={actions}
      >
        Goal Structure
      </PageHeader>
      <DynamicTable
        head={GoalTierHead()}
        rows={rows()}
        page={1}
        isRankable={isTtierLevelModeOn}
        onRankEnd={(params) => {onTierChange(params)}}
        loadingSpinnerSize="large"
        isLoading={loading}
      />
      <Outlet/>
    </>
  );
};