import  { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Draggable } from '@hello-pangea/dnd';
import { deleteTask, updateTask } from '../features/board/boardSlice';
import './TaskCard.css'; // ✅ Import the external stylesheet

interface Props {
  task: {
    id: string;
    title: string;
    description?: string;
  };
  index: number;
  columnId: string;
}

const TaskCard = ({ task, index, columnId }: Props) => {
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [showDetails, setShowDetails] = useState(false);
  const [newDescription, setNewDescription] = useState(task.description || '');

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this task?')) {
      dispatch(deleteTask({ columnId, taskId: task.id }));
    }
  };

  const handleUpdate = () => {
    if (!editedTitle.trim()) return;
    dispatch(updateTask({ taskId: task.id, title: editedTitle.trim() }));
    setIsEditing(false);
  };

  const handleUpdateDescription = () => {
    if (!newDescription.trim()) return;
    dispatch(updateTask({ taskId: task.id, description: newDescription.trim() }));
  };

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided) => (
        <div
          className="task-card"
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          {isEditing ? (
            <div className="flex flex-col gap-2">
              <input
                className="task-input"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <button onClick={handleUpdate} className="task-save-btn">Save</button>
                <button onClick={() => setIsEditing(false)} className="task-cancel-btn">Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <div className="task-header">
                <span className="task-title">{task.title}</span>
                <div className="task-buttons">
                  <button onClick={() => setIsEditing(true)} className="task-edit-btn" title="Edit">✏️</button>
                  <button onClick={handleDelete} className="task-delete-btn" title="Delete">🗑️</button>
                </div>
              </div>

              <button
                onClick={() => setShowDetails((prev) => !prev)}
                className="task-toggle-btn"
              >
                {showDetails ? 'Hide Details' : 'Show Details'}
              </button>

              {showDetails && (
                <div className="task-description">
                  <strong>Description:</strong>
                  <p className="ml-2">{task.description || 'No description'}</p>

                  <div className="flex gap-2 mt-2">
                    <input
                      className="task-input"
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="Update description"
                    />
                    <button
                      className="bg-blue-500 text-white px-2 rounded"
                      onClick={handleUpdateDescription}
                    >
                      ➕
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </Draggable>
  );
};

export default TaskCard;
