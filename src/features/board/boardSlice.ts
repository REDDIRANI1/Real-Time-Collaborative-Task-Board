import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { BoardState, Column, Task } from '../../types/board';
import undoable from 'redux-undo';

const now = new Date().toISOString();

const initialBoardState: BoardState = {
  columns: {
    'column-1': {
      id: 'column-1',
      title: 'To Do',
      taskIds: ['task-1', 'task-2']
    },
    'column-2': {
      id: 'column-2',
      title: 'In Progress',
      taskIds: ['task-3']
    }
  },
  tasks: {
    'task-1': { id: 'task-1', title: 'Task One', createdAt: now, updatedAt: now },
    'task-2': { id: 'task-2', title: 'Task Two', createdAt: now, updatedAt: now },
    'task-3': { id: 'task-3', title: 'Task Three', createdAt: now, updatedAt: now }
  },
  columnOrder: ['column-1', 'column-2']
};

const boardSlice = createSlice({
  name: 'board',
  initialState: initialBoardState,
  reducers: {
    createTask: (
      state,
      action: PayloadAction<{ columnId: string; task: Task }>
    ) => {
      const { columnId, task } = action.payload;
      const timestamp = new Date().toISOString();
      state.tasks[task.id] = {
        ...task,
        createdAt: task.createdAt || timestamp,
        updatedAt: task.updatedAt || timestamp,
      };
      state.columns[columnId].taskIds.push(task.id);
    },

    updateTask: (
      state,
      action: PayloadAction<{
        taskId: string;
        title?: string;
        description?: string;
        comments?: string[];
        dueDate?: string;
      }>
    ) => {
      const { taskId, title, description, comments, dueDate } = action.payload;
      const task = state.tasks[taskId];
      if (task) {
        if (title !== undefined) task.title = title;
        if (description !== undefined) task.description = description;
        if (comments !== undefined) task.comments = comments;
        if (dueDate !== undefined) task.dueDate = dueDate;
        task.updatedAt = new Date().toISOString();
      }
    },

    deleteTask: (
      state,
      action: PayloadAction<{ columnId: string; taskId: string }>
    ) => {
      const { columnId, taskId } = action.payload;
      delete state.tasks[taskId];
      state.columns[columnId].taskIds = state.columns[columnId].taskIds.filter(
        id => id !== taskId
      );
    },

    createColumn: (
      state,
      action: PayloadAction<{ column: Column }>
    ) => {
      const { column } = action.payload;
      state.columns[column.id] = column;
      state.columnOrder.push(column.id);
    },

    updateColumn: (
      state,
      action: PayloadAction<{ columnId: string; title: string }>
    ) => {
      const { columnId, title } = action.payload;
      state.columns[columnId].title = title;
    },

    deleteColumn: (
      state,
      action: PayloadAction<{ columnId: string }>
    ) => {
      const { columnId } = action.payload;
      state.columnOrder = state.columnOrder.filter(id => id !== columnId);
      state.columns[columnId].taskIds.forEach(taskId => {
        delete state.tasks[taskId];
      });
      delete state.columns[columnId];
    },

    moveTask: (
      state,
      action: PayloadAction<{
        sourceColumnId: string;
        destColumnId: string;
        sourceIndex: number;
        destIndex: number;
      }>
    ) => {
      const { sourceColumnId, destColumnId, sourceIndex, destIndex } = action.payload;
      const sourceTasks = state.columns[sourceColumnId].taskIds;
      const [movedTaskId] = sourceTasks.splice(sourceIndex, 1);
      if (sourceColumnId === destColumnId) {
        sourceTasks.splice(destIndex, 0, movedTaskId);
      } else {
        state.columns[destColumnId].taskIds.splice(destIndex, 0, movedTaskId);
      }
    },

    reorderColumns: (
      state,
      action: PayloadAction<{ sourceIndex: number; destinationIndex: number }>
    ) => {
      const { sourceIndex, destinationIndex } = action.payload;
      const newOrder = [...state.columnOrder];
      const [moved] = newOrder.splice(sourceIndex, 1);
      newOrder.splice(destinationIndex, 0, moved);
      state.columnOrder = newOrder;
    }
  }
});

export const {
  createTask,
  updateTask,
  deleteTask,
  createColumn,
  updateColumn,
  deleteColumn,
  moveTask,
  reorderColumns
} = boardSlice.actions;


export default undoable(boardSlice.reducer);
