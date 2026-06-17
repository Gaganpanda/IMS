import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchItemByIdAsync, clearSelectedItem } from "../../redux/slices/itemSlice";
import EditItemForm from "../../components/items/EditItemForm/EditItemForm";
import Loader from "../../components/common/Loader/Loader";
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
    <div className="edit-item-page">
      {/* Breadcrumb */}
      <nav className="edit-item-page__breadcrumb">
        <span className="edit-item-page__crumb-link" onClick={() => navigate("/items")}>Items</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
          style={{ width:13, height:13, color:"#cbd5e1" }}>
          <polyline points="9 18 15 12 9 6"/>
        </svg>
        <span className="edit-item-page__crumb-link" onClick={() => navigate(`/items/${id}`)}>
          {selectedItem.name}
        </span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
          style={{ width:13, height:13, color:"#cbd5e1" }}>
          <polyline points="9 18 15 12 9 6"/>
        </svg>
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