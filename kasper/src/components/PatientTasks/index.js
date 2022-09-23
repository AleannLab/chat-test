import React from 'react';
import { useStores } from 'hooks/useStores';
import { useQuery } from 'react-query';
// import Button from "@material-ui/core/Button";
// import { useHistory } from "react-router-dom";
// import AddTask from "containers/Dashboard/PatientFeed/AddTask";
// import { Route } from "react-router-dom";
import TaskItem from './TaskItem';
import Skeleton from '@material-ui/lab/Skeleton';

const PatientTasks = ({ patientId, modalBasePath }) => {
  // const history = useHistory();
  const { scheduling: schedulingStore } = useStores();

  // react-query to fetch patient tasks by patient id
  const patientTasksQuery = useQuery(
    ['patientTasks', patientId],
    () => schedulingStore.getTasksByPatientId(patientId),
    {
      enabled: !!patientId,
      onSuccess: (response) => {
        return response;
      },
    },
  );

  return (
    <div className="flex-grow-1">
      {/* <Route
                exact
                path={`${modalBasePath}/add-task`}
                component={AddTask}
            />
            <Route
                exact
                path={`${modalBasePath}/edit-task`}
                component={AddTask}
            />
            <div style={{ marginTop: "5px", marginLeft: "25px" }}>
                <Button
                    onClick={() => {
                        history.push({
                            pathname: `${modalBasePath}/add-task`,
                            state: {
                                patient: patientId
                            },
                        });
                    }}
                    style={{
                        color: "#F4266E",
                        fontSize: "14px",
                        fontWeight: "500",
                        textTransform: "none",
                        fontFamily: "Montserrat"
                    }}
                >
                    + Add Task
                    </Button>
            </div> */}

      {patientTasksQuery.isSuccess ? (
        patientTasksQuery.data.length ? (
          patientTasksQuery.data.map((task) => (
            <TaskItem
              key={task.id}
              taskData={task}
              modalBasePath={modalBasePath}
            />
          ))
        ) : (
          <div className="text-center">No tasks here.</div>
        )
      ) : patientTasksQuery.isFetching ? (
        <Loader />
      ) : null}
    </div>
  );
};

export default PatientTasks;

const Loader = () =>
  [...Array(4)].map((d, i) => (
    <div key={i} className="d-flex flex-row mt-2">
      <Skeleton variant="text" height={20} width={20} />
      <Skeleton className="ms-3" variant="text" height={20} width={200} />
    </div>
  ));
