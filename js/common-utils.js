// Shared UI utilities for modals, toasts and safe element creation
(function(global){
  'use strict';

  function createElementSafe(tag, options = {}) {
    const el = document.createElement(tag);
    if (options.className) el.className = options.className;
    if (options.attrs) {
      Object.keys(options.attrs).forEach(k => el.setAttribute(k, options.attrs[k]));
    }
    if (options.text) el.textContent = options.text;
    return el;
  }

  function showNotification(message, type = 'info', duration = 3000) {
    const toast = createElementSafe('div', { className: `toast toast-${type}`, text: message });
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);
    // allow CSS transitions to run
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, duration);
    return toast;
  }

  function showModal(contentNode, opts = {}) {
    const modal = createElementSafe('div', { className: 'modal' });
    const dialog = createElementSafe('div', { className: 'modal-content' });
    if (typeof contentNode === 'string') dialog.innerHTML = contentNode;
    else dialog.appendChild(contentNode);
    modal.appendChild(dialog);
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
    document.body.appendChild(modal);
    // allow focus
    dialog.setAttribute('tabindex', '-1');
    dialog.focus();
    return modal;
  }

  function showConfirmationModal({ title = 'Confirm', message = '', confirmText = 'OK', cancelText = 'Cancel', onConfirm = null }) {
    const container = createElementSafe('div');
    const h = createElementSafe('h3', { text: title });
    const p = createElementSafe('p', { text: message });
    const actions = createElementSafe('div', { className: 'modal-actions' });
    const btnConfirm = createElementSafe('button', { className: 'btn btn-primary', text: confirmText });
    const btnCancel = createElementSafe('button', { className: 'btn btn-secondary', text: cancelText });
    actions.appendChild(btnConfirm);
    actions.appendChild(btnCancel);
    container.appendChild(h);
    container.appendChild(p);
    container.appendChild(actions);

    const modal = showModal(container);
    btnCancel.addEventListener('click', () => modal.remove());
    btnConfirm.addEventListener('click', () => {
      try { if (typeof onConfirm === 'function') onConfirm(); } finally { modal.remove(); }
    });
    return modal;
  }

  // Export
  global.CommonUtils = {
    createElementSafe,
    showNotification,
    showModal,
    showConfirmationModal
  };

})(window);
