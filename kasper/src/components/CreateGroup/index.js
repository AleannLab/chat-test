import React, { useMemo } from 'react';
import Modal from 'components/Core/Modal';
import Button from '@material-ui/core/Button';
import { useHistory, useParams } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useStores } from 'hooks/useStores';
import TextInputField from 'components/Core/Formik/TextInputField';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { observer } from 'mobx-react';
import styles from './index.module.css';
import { useAuthToken } from 'hooks/useAuthToken';
import UserTable from './UserTable';
import Controls from './Controls';

const validationSchema = Yup.object({
  groupName: Yup.string().trim().required('Group name is required'),
  members: Yup.array().test(
    'atleast-one-selected-member',
    'Atleast one member needs to be selected',
    (members) => members.some((member) => member?.group),
  ),
});

const CreateGroup = () => {
  const queryClient = useQueryClient();
  const history = useHistory();
  const { id } = useParams();
  const { notification, ivrSettings, authentication } = useStores();
  const authToken = useAuthToken();

  const getGroupInfoQuery = useQuery(
    ['getGroupInfo', id],
    () => ivrSettings.getGroupInfo(id),
    {
      enabled: !!id,
    },
  );

  const { isFetching: isFetchingGroupDetails, data: groupInfo } =
    getGroupInfoQuery;

  const { isFetching: isFetchingMembers, data: membersData } = useQuery(
    ['membersAlongWithIncomingCalls'],
    () => ivrSettings.fetchUsers(),
    {
      initialData: [],
    },
  );

  const addGroupQuery = useMutation(
    'addGroup',
    (data) => ivrSettings.addGroup(data),
    {
      onError: (err) => {
        notification.showError(err.message);
      },
      onSuccess: () => {
        notification.showSuccess('Group added successfully!');
        history.goBack();
        queryClient.invalidateQueries('fetchGroups');
      },
    },
  );

  const handleAddGroup = async (data = null) => {
    if (data) {
      await addGroupQuery.mutateAsync(data);
      return;
    }
  };

  const updateGroupQuery = useMutation(
    'updateGroup',
    ({ id, data }) => {
      ivrSettings.updateGroup(id, data);
    },
    {
      onError: (err) => {
        notification.showError(err.message);
      },
      onSuccess: () => {
        history.goBack();
        queryClient.invalidateQueries('fetchGroups');
        notification.showSuccess('Group updated successfully!');
        setTimeout(() => {
          notification.hideNotification();
        }, 5000);
      },
    },
  );

  const handleUpdateGroup = async (id, data = null) => {
    if (id && data) {
      await updateGroupQuery.mutateAsync({ id, data });
      return;
    }
  };

  const { isLoading: isAdding } = addGroupQuery;
  const { isLoading: isUpdating } = updateGroupQuery;

  const handleSubmitForm = async (values, props) => {
    const createdBy = authentication.user.user_id;
    const data = {
      name: values.groupName,
      groupMemberJson: values.members
        .filter((member) => member.group)
        .map(({ userUuid, user_exten, fullname }) => {
          return { user_id: userUuid, user_exten, fullname };
        }),
    };

    if (id) {
      handleUpdateGroup(id, data);
    } else {
      handleAddGroup({ ...data, createdBy });
    }
  };

  const initialValues = useMemo(() => {
    const groupMemberIds = groupInfo?.group_member_json.map(
      ({ user_id }) => user_id,
    );

    const members = membersData.map((member) => ({
      ...member,
      selected: false,
      group: Boolean(groupMemberIds?.includes(member.userUuid)),
    }));

    return {
      groupName: groupInfo?.name,
      members,
    };
  }, [groupInfo?.name, groupInfo?.group_member_json, membersData]);

  const handleClose = () => {
    history.goBack();
  };

  return (
    <Modal
      size="md"
      header={id ? 'Edit Group' : 'Create Group'}
      body={
        <div className={styles.container}>
          <div className="d-flex flex-column justify-content-center">
            <Formik
              initialValues={initialValues}
              onSubmit={handleSubmitForm}
              validationSchema={validationSchema}
              validateOnBlur
              enableReinitialize
            >
              {({
                isSubmitting,
                errors,
                touched,
                values: { members },
                setFieldValue,
                isValid,
              }) => {
                const toggleMemberSelect = (userUuid) => {
                  const updatedMembers = members.map((member) => {
                    if (member.userUuid === userUuid) {
                      return { ...member, selected: !member.selected };
                    }
                    return member;
                  });
                  setFieldValue('members', updatedMembers);
                };

                const selectedMemberIds = members
                  ?.filter((member) => member.selected)
                  .map(({ userUuid }) => userUuid);

                const availableMembers = members.filter(({ group }) => !group);
                const groupMembers = members?.filter(({ group }) => group);

                const setSelectedMembers = (userUuids) => {
                  const updatedMembers = members.map((member) => ({
                    ...member,
                    selected: userUuids.includes(member.userUuid),
                  }));
                  setFieldValue('members', updatedMembers);
                };

                const moveSelectedUsersToGroup = () => {
                  const updatedMembers = members.map((member) => {
                    if (member.group) {
                      return member;
                    }

                    return {
                      ...member,
                      selected: false,
                      group: member.selected,
                    };
                  });
                  setFieldValue('members', updatedMembers);
                };

                const moveAllUsersToGroup = () => {
                  const updatedMembers = members.map((member) => ({
                    ...member,
                    selected: false,
                    group: true,
                  }));
                  setFieldValue('members', updatedMembers);
                };

                const removeSelectedUsersFromGroup = () => {
                  const updatedMembers = members.map((member) => {
                    if (!member.group) {
                      return member;
                    }

                    return {
                      ...member,
                      selected: false,
                      group: !(member.selected && member.group),
                    };
                  });

                  setFieldValue('members', updatedMembers);
                };

                const removeAllUsersFromGroup = () => {
                  const updatedMembers = members.map((member) => ({
                    ...member,
                    selected: false,
                    group: false,
                  }));
                  setFieldValue('members', updatedMembers);
                };

                return (
                  <Form>
                    <TextInputField
                      fieldLabel="Group Name"
                      fieldName="groupName"
                      disabled={
                        isAdding ||
                        isUpdating ||
                        isFetchingGroupDetails ||
                        isFetchingMembers
                      }
                      type="text"
                      placeholder="Enter group name"
                    />

                    <div className="d-flex w-100">
                      <UserTable
                        styles={styles}
                        heading="Available VoIP Users:"
                        rows={availableMembers}
                        isEmpty={members.length < 1 && !isFetchingGroupDetails}
                        selected={selectedMemberIds}
                        onRowSelect={setSelectedMembers}
                        onRowClick={toggleMemberSelect}
                        loading={isFetchingMembers}
                        disabled={isAdding || isUpdating}
                        emptyText="No VoIP users"
                      />
                      <Controls
                        onAdd={moveSelectedUsersToGroup}
                        onAddAll={moveAllUsersToGroup}
                        onRemove={removeSelectedUsersFromGroup}
                        onRemoveAll={removeAllUsersFromGroup}
                        disableAddControls={members.length < 1}
                        disableRemoveControls={groupMembers.length < 1}
                      />
                      <UserTable
                        styles={styles}
                        heading="Group members:"
                        rows={groupMembers}
                        isEmpty={
                          groupMembers.length < 1 && !isFetchingGroupDetails
                        }
                        selected={selectedMemberIds}
                        onRowSelect={setSelectedMembers}
                        onRowClick={toggleMemberSelect}
                        loading={isFetchingGroupDetails}
                        disabled={isAdding || isUpdating}
                        emptyText="No Group members"
                      />
                    </div>
                    <p className="text-danger text-right">
                      {touched?.members && errors?.members}
                    </p>
                    <div className="mt-4 d-flex justify-content-between">
                      <Button
                        className="me-auto primary-btn"
                        variant="outlined"
                        disabled={
                          isAdding || isUpdating || isFetchingGroupDetails
                        }
                        color="primary"
                        onClick={handleClose}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="secondary-btn"
                        variant="contained"
                        disabled={!isValid || isAdding || isUpdating}
                        color="secondary"
                        style={{ width: 'auto' }}
                      >
                        {isAdding
                          ? 'Creating Group...'
                          : id
                          ? 'Update Group'
                          : 'Create Group'}
                      </Button>
                    </div>
                  </Form>
                );
              }}
            </Formik>
          </div>
        </div>
      }
      onClose={handleClose}
      footer={null}
    />
  );
};

export default observer(CreateGroup);
