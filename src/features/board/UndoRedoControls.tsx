import { useDispatch, useSelector } from 'react-redux';
import { ActionCreators as UndoActionCreators } from 'redux-undo';
import type { RootState } from '../../store';

const UndoRedoControls = () => {
  const dispatch = useDispatch();
  const canUndo = useSelector((state: RootState) => state.board.past.length > 0);
  const canRedo = useSelector((state: RootState) => state.board.future.length > 0);

  return (
    <div className="flex gap-2 p-2">
      <button
        onClick={() => dispatch(UndoActionCreators.undo())}
        disabled={!canUndo}
        className="bg-gray-700 text-white px-3 py-1 rounded disabled:opacity-50"
      >
        ⬅️ Undo
      </button>
      <button
        onClick={() => dispatch(UndoActionCreators.redo())}
        disabled={!canRedo}
        className="bg-gray-700 text-white px-3 py-1 rounded disabled:opacity-50"
      >
        ➡️ Redo
      </button>
    </div>
  );
};

export default UndoRedoControls;
