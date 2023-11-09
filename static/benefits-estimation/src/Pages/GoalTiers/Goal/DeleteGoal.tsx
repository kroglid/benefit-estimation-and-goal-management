import { useLocation, useNavigate, useParams } from "react-router-dom"
import { useAPI } from "../../../Contexts/ApiContext"
import { useEffect } from "react"
import { useFlags } from "@atlaskit/flag"
import { useAlert } from "../../../Contexts/AlertContext"
import SuccessIcon from '@atlaskit/icon/glyph/check-circle';
import ErrorIcon from '@atlaskit/icon/glyph/error';
import { R400 } from '@atlaskit/theme/colors';
import { G300 } from '@atlaskit/theme/colors';
import { token } from '@atlaskit/tokens';
import { useAppContext } from "../../../Contexts/AppContext"

export const DeleteGoal = () => {
  const api = useAPI()
  const {goal_tier_id, goal_id} = useParams()
  const [scope] = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const { showFlag } = useFlags();

  const key = location.state?.goal_key

  useEffect(() => {
    console.log(goal_tier_id, goal_id, key)
    if (goal_tier_id && goal_id && key) {
      showAlert({
        title: `Delete ${key}`,
        body: `Are you sure you want to delete ${key}?`,
        confirmText: "Delete",
        onCancel: () => navigate('..'),
        onConfirm: () => deleteGC()
      })
    }else{
      navigate('..')
    }
  }, [goal_tier_id, key]);

  const deleteGC = async () => {
    if (goal_tier_id && goal_id && key) {
      await api.goal.delete(scope.id, goal_tier_id, goal_id).then(() => {
        navigate('..', { state: { refresh: true } })
        showFlag({
          title: "Deleted",
          description: `Successfully deleted ${key}`,
          isAutoDismiss: true,
          icon: (
            <SuccessIcon
              primaryColor={token('color.icon.success', G300)}
              label="Success"
            />
          )
        })
      }).catch(() => {
        navigate('..', { state: { refresh: true } })
        showFlag({
          title: "Error",
          description: `Could not delete ${key}`,
          isAutoDismiss: true,
          icon: (
            <ErrorIcon
              primaryColor={token('color.icon.danger', R400)}
              label="Success"
            />
          )
        })
      })
    } else {
      navigate('..')
    }
  }
  return(
    <div/>
  )
}