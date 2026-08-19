import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchItemByIdAsync, clearSelectedItem } from "../../redux/slices/itemSlice";
import EditItemForm from "../../components/items/EditItemForm/EditItemForm";
import Loader from "../../components/common/Loader/Loader";
import Icon from "../../components/common/Icon/Icon";
import "./EditItem.css";

export default function EditItem() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const dispatch   = useDispatch();
  const { selectedItem, detailLoading } = useSelector((s) => s.items);

  useEffect(() => {
    dispatch(fetchItemByIdAsync(id));
    return () => dispatch(clearSelectedItem());
  }, [id, dispatch]);

  if (detailLoading || !selectedItem) return <Loader variant="page" text="Loading item..." />;

  return (
    <div className="edit-item-page animate-fade-in-up">
      {/* Breadcrumb — the only page-level wayfinding; title/subtitle already live in the navbar */}
      <nav className="edit-item-page__breadcrumb">
        <span className="edit-item-page__crumb-link" onClick={() => navigate("/items")}>
          <Icon name="box" size={13} strokeWidth={2} /> Items
        </span>
        <Icon name="forward" size={12} strokeWidth={2.5} className="edit-item-page__crumb-arrow" />
        <span className="edit-item-page__crumb-link" onClick={() => navigate(`/items/${id}`)}>
          {selectedItem.name}
        </span>
        <Icon name="forward" size={12} strokeWidth={2.5} className="edit-item-page__crumb-arrow" />
        <span className="edit-item-page__crumb-cur">Edit</span>
      </nav>

      <EditItemForm
        item={selectedItem}
        onCancel={() => navigate(`/items/${id}`)}
        onSuccess={() => navigate(`/items/${id}`)}
      />
    </div>
  );
}