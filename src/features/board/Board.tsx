import { useDispatch, useSelector } from 'react-redux';
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult
} from '@hello-pangea/dnd';
import { useEffect, useState } from 'react';

import type { RootState } from '../../store';
import Column from '../../components/Column';
import {
  moveTask,
  createColumn,
  createTask,
  updateTask,
  deleteTask as removeTask,
  reorderColumns
} from './boardSlice';
import { supabase } from '../../supabaseClient';
import UndoRedoControls from './UndoRedoControls';

const Board = () => {
  const dispatch = useDispatch();
  const board = useSelector((state: RootState) => state.board.present); // 👈 Fix: access present state

  const [columnTitle, setColumnTitle] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  const userId = crypto.randomUUID(); // Replace with actual user ID in real app

  const handleCreateColumn = async () => {
    if (!columnTitle.trim()) return;

    const { error } = await supabase.from('columns').insert([
      {
        title: columnTitle.trim(),
        position: Object.keys(board.columns).length
      }
    ]);

    if (error) {
      console.error('Error creating column:', error);
    } else {
      setColumnTitle('');
    }
  };

  const onDragEnd = (result: DropResult) => {
    const { destination, source, type } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (type === 'COLUMN') {
      dispatch(
        reorderColumns({
          sourceIndex: source.index,
          destinationIndex: destination.index
        })
      );
    } else {
      dispatch(
        moveTask({
          sourceColumnId: source.droppableId,
          destColumnId: destination.droppableId,
          sourceIndex: source.index,
          destIndex: destination.index
        })
      );
    }
  };

  useEffect(() => {
    const tasksChannel = supabase
      .channel('public:tasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
        const { eventType, new: newTask, old: oldTask } = payload;

        if (eventType === 'INSERT') {
          dispatch(
            createTask({
              task: {
                id: newTask.id,
                title: newTask.title,
                createdAt: newTask.created_at,
                updatedAt: newTask.updated_at
              },
              columnId: newTask.column_id
            })
          );
        }

        if (eventType === 'UPDATE') {
          dispatch(
            updateTask({
              taskId: newTask.id,
              title: newTask.title
            })
          );
        }

        if (eventType === 'DELETE') {
          dispatch(
            removeTask({
              columnId: oldTask.column_id,
              taskId: oldTask.id
            })
          );
        }
      })
      .subscribe();

    const columnsChannel = supabase
      .channel('public:columns')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'columns' }, (payload) => {
        const { eventType, new: newCol } = payload;

        if (eventType === 'INSERT') {
          dispatch(
            createColumn({
              column: {
                id: newCol.id,
                title: newCol.title,
                taskIds: []
              }
            })
          );
        }
      })
      .subscribe();

    const presenceChannel = supabase.channel('presence:board', {
      config: {
        presence: {
          key: userId
        }
      }
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const userIds = Object.keys(state);
        setOnlineUsers(userIds);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({ username: userId });
        }
      });

    return () => {
      supabase.removeChannel(tasksChannel);
      supabase.removeChannel(columnsChannel);
      supabase.removeChannel(presenceChannel);
    };
  }, []);

  return (
    <div className="p-4">
      <div className="mb-2 text-sm text-gray-600">
        🟢 {onlineUsers.length} user{onlineUsers.length !== 1 ? 's' : ''} online
      </div>

      <div className="mb-4 flex gap-2">
        <input
          type="text"
          value={columnTitle}
          onChange={(e) => setColumnTitle(e.target.value)}
          placeholder="New column title"
          className="border p-2 rounded w-64"
        />
        <button
          onClick={handleCreateColumn}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Column
        </button>
      </div>

      <UndoRedoControls /> {/* 👈 Added undo/redo UI */}

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="board" direction="horizontal" type="COLUMN">
          {(provided) => (
            <div
              className="flex gap-4 overflow-x-auto"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {board.columnOrder.map((columnId, index) => {
                const column = board.columns[columnId];
                const tasks = column.taskIds.map((taskId) => board.tasks[taskId]);
                return (
                  <Draggable draggableId={columnId} index={index} key={columnId}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <Column column={column} tasks={tasks} />
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default Board;
