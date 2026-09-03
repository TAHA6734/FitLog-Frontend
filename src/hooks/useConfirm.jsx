import { useState, useCallback } from 'react';
import ConfirmDialog from '../components/ui/ConfirmDialog';

export function useConfirm() {
const [state, setState] = useState(null); // { title, message, danger, resolve }

const confirm = useCallback((options) => {
return new Promise((resolve) => {
setState({ ...options, resolve });
});
}, []);

const handleConfirm = () => {
state?.resolve(true);
setState(null);
};

const handleCancel = () => {
state?.resolve(false);
setState(null);
};

const ConfirmDialogElement = (
<ConfirmDialog
isOpen={!!state}
title={state?.title || 'Emin misin?'}
message={state?.message || ''}
confirmLabel={state?.confirmLabel}
cancelLabel={state?.cancelLabel}
danger={state?.danger !== false}
onConfirm={handleConfirm}
onCancel={handleCancel}
/>
);

return { confirm, ConfirmDialogElement };
}











