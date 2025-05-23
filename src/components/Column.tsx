import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard'; // or whatever your task component is called
import { v4 as uuidv4 } from 'uuid';
import { createTask, deleteColumn, updateColumn } from '../features/board/boardSlice';
import styles from './Column.module.css';


const Column = ({ column, tasks }: any) => {
  const dispatch = useDispatch();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(column.title);

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;

    dispatch(
      createTask({
        columnId: column.id,
        task: {
          id: uuidv4(),
          title: newTaskTitle.trim(),
          description: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      })
    );

    setNewTaskTitle('');
  };

  const handleDeleteColumn = () => {
    if (confirm('Are you sure you want to delete this column?')) {
      dispatch(deleteColumn({ columnId: column.id }));
    }
  };

  const handleTitleUpdate = () => {
    if (!editedTitle.trim()) return;
    dispatch(updateColumn({ columnId: column.id, title: editedTitle }));
    setIsEditingTitle(false);
  };

  return (
    <div className={styles.column}>
  <div className={styles.header}>
    {isEditingTitle ? (
      <>
        <input
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
          className={styles.input}
        />
        <button onClick={handleTitleUpdate} className="text-green-600">✔</button>
        <button onClick={() => setIsEditingTitle(false)} className="text-red-600">✖</button>
      </>
    ) : (
      <>
        <h2 className={styles.title}>{column.title}</h2>
        <div className={styles.buttonGroup}>
          <button onClick={() => setIsEditingTitle(true)} title="Edit Title">✏️</button>
          <button onClick={handleDeleteColumn} title="Delete Column">🗑️</button>
        </div>
      </>
    )}
  </div>






      <Droppable droppableId={column.id}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="min-h-[40px] space-y-2"
          >
            {tasks.map((task: any, index: number) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <TaskCard
  key={task.id}
  task={task}
  index={index}
  columnId={column.id}
/>

                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      <div className="mt-4 flex gap-2">
        <input
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="New task"
          className="border p-1 rounded flex-1"
        />
        <button onClick={handleAddTask} className="bg-blue-500 text-white px-2 rounded">
          +
        </button>
      </div>
    </div>
  );
};

export default Column;
