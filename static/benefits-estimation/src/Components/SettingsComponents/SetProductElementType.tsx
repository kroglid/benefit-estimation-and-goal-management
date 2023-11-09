import React, { useState, useEffect } from "react";
import Select from "@atlaskit/select";
import { LoadingButton } from "@atlaskit/button";
import { Inline, Stack, xcss } from "@atlaskit/primitives";
import { useAppContext, ScopeTypeEnum } from "../../Contexts/AppContext";
import { ProductElementType } from "../../Models/IssueTypeModel";
import { useAPI } from "../../Contexts/ApiContext";
import { GoalTierTypeEnum } from "../../Models/GoalTierModel";

type value = {
  label: string;
  value: string;
};

type SetProductElementType = {
  onSave?: () => void;
}

export const SetProductElementType = (props: SetProductElementType) => {
  const [isLoading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setSubmitting] = useState<boolean>(false);
  const [issueTypes, setIssueTypes] = useState<ProductElementType[]>([]);
  const [options, setOptions] = useState<value[]>([])
  const [productElementType, setSelectedIssueType] = useState<value >();

  const [scope] = useAppContext();
  const api = useAPI();

  const fetch = async () => {
    if (scope.type === ScopeTypeEnum.PROJECT) {
      api.project.getSelectedIssueType(scope.id).then((selectedEpicIssueType) => {
        setSelectedIssueType({ label: selectedEpicIssueType.name, value: selectedEpicIssueType.id });
        setLoading(false);
      }).catch((error) => {
        console.error(error)
      });
      api.issueType.getAllIssueTypes(scope.id).then((response) => {
        setOptions(response.map((issueType: any) => {
          return { label: issueType.name, value: issueType.id };
        }));
        setIssueTypes(response);
        setLoading(false);
      }).catch((error) => {
        console.log(error)
      });
    }
  }

  useEffect(() => {
    fetch();
  }, []);

  const save = async() => {
    setSubmitting(true);
    if (productElementType) {
      const issueType = issueTypes.find((i) => i.id === productElementType.value);
      if (issueType) {
        api.project.setSelectedIssueType(scope.id, productElementType.value).then(()=>{
          fetch().then(()=>{
            setSubmitting(false);
            if (props.onSave) {
              props.onSave();
            }
          }).catch((error) => {
            console.error(error)
            setSubmitting(false);
          })
        }).catch((error) => {
          console.error(error)
          setSubmitting(false);
        })
        return;
      }
    }
    console.log("something went wrong")
  }

  return (
    <Stack space="space.100">
      <h4>Selected Product Element</h4>
      <Select
        inputID="single-select-example"
        className="single-select"
        classNamePrefix="react-select"
        value={productElementType}
        isLoading={isLoading}
        onChange={(value) => {
          if (value) {
            setSelectedIssueType(value!)
          }
        }}
        options={options}
        placeholder="Select an Issue Type"
      />
      <Inline xcss={xcss({marginTop: 'space.100'})} space={"space.100"} alignInline={"end"}>
        <LoadingButton 
          onClick={() => save()} 
          type="submit" 
          appearance="primary" 
          isLoading={isSubmitting}
          isDisabled={isLoading || !productElementType}
        >
          Save
        </LoadingButton>
      </Inline>
    </Stack>
  );
};
