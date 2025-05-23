import { useDispatch, useSelector } from 'react-redux';
import { DragDropContext, type DropResult } from '@hello-pangea/dnd';
import { useEffect, useState } from 'react';

import type { RootState } from '../../store';
import Column from '../../components/Column';
import { moveTask, createColumn, createTask, updateTask, deleteTask as removeTask } from './boardSlice';
import { supabase } from '../../supabaseClient';

const Board = () => {
  const dispatch = useDispatch();
  const board = useSelector((state: RootState) => state.board);

  const [columnTitle, setColumnTitle] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  const userId = crypto.randomUUID(); // Ideally use user ID from auth

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

  const onDragEnd = async (result: DropResult) => {
    const { destination, source } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    dispatch(
      moveTask({
        sourceColumnId: source.droppableId,
        destColumnId: destination.droppableId,
        sourceIndex: source.index,
        destIndex: destination.index
      })
    );
  };

  useEffect(() => {
    // Realtime Task Events
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

    // Realtime Column Events
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

    // Realtime Presence Channel
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
      {/* Online users display */}
      <div className="mb-2 text-sm text-gray-600">
        🟢 {onlineUsers.length} user{onlineUsers.length !== 1 ? 's' : ''} online
      </div>

      {/* Column creation UI */}
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

      {/* Columns with DragDrop */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto">
          {board.columnOrder.map((columnId) => {
            const column = board.columns[columnId];
            const tasks = column.taskIds.map((taskId) => board.tasks[taskId]);
            return <Column key={column.id} column={column} tasks={tasks} />;
          })}
        </div>
      </DragDropContext>
    </div>
  );
};

export default Board;
