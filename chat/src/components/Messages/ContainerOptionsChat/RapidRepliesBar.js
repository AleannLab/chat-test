import { useContext, useEffect, useState } from 'react';
import { useStores } from 'hooks/useStores';
import { useMutation, useQuery } from 'react-query';
import { RapidRepliesModal } from './RapidRepliesModal';
import { RapidRepliesContainer } from './RapidRepliesContainer';
import { replaceVariables } from '../../../stores/utils/replaceVariables';
import { VariableContext } from '../variableContext';

export const RapidRepliesBar = ({
  isOpened,
  setIsOpened,
  handleSubmit,
  setFieldValue,
  focusedChat,
  unfocusedChat,
}) => {
  const [isOpenedAdd, setIsOpenedAdd] = useState(false);
  const [isOpenedEdit, setIsOpenedEdit] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [currentItemNew, setCurrentItemNew] = useState(null);
  const { officeChats } = useStores();
  const [rapidReplies, setRapidReplies] = useState([]);
  const variables = useContext(VariableContext);

  const officeChatsQuery = useQuery('officeChats', () =>
    officeChats.getRapidReplies(),
  );

  const RapidReplyAction = {
    Edit: 'Edit',
    Add: 'Add',
    Delete: 'Delete',
    Reorder: 'Reorder',
  };

  const rapidReplayMutate = useMutation('officeChats', (data) => {
    switch (data.type) {
      case RapidReplyAction.Add: {
        return officeChats.createRapidReplay(data);
      }
      case RapidReplyAction.Edit: {
        return officeChats.editRapidReplay(data);
      }
      case RapidReplyAction.Delete: {
        return officeChats.deleteRapidReplay(`${data.id}`);
      }
      case RapidReplyAction.Reorder: {
        officeChats.reorderRapidReplay(data);
        break;
      }
      default: {
        throw Error('Empty type received.');
      }
    }
  });

  useEffect(() => {
    if (officeChatsQuery.isSuccess === true) {
      setRapidReplies(officeChatsQuery.data.sort((a, b) => a.order - b.order));
    }
  }, [officeChatsQuery.isSuccess]);

  useEffect(() => {
    if (rapidReplayMutate.data && currentItemNew) {
      if (rapidReplayMutate.data.data) {
        setRapidReplies(
          rapidReplies.map((x) =>
            x.id === currentItemNew.id
              ? { ...currentItemNew, id: rapidReplayMutate.data.data.id }
              : x,
          ),
        );
        setCurrentItemNew(null);
      }
    }
  }, [rapidReplayMutate.isSuccess]);

  const addingNew = () => {
    setIsOpenedAdd(true);
  };

  const onInserting = (text) => {
    setFieldValue('chat', replaceVariables(text, variables));
    setIsOpened(!isOpened);
    focusedChat();
  };

  const onSend = (text) => {
    insertToChat(replaceVariables(text, variables));
    setIsOpened(!isOpened);
    handleSubmit();
  };

  const onEdit = (item) => {
    setCurrentItem(item);
    setIsOpenedEdit(true);
  };

  const onHeaderClick = () => {
    setIsOpened(!isOpened);
    unfocusedChat();
  };

  const close = () => {
    setIsOpenedAdd(false);
    setIsOpenedEdit(false);
  };
  const insertToChat = (item) => {
    setFieldValue('chat', item);
  };

  const getMaxOrder = () => {
    if (rapidReplies.length === 0) {
      return 0;
    }
    return Math.max(...rapidReplies.map((i) => i.order)) + 1;
  };

  const addRapidReplies = (item) => {
    const newItem = {
      text: item,
      id: Date.now(),
      order: getMaxOrder(),
      modify_permission: true,
    };
    setCurrentItemNew(newItem);
    setRapidReplies([...rapidReplies, newItem]);
    setCurrentItem(null);
    rapidReplayMutate.mutate({ text: item, type: RapidReplyAction.Add });
  };

  const editRapidReplies = (editedItem) => {
    setRapidReplies([
      ...rapidReplies.map((item) =>
        item.id === currentItem.id
          ? { ...currentItem, text: editedItem }
          : item,
      ),
    ]);

    rapidReplayMutate.mutate({
      text: editedItem,
      id: currentItem.id,
      type: RapidReplyAction.Edit,
    });
    setCurrentItem(null);
  };

  const reorder = (source, destination) => {
    let aboveItems = rapidReplies.filter((item) => item.order < source.index);
    let item = rapidReplies.filter((item) => item.order === source.index);
    let behindItems = rapidReplies.filter((item) => item.order > source.index);

    if (source.index > destination.index) {
      setRapidReplies(
        destination.index === -1
          ? [
              ...aboveItems.map((x) => {
                if (x.order >= destination.index) {
                  return { ...x, order: x.order + 1 };
                } else {
                  return x;
                }
              }),
              ...behindItems,
            ]
              .map((x) => {
                return { ...x, order: x.order - 1 };
              })
              .sort((a, b) => a.order - b.order)
          : [
              ...aboveItems.map((x) => {
                if (x.order >= destination.index) {
                  return { ...x, order: x.order + 1 };
                } else {
                  return x;
                }
              }),
              { ...item[0], order: destination.index },
              ...behindItems,
            ].sort((a, b) => a.order - b.order),
      );
    }

    if (source.index < destination.index) {
      setRapidReplies(
        [
          ...behindItems.map((x) => {
            if (x.order <= destination.index) {
              return { ...x, order: x.order - 1 };
            } else {
              return x;
            }
          }),
          { ...item[0], order: destination.index },
          ...aboveItems,
        ].sort((a, b) => a.order - b.order),
      );
    }
  };

  const deleteRapidReplies = () => {
    const source = { index: rapidReplies.indexOf(currentItem) };
    const destination = { index: -1 }; //index: -1 needed for deleting
    reorder(source, destination);
    rapidReplayMutate.mutate({
      id: currentItem.id,
      type: RapidReplyAction.Delete,
    });
    setCurrentItem(null);
  };

  const onDragEnd = (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) {
      return;
    }

    rapidReplayMutate.mutate({
      id: rapidReplies[source.index].id,
      order: destination.index,
      type: RapidReplyAction.Reorder,
    });
    reorder(source, destination);
  };

  return (
    <>
      {isOpenedAdd && (
        <RapidRepliesModal
          deleteRapidReplies={deleteRapidReplies}
          editRapidReplies={addRapidReplies}
          close={close}
        />
      )}
      {isOpenedEdit && (
        <RapidRepliesModal
          item={currentItem.text}
          deleteRapidReplies={deleteRapidReplies}
          editRapidReplies={editRapidReplies}
          close={close}
        />
      )}
      <RapidRepliesContainer
        isOpened={isOpened}
        addingNew={addingNew}
        rapidReplies={rapidReplies}
        onDragEnd={onDragEnd}
        onInserting={onInserting}
        onSend={onSend}
        onEdit={onEdit}
        onHeaderClick={onHeaderClick}
        officeChatsQuery={officeChatsQuery}
      />
    </>
  );
};
