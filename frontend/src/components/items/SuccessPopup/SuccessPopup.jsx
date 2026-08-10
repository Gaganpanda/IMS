import Modal from "../../common/Modal/Modal";
import "./SuccessPopup.css";

/**
 * SuccessPopup
 * Props:
 *  - open       : boolean
 *  - onClose    : () => void
 *  - itemName   : string
 *  - onViewItem : () => void
 *  - onAddAnother : () => void
 */
export default function SuccessPopup({ open, onClose, itemName, onViewItem, onAddAnother }) {
  return (
    <Modal open={open} onClose={onClose} size="sm" hideClose>
      <div className="success-popup">
        {/* Animated checkmark */}
        <div className="success-popup__icon-wrap">
          <div className="success-popup__circle">
            <svg className="success-popup__check" viewBox="0 0 52 52">
              <circle className="success-popup__circle-bg" cx="26" cy="26" r="25" fill="none" />
              <path className="success-popup__check-path" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
            </svg>
          </div>
        </div>

        <h3 className="success-popup__title">Item Added Successfully!</h3>
        <p className="success-popup__msg">
          <strong>{itemName}</strong> has been added to the system.
        </p>

        <div className="success-popup__actions">
          {onAddAnother && (
            <button className="btn btn--secondary" onClick={onAddAnother}>
              Add Another
            </button>
          )}
          {onViewItem && (
            <button className="btn btn--primary" onClick={onViewItem}>
              View Item
            </button>
          )}
          {!onViewItem && (
            <button className="btn btn--primary" onClick={onClose}>
              Done
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
