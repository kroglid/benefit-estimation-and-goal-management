import { useLocation, useNavigate, useParams } from "react-router-dom"
import { useAPI } from "../../Contexts/ApiContext"
import { useEffect } from "react"
import { useFlags } from "@atlaskit/flag"
import { useAlert } from "../../Contexts/AlertContext"
import SuccessIcon from '@atlaskit/icon/glyph/check-circle';
import ErrorIcon from '@atlaskit/icon/glyph/error';
import { R400 } from '@atlaskit/theme/colors';
import { G300 } from '@atlaskit/theme/colors';
import { token } from '@atlaskit/tokens';
import { useAppContext } from "../../Contexts/AppContext"

export const DeleteGoalCollection = () => {
  const api = useAPI()
  const {goal_collection_id} = useParams()
  const location = useLocation();
  const [scope] = useAppContext();
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const { showFlag } = useFlags();

  const name = location.state?.goalCollectionName

  useEffect(() => {
    if (goal_collection_id && name) {
      showAlert({
        title: `Delete ${name}`,
        body: `Are you sure you want to delete ${name}?`,
        confirmText: "Delete",
        onCancel: () => navigate('..'),
        onConfirm: () => deleteGC()
      })
    }else{
      navigate('..')
    }
  }, [goal_collection_id, name]);

  const deleteGC = async () => {
    if (goal_collection_id && name) {
      await api.goalCollection.delete(scope.id, goal_collection_id).then(() => {
        navigate('..', { state: { refresh: true } })
        showFlag({
          title: "Deleted",
          description: `Successfully deleted ${name}`,
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
          description: `Could not delete ${name}`,
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