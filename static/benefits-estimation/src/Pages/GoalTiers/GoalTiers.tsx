import Button from "@atlaskit/button";
import { useState } from "react";
import { GoalTable } from "../../Components/GoalTiers/GoalTable";
import { useNavigate } from "react-router";
import { Inline } from "@atlaskit/primitives";
import DepartmentIcon from '@atlaskit/icon/glyph/department'
import { GoalCollection } from "../../Models/GoalCollectionModel";
import PageHeader from "@atlaskit/page-header";
import { SelectGoalTier } from "../../Components/GoalTiers/SelectGoalTier";

type option = {
  label: string;
  value:  GoalCollection;
}

export const GoalTiers = () => {
  const [selectedOption, setSelectedOption] = useState<option>()
  const [isFetching, setFetching] = useState<boolean>(false)
  
  const navigate = useNavigate()

  return(
    <>
      <PageHeader
        actions={
          <Inline>
            <Button onClick={() => navigate('../goal-structure')}>Edit Goal Structure</Button>
          </Inline>
        }
        bottomBar={
          <SelectGoalTier
            isDisabled={isFetching}
            onChange={(value) => {
              setSelectedOption(value)
            }}
          />
        }
      >
        Goal Tiers
      </PageHeader>
      {selectedOption && (
        <GoalTable
          goalTier={selectedOption.value}
          onFetching={(isFetching) => setFetching(isFetching)}
        />
      )}
    </>
  );
};
