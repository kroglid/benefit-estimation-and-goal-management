import { Box, Flex, xcss } from '@atlaskit/primitives'
import { CriteriaGoalContainer } from "../../Components/Estimation/Table/Head/CriteriaGoalContainer";
import { EstimationTargetContextProvider } from "./EstimationTargetContext";
import { useEstimation } from "./EstimationContext";
import { CriteriaGoalLabel } from "../../Components/Estimation/Table/Head/CriteriaGoalLabel";
import { LoadingButton } from "@atlaskit/button";

export const EstimationContainer = () => {

  const { estimationTargets, criteriaGoals: criteriaGoals, readyToSubmit, isSubmitting, onSubmit } = useEstimation();

  const containerStyle = xcss({
    display: 'grid',
    width: 'max-content',
    position: 'relative',
    gridTemplateColumns: '100%',
    maxWidth: '100%',
    border: '1px solid',
    borderColor: 'color.border',
    marginBottom: 'space.1000',
  })

  const HeaderGridStyle = xcss({
    gridColumn: '1',
    gridRow: '1',
    height: '100%'
  })

  const ContentGridStyle = xcss({
    gridColumn: '1',
    gridRow: '1',
  })

  return(
    <>
      <Box
        xcss={containerStyle}
      >
        <Box xcss={HeaderGridStyle}>
          <CriteriaGoalContainer>
            {criteriaGoals.map((criteriaGoal) => {
              return(
                <CriteriaGoalLabel 
                  key={`${criteriaGoal.id}-label`}
                  criteriaGoal={criteriaGoal} 
                />
              )
            })}
          </CriteriaGoalContainer>
        </Box>
        {/* ContentGrid */}
        <Box xcss={ContentGridStyle}>
          {estimationTargets.map((target, index) => {
              return(
                <EstimationTargetContextProvider
                  key={target.scope.id}
                  index={index}
                />
              )
          })}
        </Box>
          <Flex xcss={xcss({
            position: 'sticky',
            bottom: '0px',
            padding: 'space.100',
            backgroundColor: 'elevation.surface.sunken',
            zIndex: 'dialog',
            borderTop: '1px solid',
            borderColor: 'color.border',
            justifyContent: 'flex-end'
          })}>
            <LoadingButton 
              appearance='primary'
              isDisabled={!readyToSubmit}
              isLoading={isSubmitting} 
              onClick={() => {onSubmit()}}
            >
              Save
            </LoadingButton>
        </Flex>
      </Box>
    </>
  )
}
