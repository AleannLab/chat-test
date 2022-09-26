import styles from './index.module.css';
import { ReactComponent as Send } from '../../../assets/images/send.svg';
import { EditTwoTone as Edit } from '@material-ui/icons';
import { ReactComponent as EmptyMessages } from '../../../assets/images/empty_messages.svg';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { HighlightingVariables } from './HighlightingVariables';

export const RapidReplies = ({
  rapidReplies,
  onDragEnd,
  onInserting,
  onSend,
  onEdit,
}) => {
  const getItemStyle = (isDragging, draggableStyle) => {
    return {
      ...draggableStyle,
    };
  };

  if (rapidReplies.length === 0) {
    return (
      <div className={styles.rapidRepliesEmpty}>
        <EmptyMessages />
        <span>No rapid Replies yet</span>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="helpMessageBar">
        {(provided, snapshot) => {
          return (
            <div
              className={styles.helpMessageBar}
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {rapidReplies.map((item, i) => (
                <Draggable
                  key={item.order}
                  draggableId={`${item.order}`}
                  index={i}
                >
                  {(innerProvided, innerSnapshot) => (
                    <div
                      {...innerProvided.dragHandleProps}
                      id={item.id}
                      key={i}
                      className={styles.rapidReplay}
                      ref={innerProvided.innerRef}
                      {...innerProvided.draggableProps}
                      style={getItemStyle(
                        innerSnapshot.isDragging,
                        innerProvided.draggableProps.style,
                      )}
                    >
                      {
                        //TODO maybe will be better to use such a button for drag and drop
                        /* <div {...innerProvided.dragHandleProps}>
                        <DragIndicatorIcon
                          style={{
                            color: '#9A9A9A',
                            'margin-top': '15px',
                          }}
                        />
                      </div> */
                      }
                      <div
                        onClick={() => {
                          onInserting(item.text);
                        }}
                        className={styles.rapidReplayText}
                      >
                        <HighlightingVariables text={item.text} />
                      </div>
                      <div className={styles.buttons}>
                        <button
                          onClick={() => {
                            onSend(item.text);
                          }}
                          type="button"
                          className={styles.button}
                        >
                          <Send />
                        </button>
                        <button
                          onClick={() => {
                            onEdit(item);
                          }}
                          type="button"
                          className={styles.button}
                          disabled={!item.modify_permission}
                          style={{
                            opacity: item.modify_permission ? '1' : '0.5',
                          }}
                        >
                          <Edit className={styles.edit} />
                        </button>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          );
        }}
      </Droppable>
    </DragDropContext>
  );
};
