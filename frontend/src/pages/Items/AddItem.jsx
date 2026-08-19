import { useNavigate } from "react-router-dom";
import AddItemForm from "../../components/items/AddItemForm/AddItemForm";
import Icon from "../../components/common/Icon/Icon";
import "./AddItem.css";

export default function AddItem() {
  const navigate = useNavigate();

  return (
    <div className="add-item-page animate-fade-in-up">
      {/* Breadcrumb — the only page-level wayfinding; title/subtitle already live in the navbar */}
      <nav className="add-item-page__breadcrumb">
        <span className="add-item-page__crumb-link" onClick={() => navigate("/items")}>
          <Icon name="box" size={13} strokeWidth={2} /> Items
        </span>
        <Icon name="forward" size={12} strokeWidth={2.5} className="add-item-page__crumb-arrow" />
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