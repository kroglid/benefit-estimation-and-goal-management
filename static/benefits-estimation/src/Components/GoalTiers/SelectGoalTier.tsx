import Select from "@atlaskit/select"
import { Stack, Grid, xcss } from "@atlaskit/primitives"
import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import EmptyState from "@atlaskit/empty-state"
import Button from "@atlaskit/button"
import { ScopeTypeEnum, useAppContext } from "../../Contexts/AppContext"
import { useAPI } from "../../Contexts/ApiContext"
import { Label } from "@atlaskit/form"
import HipchatChevronDoubleUpIcon from '@atlaskit/icon/glyph/hipchat/chevron-double-up'
import HipchatChevronDoubleDownIcon from '@atlaskit/icon/glyph/hipchat/chevron-double-down'
import Tooltip from "@atlaskit/tooltip"
import { useFlags } from "@atlaskit/flag"
import InfoIcon from '@atlaskit/icon/glyph/info';
import { B300 } from '@atlaskit/theme/colors';
import { token } from '@atlaskit/tokens';
import { GoalTier } from "../../Models/GoalTierModel"

type option = {
  label: string;
  value:  GoalTier;
}

export type SelectGoalCollectionProps = {
  isDisabled?: boolean;
  onChange: (value: option) => void;
}

export const SelectGoalTier = ({isDisabled, onChange}: SelectGoalCollectionProps) => {

  const [options, setOptions] = useState<option[]>()
  const [selectedOption, setSelectedOption] = useState<option>()
  const [isLoading, setLoading] = useState<boolean>(true)

  const navigate = useNavigate()
  const [scope] = useAppContext()
  const api = useAPI()
  const { showFlag } = useFlags();

  const { goal_tier_type, goal_tier_id } = useParams();

  const ChooseGoalTier = (value: GoalTier) => {
    navigate(`../goal-tier/${value.type}/${value.id}`, { replace: true })
  }

  const fetchData = async() => {
    return api.goalTier.getAll(scope.id, scope.type).then((goalTiers) => {
      return goalTiers.map((goalTier: GoalTier, index): option => {
        return {
          label: `Tier ${index + 1} – ${goalTier.name}`,
          value: goalTier
        }
      }).reverse()
    }).catch((error) => {
      console.error(error)
      return []
    });
  }

  useEffect(() => {
    let isMounted = true;
    fetchData().then((options) => {
      if (isMounted) setOptions(options)
    })
    return () => { isMounted = false };
  }, [])

  const selectTierAbove = () => {
    if (options && selectedOption) {
      const index = options.findIndex((option) => option === selectedOption)
      if (index !== 0) {
        const value = options[index - 1].value
        ChooseGoalTier(value)
      }
    }else if (options && options.length > 0) {
      const value = options[0].value
      ChooseGoalTier(value)
    }
  }

  const selectTierBelow = () => {
    if (options && selectedOption) {
      const index = options.findIndex((option) => option === selectedOption)
      if (index !== options.length - 1) {
        const value = options[index + 1].value
        ChooseGoalTier(value)
      }
    } else if (options && options.length > 0) {
      const value = options[options.length - 1].value
      ChooseGoalTier(value)
    }
  }

  useEffect(() => {
    console.log(goal_tier_id)
    console.log(goal_tier_type)
    if (options) {
      const option = options.find((option) => `${option.value.type}` === goal_tier_type && `${option.value.id}` === goal_tier_id)
      if (option) {
        console.debug('found option')
        onChange(option)
        setLoading(false)
        setSelectedOption(option)
      }else if (options.length === 1){
        console.debug('found no option')
        ChooseGoalTier(options[0].value)
        setLoading(false)
      }else{
        console.debug('did not find option')
        setLoading(false)
      }
    }
  }, [options, goal_tier_type, goal_tier_id])

  useEffect(() => {
    if (options && options.length === 1){
      showFlag({
        icon: <InfoIcon
          primaryColor={token('color.icon.information', B300)}
          label="Info"
        />,
        title: `Could not find any Goal Collections`,
        description: scope.type === ScopeTypeEnum.PORTFOLIO ? (
          "To be able to do an estimation, you need to create at least one goal collection."
        ) : (
          "To be able to do an estimation, you need to create at least one goal collection." +
          " This can be done by creating a goal collection for this project, or by creating or using a portfolio with at least one goal collection." +
          " That portfolio then needs to be linked to this project."
        ),
        actions: [
          {
            content: `Create Goal Collection`,
            onClick: () => {
              navigate('../goal-structure/create-goal-collection')
            },
          },
        ],
        isAutoDismiss: false
      });
    }
  }, [options])

  return(
    <>
    <Stack xcss={xcss({marginBottom: "1rem", maxWidth: '500px'})} alignInline="center">
      <Label htmlFor="">Select a Goal Tier</Label>
        <Grid xcss={xcss({width: '100%'})} templateColumns="32px 1fr 32px" alignItems="center" columnGap="space.400">
          <Tooltip content="Select One Tier Below">
            <Button 
              onClick={() => selectTierBelow()}
              iconBefore={<HipchatChevronDoubleDownIcon label="Tier Below"/>}
              isDisabled={isLoading || isDisabled || !options || options.length === 0 || selectedOption === options![options!.length - 1]}
            />
          </Tooltip>
          <Select
            inputID="single-select-example"
            className="single-select"
            classNamePrefix="react-select"
            isDisabled={isLoading || isDisabled}
            isLoading={isLoading}
            value={selectedOption}
            onChange={(value) => {
              const option = value as option
              ChooseGoalTier(option.value)
            }}
            options={options}
            placeholder={isLoading ? "Loading..." : options && options.length > 0 ? "Select Goal Tier" : "No goal tiers found"}
          />
          <Tooltip content="Select One Tier Above">
            <Button 
              onClick={() => selectTierAbove()}
              iconBefore={<HipchatChevronDoubleUpIcon label="Tier Up"/>} 
              isDisabled={isLoading || isDisabled || !options || options.length === 0 || selectedOption === options![0]}
            />
          </Tooltip>
        </Grid>
      </Stack>
      {options && options.length === 0 && (
        <EmptyState
          header="Could not find any goal collections"
          description="You can create goals collections by clicking the button below"
          headingLevel={2}
          primaryAction={<Button appearance='primary' onClick={() => navigate('../goal-structure/create-goal-collection')}>Create Goal Collections</Button>}
        />
      )}
    </>
  )
}