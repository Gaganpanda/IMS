import { useNavigate } from "react-router-dom";
import AddItemForm from "../../components/items/AddItemForm/AddItemForm";
import "./AddItem.css";

export default function AddItem() {
  const navigate = useNavigate();

  return (
    <div className="add-item-page">
      {/* Breadcrumb */}
      <nav className="add-item-page__breadcrumb">
        <span className="add-item-page__crumb-link" onClick={() => navigate("/items")}>Items</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" className="add-item-page__crumb-arrow">
          <polyline points="9 18 15 12 9 6" />
        </svg>
        <span className="add-item-page__crumb-current">Add New Item</span>
      </nav>

      {/* Form */}
      <AddItemForm
        onCancel={() => navigate("/items")}
        onSuccess={(id) => {
          if (id) navigate(`/items/${id}`);
          else navigate("/items");
        }}
      />
    </div>
  );
}