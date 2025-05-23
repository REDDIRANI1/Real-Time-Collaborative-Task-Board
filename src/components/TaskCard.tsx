import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Draggable } from '@hello-pangea/dnd';
import { deleteTask, updateTask } from '../features/board/boardSlice';
import './TaskCard.css';

interface Props {
  task: {
    id: string;
    title: string;
    description?: string;
    comments?: string[];
    dueDate?: string;
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
  const [newComment, setNewComment] = useState('');
  const [dueDate, setDueDate] = useState(task.dueDate || '');

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

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    const updatedComments = [...(task.comments || []), newComment.trim()];
    dispatch(updateTask({ taskId: task.id, comments: updatedComments }));
    setNewComment('');
  };

  const handleUpdateDueDate = () => {
    if (!dueDate) return;
    dispatch(updateTask({ taskId: task.id, dueDate }));
  };

  // Reminder alert logic
  useEffect(() => {
    if (!task.dueDate) return;

    const due = new Date(task.dueDate).getTime();
    const now = new Date().getTime();
    const timeUntilDue = due - now;

    if (timeUntilDue > 0 && timeUntilDue < 60 * 60 * 1000) {
      const timer = setTimeout(() => {
        alert(`⏰ Reminder: "${task.title}" is due soon!`);
      }, timeUntilDue);
      return () => clearTimeout(timer);
    }
  }, [task.dueDate, task.title]);

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
                  <div className="mb-2">
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
                       🧾 ➕
                      </button>
                    </div>
                  </div>

                  <div className="comments-section mt-4">
                    <strong>Comments:</strong>
                    <ul className="ml-4 list-disc">
                      {(task.comments || []).map((comment, idx) => (
                        <li key={idx}>{comment}</li>
                      ))}
                    </ul>

                    <div className="flex gap-2 mt-2">
                      <input
                        className="task-input"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment"
                      />
                      <button
                        className="bg-green-600 text-white px-2 rounded"
                        onClick={handleAddComment}
                      >
                        💬 ➕
                      </button>
                    </div>
                  </div>

                  <div className="due-date-section mt-4">
                    <strong>Due Date:</strong>
                    <input
                      type="datetime-local"
                      className="task-input"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                    />
                    <button
                      className="bg-indigo-500 text-white px-2 ml-2 rounded"
                      onClick={handleUpdateDueDate}
                    >
                      Save
                    </button>
                    {task.dueDate && (
                      <p className="text-sm mt-1 text-gray-600">
                        ⏰ {new Date(task.dueDate).toLocaleString()}
                      </p>
                    )}
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
