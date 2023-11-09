import { Grid, Box, Inline, xcss } from '@atlaskit/primitives';
import Tooltip from '@atlaskit/tooltip';
import { TargetLabelContainer } from './TargetLabelContainer';
import { useEstimationTarget } from '../../../../Pages/Estimation/EstimationTargetContext';
import { useEstimation } from '../../../../Pages/Estimation/EstimationContext';
import Button from '@atlaskit/button';
import RefreshIcon from '@atlaskit/icon/glyph/refresh'
import Lozenge from '@atlaskit/lozenge';
import { useMemo } from 'react';

export const StandardTargetLabel = () => {

  const { mode, criteriaGoals, pointsToDistribute } = useEstimation()
  const { goalTier, clearGoals, getTotalDPPoints } = useEstimationTarget()

  const totalDP = pointsToDistribute * criteriaGoals.length

  const totalPoints = useMemo(() => {
    let points = 0;
    for (const criteriaGoal of criteriaGoals) {
      points += getTotalDPPoints(criteriaGoal.id)
    }
    return points
  }, [getTotalDPPoints])

  return(
    <TargetLabelContainer
      mode={mode}
    >
        <Grid
        xcss={xcss({
          backgroundColor: 'elevation.surface.sunken',
          position: 'relative',
          gridTemplateRows: '32px 20px',
          borderRight: '1px solid',
          borderColor: 'color.border',
          paddingBottom: 'space.050',
          paddingLeft: 'space.200',
          paddingRight: 'space.200',
          overflow: 'hidden',
          alignItems: 'center',
          alignContent: 'space-between',
        })}
      >
          <Grid templateColumns='93px 24px' xcss={xcss({width: '100%', alignItems:'center'})}>
            <Tooltip content={goalTier.name}>
              <Box xcss={xcss({fontWeight: 'bold', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden', maxWidth: '100%'})}>
                {goalTier.name.toUpperCase()}
              </Box>
            </Tooltip>
            <Tooltip content={'Clear distributed points'}>
              <Button 
                appearance='subtle'
                iconBefore={ <RefreshIcon size="small" label='refresh'/> }
                onClick={() => clearGoals()}
              />
            </Tooltip>
          </Grid>
          <Inline alignBlock='center' alignInline='end' space='space.100'>
            <Box xcss={xcss({justifySelf: 'end'})}>
              <Tooltip content={"Total Points Distributed"}>
                <Lozenge 
                  appearance={totalPoints < totalDP ? 'inprogress' : totalPoints > totalDP ? 'removed' : 'success'}
                  isBold
                >
                  {totalPoints}
                </Lozenge>
              </Tooltip>
            </Box>
        </Inline>
        </Grid>
    </TargetLabelContainer>
  )
}