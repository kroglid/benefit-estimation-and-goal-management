import Button, { ButtonGroup, LoadingButton } from "@atlaskit/button";
import React, { Fragment, useState, useEffect, useContext } from "react";
import Drawer from "@atlaskit/drawer";
import { useNavigate, useParams } from "react-router";
import Form, { ErrorMessage, Field, FormFooter, FormHeader, FormSection, HelperMessage } from "@atlaskit/form";
import TextField from "@atlaskit/textfield";
import TextArea from "@atlaskit/textarea";
import { useAppContext } from "../../Contexts/AppContext";
import { GoalCollection } from "../../Models/GoalCollectionModel";
import { useFlags } from "@atlaskit/flag";
import { token } from "@atlaskit/tokens";
import { G300 } from "@atlaskit/theme/colors";
import SuccessIcon from '@atlaskit/icon/glyph/check-circle';
import { useAPI } from "../../Contexts/ApiContext";
import { GoalTierTypeEnum } from "../../Models/GoalTierModel";

type data = {
  name: string;
  description: string;
};

type AdminGoalCollectionProps = {
  mode: "create" | "edit";
};

export const AdminGoalCollection = (props: AdminGoalCollectionProps) => {

  const [goalCollection, setGoalCollection] = useState<GoalCollection | undefined>(undefined)
  const [isLoading, setLoading] = useState<boolean>(props.mode === "edit" ? true : false)

  const { goal_collection_id } = useParams();
  
  const navigation = useNavigate();
  const [scope] = useAppContext();
  const api = useAPI();
  const { showFlag } = useFlags();

  useEffect(() => {
    if (props.mode === "edit") {
      api.goalCollection.get(scope.id, goal_collection_id!).then((response) => {
        console.log(response)
        if (response === undefined) {
          closeDrawer(false)
        }else{
          setGoalCollection(response)
          setLoading(false)
        }
      }).catch((error) => {
        console.error(error)
        closeDrawer(false)
      });
    }
  }, [])

  const update = (goalCollection: GoalCollection, data: data) => {
    goalCollection.name = data.name
    goalCollection.description = data.description
    if (scope) {
      api.goalCollection.update(scope.id, goalCollection).then((response) => {
        showFlag({
          icon: <SuccessIcon label="Success" primaryColor={token('color.icon.success', G300)} />,
          title: `Updated ${goalCollection.name}`,
          actions: [
            {
              content: `View Goal Collection`,
              onClick: () => {
                navigation(`../goal-tier/${goalCollection.type}/${goalCollection.id}`)
              },
            },
            {
              content: `Add Goals`,
              onClick: () => {
                navigation(`../../goal-tier/${goalCollection.type}/${goalCollection.id}/create-goal`)
              },
            },
          ],
          isAutoDismiss: true
        });
        closeDrawer(true)
      }).catch((error) => {
        console.error(error)
        closeDrawer(false)
      });
    }
  }

  const create = (data: data) => {
    const goalCollection: GoalCollection = {id: `0`, scopeId: scope.id, type: GoalTierTypeEnum.GOAL_COLLECTION, name: data.name, description: data.description}
    if (scope) {
      api.goalCollection.create(scope.id, goalCollection).then((response) => {
        showFlag({
          icon: <SuccessIcon label="Success" primaryColor={token('color.icon.success', G300)} />,
          title: `Created ${goalCollection.name}`,
          actions: [
            {
              content: `View Goal Collection`,
              onClick: () => {
                navigation(`../goal-tier/${goalCollection.type}/${goalCollection.id}`)
              },
            },
            {
              content: `Add Goals`,
              onClick: () => {
                navigation(`../../goal-tier/${goalCollection.type}/${goalCollection.id}/create-goal`)
              },
            },
          ],
          isAutoDismiss: true
        });
        console.log(response)
        closeDrawer(true)
      }).catch((error) => {
        console.error(error)
        closeDrawer(false)
      });
    }
  }

  const closeDrawer = (refresh: boolean) => {
    console.log("close drawer")
    if (refresh) {
      navigation('..', { state: { refresh: true } })
    }else{
      navigation('..')
    }
  }

  return(
    <Drawer onClose={() => closeDrawer(false)} isOpen={true}>
      {isLoading ? (
        <div>Loading...</div>
      ):(
        <div style={{ marginRight: "50px" }}>
          <Form<{ name: string; description: string; }>
            onSubmit={(data: data) => {
              console.log("form data", data);
              console.log(scope.id)
              return new Promise((resolve) => {
                if (props.mode === "edit" && goalCollection) {
                  update(goalCollection, data)
                }else{
                  create(data)
                }
              });
            }}
          >
            {({ formProps, submitting }) => (
              <form {...formProps}>
                <FormHeader
                  title={props.mode === "edit" ? "Edit Goal Collection" : "Create Goal Collection"}
                  description="* indicates a required field"
                />
                <FormSection>
                  <Field
                    aria-required={true}
                    name="name"
                    label="Name"
                    isRequired
                    defaultValue={props.mode === "edit" ? goalCollection?.name : ""}
                    validate={(value) => {
                      if (value && value.length < 3){
                        return "Too short"
                      }else if(value && value.length > 50){
                        return "Too long"
                      }else if (value && value.replace(/[^a-zA-Z]/g, '').length < 4){
                        return "Must contain at least four letters"
                      }else{
                        return undefined
                      }
                    }
                    }
                  >
                    {({ fieldProps, error }) => (
                      <Fragment>
                        <TextField autoComplete="off" {...fieldProps} />
                        {!error && (
                          <HelperMessage>
                            You can use letters, numbers and periods.
                          </HelperMessage>
                        )}
                        {error && <ErrorMessage>{error}</ErrorMessage>}
                      </Fragment>
                    )}
                  </Field>
                  <Field
                    aria-required={true}
                    name="description"
                    label="Description"
                    isRequired
                    defaultValue={props.mode === "edit" ? goalCollection?.description : ""}
                    validate={(value) =>
                      value && value.length < 8 ? "TOO_SHORT" : undefined
                    }
                  >
                    {({ fieldProps, error }: any) => (
                      <Fragment>
                        <TextArea {...fieldProps} />
                        {!error && (
                          <HelperMessage>
                            You can use letters, numbers and periods.
                          </HelperMessage>
                        )}
                        {error && <ErrorMessage>{error}</ErrorMessage>}
                      </Fragment>
                    )}
                  </Field>
                </FormSection>

                <FormFooter>
                  <ButtonGroup>
                    <Button appearance="subtle" onClick={() => closeDrawer(false)}>
                      Cancel
                    </Button>
                    <LoadingButton
                      type="submit"
                      appearance="primary"
                      isLoading={submitting}
                    >
                      {props.mode === "edit" ? "Update" : "Create"}
                    </LoadingButton>
                  </ButtonGroup>
                </FormFooter>
              </form>
            )}
          </Form>
        </div>
      )}
    </Drawer>
  );
};
