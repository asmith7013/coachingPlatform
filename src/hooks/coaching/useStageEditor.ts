import { useState, useCallback } from "react";

export interface UseStageEditorOptions<T> {
  data: T;
  onChange: (data: T) => void;
  isCompleteCheck: (data: T) => boolean;
}

export function useStageEditor<T>({
  data,
  onChange,
  isCompleteCheck,
}: UseStageEditorOptions<T>) {
  const [isEditing, setIsEditing] = useState(!isCompleteCheck(data));

  const isComplete = isCompleteCheck(data);

  const handleEdit = useCallback(() => setIsEditing(true), []);

  const handleCancel = useCallback(() => setIsEditing(false), []);

  const handleSave = useCallback(
    (newData: T) => {
      onChange(newData);
      setIsEditing(false);
    },
    [onChange],
  );

  return {
    isEditing,
    isComplete,
    handleEdit,
    handleCancel,
    handleSave,
  };
}
