import styles from './index.module.css';
import Message from 'assets/images/message_silver.svg';
import AddIcon from '@material-ui/icons/Add';
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import { RapidReplies } from './RapidReplies';

export const RapidRepliesContainer = ({
  isOpened,
  addingNew,
  rapidReplies,
  onDragEnd,
  onInserting,
  onSend,
  onEdit,
  onHeaderClick,
  officeChatsQuery,
}) => {
  if (isOpened) {
    return (
      <div className={styles.responses}>
        <div className={styles.responses_body}>
          <div className={styles.header}>
            <div onClick={onHeaderClick} className={styles.headerBlock_opened}>
              <Message />
              <span>Rapid Replies</span>
              <ExpandMore />
            </div>
            <div className={styles.addNew} onClick={addingNew}>
              <AddIcon />
              <span>Add New</span>
            </div>
          </div>
          <div className={styles.rapidRepliesContainer}>
            <RapidReplies
              rapidReplies={rapidReplies}
              onDragEnd={onDragEnd}
              onInserting={onInserting}
              onSend={onSend}
              onEdit={onEdit}
            />
          </div>
        </div>
      </div>
    );
  }
  if (officeChatsQuery.isSuccess) {
    return (
      <div className={styles.responsesMinimized}>
        <div onClick={onHeaderClick} className={styles.headerMinimized}>
          <Message />
          <span>Rapid Replies</span>
          <ExpandLess />
        </div>
      </div>
    );
  }
};
