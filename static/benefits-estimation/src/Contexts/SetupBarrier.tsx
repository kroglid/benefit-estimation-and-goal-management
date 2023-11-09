import { ReactNode, useEffect, useMemo, useState } from "react";
import { Project } from "../Models/ProjectModel";
import { getProject } from "../Api/ProjectApi";
import { Portfolio } from "../Models/PortfolioModel";
import { SetProductElementType } from "../Components/SettingsComponents/SetProductElementType";
import { ScopeTypeEnum, useAppContext } from "./AppContext";
import { Loading } from "../Components/Common/Loading";
import { SetIssueStatuses } from "../Components/SettingsComponents/SetIssueStatuses";
import { ProgressTracker, Stages } from '@atlaskit/progress-tracker';
import PageHeader from "@atlaskit/page-header";
import { Stack } from "@atlaskit/primitives";

type SetupBarrierProps = {
  children: ReactNode
}

export type SetupBarrierContextType = {
  getCurrentLocationDetails: () => Promise<Project | Portfolio | undefined>; 
}

export const SetupBarrierProvider = ({children}: SetupBarrierProps) => {

  const [isLoading, setLoading] = useState<boolean>(true);
  const [isFetching, setFetching] = useState<boolean>(false);
  const [issueType, setIssueType] = useState<string>();
  const [issueStatuses, setIssueStatuses] = useState<string[]>();

  const [scope] = useAppContext();

  const checkProject = async () => {
    setFetching(true);
    if (scope.type === ScopeTypeEnum.PROJECT) {
      await getProject(scope.id).then((project) => {
        if (project) {
          console.log(project)
          setIssueType(project.issueTypeId);
          setIssueStatuses(project.issueStatusesIds);
          setFetching(false);
          return project.issueTypeId;
        }else{
          console.error("Cant find project");
          setIssueType(undefined);
          setIssueStatuses(undefined);
          setFetching(false);
          return undefined;
        }
      })
    }
  }

  useEffect(() => {
    setLoading(true)
    checkProject().then(() => setLoading(false))
  }, [scope])

  const authorized = useMemo(() => {
    return issueType && issueStatuses && issueStatuses.length > 0;
  }, [issueType, issueStatuses])

  const items: Stages = [
    {
      id: 'disabled-1',
      label: 'Select Issue Type',
      percentageComplete: issueType? 100 : 0,
      status: issueType? 'disabled' : 'current',
    },
    {
      id: 'current-1',
      label: 'Select Issue Statuses',
      percentageComplete: 0,
      status: issueType? 'current' : 'disabled',
    },
  ];

  return (
    scope.type === ScopeTypeEnum.PROJECT ? (
      isLoading ? (
        <Loading/>
      ) : (
        authorized ? (
          <>
            {children}
          </>
        ):(
          <div style={{ 
            position: 'relative',
            marginTop: '24px',
            marginBottom: '24px',
            paddingLeft: '40px', 
            paddingRight: '40px'
          }}>
            <PageHeader>
              Project Initialization
            </PageHeader>
            <ProgressTracker items={items} />
            <div style={{marginTop: "1rem", maxWidth: "400px", display: "grid", gap: "1rem"}}>
              <Stack space="space.200">
                <Stack space="space.100">
                  <p>To initiate the Project, select the issue type you want to use as the product element. We recommend choosing Epic</p>
                  <SetProductElementType onSave={() => checkProject()}/>
                </Stack>
                {issueType && (
                  <Stack space="space.100">
                    <p>Select which issue statuses you want to estimate.<br/>The selection can be changed later in the settings</p>
                    <SetIssueStatuses onSave={() => checkProject()}/>
                  </Stack>
                )}
              </Stack>
            </div>
            {isFetching && (
              <Loading/>
            )}
           </div>
        )
      )
    ) : (
      <>
        {children}
      </>
    )
  )
}