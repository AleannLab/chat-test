import Modal from 'components/Core/Modal';
import { AddResponse } from './AddResponse';

export const RapidRepliesModal = ({
  deleteRapidReplies,
  editRapidReplies,
  close,
  item = '',
}) => {
  return (
    <Modal
      onClose={close}
      size={'sm'}
      id={'rapid-replies-modal'}
      body={
        <AddResponse
          item={item}
          deleteRapidReplies={deleteRapidReplies}
          actionRapidReplies={editRapidReplies}
          onClose={close}
        />
      }
      {...{
        header: 'Add Rapid Replies',
        defaultState: true,
        enableMargin: true,
        fullWidth: true,
        allowClosing: true,
        customPosition: false,
      }}
    />
  );
};
